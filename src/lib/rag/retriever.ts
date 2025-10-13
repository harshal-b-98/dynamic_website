/**
 * RAG Retrieval Service
 *
 * Retrieves relevant content from vector database based on semantic similarity
 * with query embedding, filtering, and reranking capabilities.
 */

import { generateEmbedding } from '../embeddings'
import { vectorDB, type SearchResult, type ContentType } from '../vector-db'

export interface RetrievalOptions {
  topK?: number                    // Number of results to return (default: 10)
  similarityThreshold?: number     // Minimum similarity score (default: 0.7)
  contentTypes?: ContentType[]     // Filter by content types
  metadata?: Record<string, any>   // Additional metadata filters
  rerank?: boolean                 // Apply reranking (default: false)
  expandResults?: boolean          // Fetch additional results for reranking (default: true)
}

export interface RetrievalResult {
  id: string
  contentId: string
  contentType: ContentType
  contentText: string
  contentTitle?: string
  metadata: Record<string, any>
  similarity: number
  rank: number                     // Position after reranking (if applied)
}

export interface RetrievalResponse {
  query: string
  results: RetrievalResult[]
  count: number
  processingTime: number
  fromCache: boolean
}

/**
 * RAG Retriever Class
 */
export class RAGRetriever {
  private cache = new Map<string, { results: RetrievalResult[]; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Retrieve relevant content for a query
   */
  async retrieve(
    query: string,
    options: RetrievalOptions = {}
  ): Promise<RetrievalResponse> {
    const startTime = Date.now()

    // Check cache
    const cacheKey = this.getCacheKey(query, options)
    const cached = this.getFromCache(cacheKey)

    if (cached) {
      return {
        query,
        results: cached,
        count: cached.length,
        processingTime: Date.now() - startTime,
        fromCache: true
      }
    }

    // Default options
    const {
      topK = 10,
      similarityThreshold = 0.7,
      contentTypes,
      rerank = false,
      expandResults = true
    } = options

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query)

    // Determine how many results to fetch
    // If reranking, fetch 2-3x more results for better candidate pool
    const fetchCount = rerank && expandResults ? topK * 3 : topK

    // Search vector database
    let searchResults: SearchResult[] = []

    if (contentTypes && contentTypes.length > 0) {
      // Search each content type and combine results
      const typeResults = await Promise.all(
        contentTypes.map(contentType =>
          vectorDB.search(queryEmbedding, {
            threshold: similarityThreshold,
            limit: fetchCount,
            contentType
          })
        )
      )

      // Merge and sort by similarity
      searchResults = typeResults
        .flat()
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, fetchCount)
    } else {
      // Search all content types
      searchResults = await vectorDB.search(queryEmbedding, {
        threshold: similarityThreshold,
        limit: fetchCount
      })
    }

    // Convert to retrieval results
    let results: RetrievalResult[] = searchResults.map((result, index) => ({
      id: result.id,
      contentId: result.content_id,
      contentType: result.content_type,
      contentText: result.content_text,
      contentTitle: result.content_title,
      metadata: result.metadata,
      similarity: result.similarity,
      rank: index + 1
    }))

    // Apply reranking if enabled
    if (rerank && results.length > 0) {
      results = await this.rerankResults(query, results)
    }

    // Trim to topK
    results = results.slice(0, topK)

    // Cache results
    this.setInCache(cacheKey, results)

    const processingTime = Date.now() - startTime

    return {
      query,
      results,
      count: results.length,
      processingTime,
      fromCache: false
    }
  }

  /**
   * Rerank results using cross-encoder or LLM-based scoring
   * This provides a more accurate relevance ranking than pure cosine similarity
   */
  private async rerankResults(
    query: string,
    results: RetrievalResult[]
  ): Promise<RetrievalResult[]> {
    // Simple reranking based on multiple factors
    // In production, consider using a cross-encoder model or LLM for better results

    const rerankedResults = results.map(result => {
      let rerankScore = result.similarity

      // Boost exact keyword matches
      const queryLower = query.toLowerCase()
      const textLower = result.contentText.toLowerCase()

      if (textLower.includes(queryLower)) {
        rerankScore += 0.1
      }

      // Boost title matches (if title exists)
      if (result.contentTitle) {
        const titleLower = result.contentTitle.toLowerCase()
        if (titleLower.includes(queryLower)) {
          rerankScore += 0.15
        }
      }

      // Boost shorter, more focused content
      const lengthPenalty = Math.min(result.contentText.length / 2000, 0.1)
      rerankScore -= lengthPenalty

      // Boost recent content (if timestamp exists)
      if (result.metadata.timestamp) {
        const age = Date.now() - new Date(result.metadata.timestamp).getTime()
        const ageInDays = age / (1000 * 60 * 60 * 24)
        if (ageInDays < 30) {
          rerankScore += 0.05
        }
      }

      return {
        ...result,
        similarity: rerankScore
      }
    })

    // Sort by reranked score and update ranks
    return rerankedResults
      .sort((a, b) => b.similarity - a.similarity)
      .map((result, index) => ({
        ...result,
        rank: index + 1
      }))
  }

  /**
   * Get cache key for query and options
   */
  private getCacheKey(query: string, options: RetrievalOptions): string {
    return JSON.stringify({ query, options })
  }

  /**
   * Get results from cache if not expired
   */
  private getFromCache(key: string): RetrievalResult[] | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const age = Date.now() - cached.timestamp
    if (age > this.cacheTimeout) {
      this.cache.delete(key)
      return null
    }

    return cached.results
  }

  /**
   * Store results in cache
   */
  private setInCache(key: string, results: RetrievalResult[]): void {
    // Limit cache size
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      results,
      timestamp: Date.now()
    })
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout
    }
  }
}

// Singleton instance
let retrieverInstance: RAGRetriever | null = null

/**
 * Get or create singleton retriever instance
 */
export function getRAGRetriever(): RAGRetriever {
  if (!retrieverInstance) {
    retrieverInstance = new RAGRetriever()
  }
  return retrieverInstance
}

/**
 * Retrieve relevant content (convenience function)
 */
export async function retrieveRelevantContent(
  query: string,
  options?: RetrievalOptions
): Promise<RetrievalResponse> {
  const retriever = getRAGRetriever()
  return retriever.retrieve(query, options)
}
