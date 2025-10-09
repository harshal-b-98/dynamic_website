/**
 * Page Generation Caching Layer
 *
 * In-memory cache for generated page specifications to improve performance
 * and reduce LLM API calls for common queries.
 *
 * For production, consider Redis or similar distributed cache.
 */

import { PageSpecification } from './page-generation'

interface CacheEntry {
  pageSpec: PageSpecification
  timestamp: Date
  hits: number
}

// Cache configuration
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes
const MAX_CACHE_SIZE = 100 // Maximum number of entries

// In-memory cache
const cache = new Map<string, CacheEntry>()

/**
 * Generate cache key from query and intent
 */
export function generateCacheKey(query: string, intent: string, persona?: string): string {
  const normalizedQuery = query.toLowerCase().trim()
  const key = persona
    ? `${intent}:${persona}:${normalizedQuery}`
    : `${intent}:${normalizedQuery}`

  // Use simple string key (for production, consider hashing for privacy)
  return key
}

/**
 * Get page specification from cache
 */
export function getCachedPage(
  query: string,
  intent: string,
  persona?: string
): PageSpecification | null {
  const key = generateCacheKey(query, intent, persona)
  const entry = cache.get(key)

  if (!entry) {
    return null
  }

  // Check if entry is expired
  const age = Date.now() - entry.timestamp.getTime()
  if (age > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }

  // Increment hit counter
  entry.hits++

  // Return a deep clone to prevent mutations
  return JSON.parse(JSON.stringify(entry.pageSpec))
}

/**
 * Cache a generated page specification
 */
export function cachePage(
  query: string,
  intent: string,
  pageSpec: PageSpecification,
  persona?: string
): void {
  const key = generateCacheKey(query, intent, persona)

  // Enforce cache size limit (LRU-style eviction)
  if (cache.size >= MAX_CACHE_SIZE && !cache.has(key)) {
    evictLeastRecentlyUsed()
  }

  // Store entry
  cache.set(key, {
    pageSpec: JSON.parse(JSON.stringify(pageSpec)), // Deep clone
    timestamp: new Date(),
    hits: 0
  })
}

/**
 * Evict least recently used cache entries
 */
function evictLeastRecentlyUsed(): void {
  if (cache.size === 0) return

  // Find entry with lowest hits and oldest timestamp
  let evictKey: string | null = null
  let lowestScore = Infinity

  for (const [key, entry] of cache.entries()) {
    // Score based on age and hits (lower is worse)
    const ageMinutes = (Date.now() - entry.timestamp.getTime()) / (60 * 1000)
    const score = entry.hits / (ageMinutes + 1) // Avoid division by zero

    if (score < lowestScore) {
      lowestScore = score
      evictKey = key
    }
  }

  if (evictKey) {
    cache.delete(evictKey)
  }
}

/**
 * Clear expired entries from cache
 */
export function clearExpiredEntries(): void {
  const now = Date.now()

  for (const [key, entry] of cache.entries()) {
    const age = now - entry.timestamp.getTime()
    if (age > CACHE_TTL_MS) {
      cache.delete(key)
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number
  maxSize: number
  ttlMinutes: number
  entries: Array<{
    key: string
    age: number
    hits: number
  }>
} {
  const now = Date.now()
  const entries = Array.from(cache.entries()).map(([key, entry]) => ({
    key: key.substring(0, 50) + (key.length > 50 ? '...' : ''), // Truncate long keys
    age: Math.floor((now - entry.timestamp.getTime()) / 1000), // seconds
    hits: entry.hits
  }))

  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    ttlMinutes: CACHE_TTL_MS / (60 * 1000),
    entries: entries.sort((a, b) => b.hits - a.hits) // Sort by hits descending
  }
}

/**
 * Clear entire cache
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Warmup cache with common queries
 * (Call this on application startup if you have known common queries)
 */
export async function warmupCache(commonQueries: Array<{
  query: string
  intent: string
  persona?: string
  pageSpec: PageSpecification
}>): Promise<void> {
  for (const { query, intent, pageSpec, persona } of commonQueries) {
    cachePage(query, intent, pageSpec, persona)
  }

  console.log(`Cache warmed up with ${commonQueries.length} entries`)
}

// Periodic cleanup of expired entries (runs every 10 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const beforeSize = cache.size
    clearExpiredEntries()
    const afterSize = cache.size

    if (beforeSize !== afterSize) {
      console.log(`Cache cleanup: removed ${beforeSize - afterSize} expired entries`)
    }
  }, 10 * 60 * 1000)
}
