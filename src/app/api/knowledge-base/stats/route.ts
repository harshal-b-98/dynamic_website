/**
 * Knowledge Base Statistics API
 *
 * Provides comprehensive statistics about the knowledge base
 */

import { NextRequest, NextResponse } from 'next/server'
import { vectorDB } from '@/lib/vector-db/client'
import { supabaseAdmin } from '@/lib/supabase'
import { INITIAL_CONTENT_SOURCES } from '@/lib/knowledge-base/content-inventory'

export const dynamic = 'force-dynamic'

interface ContentSourceStats {
  sourceId: string
  sourceName: string
  sourceType: string
  priority: string
  embeddingCount: number
  lastUpdated: string
  avgSimilarity?: number
}

interface KnowledgeBaseStats {
  overview: {
    totalEmbeddings: number
    totalSources: number
    sourcesCovered: number
    lastPopulated: string | null
    databaseSizeBytes: number
  }
  sources: ContentSourceStats[]
  health: {
    isHealthy: boolean
    coverage: number // Percentage of sources with embeddings
    recommendations: string[]
  }
}

/**
 * GET /api/knowledge-base/stats
 *
 * Returns comprehensive statistics about the knowledge base
 */
export async function GET(request: NextRequest) {
  try {
    // Get overall vector DB stats
    const vectorStats = await vectorDB.getStats()

    // Get embeddings grouped by content source
    const { data: embeddingsBySource, error: groupError } = await supabaseAdmin
      .from('content_embeddings')
      .select('metadata, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (groupError) {
      throw new Error(`Failed to fetch embeddings: ${groupError.message}`)
    }

    // Group embeddings by source ID
    const sourceMap = new Map<string, {
      count: number
      lastUpdated: string
      metadata: any
    }>()

    for (const embedding of embeddingsBySource || []) {
      const sourceId = embedding.metadata?.sourceId || 'unknown'
      const existing = sourceMap.get(sourceId)

      if (!existing) {
        sourceMap.set(sourceId, {
          count: 1,
          lastUpdated: embedding.updated_at || embedding.created_at,
          metadata: embedding.metadata
        })
      } else {
        existing.count++
        // Keep the most recent update time
        if (embedding.updated_at > existing.lastUpdated) {
          existing.lastUpdated = embedding.updated_at
        }
      }
    }

    // Build source statistics
    const sourceStats: ContentSourceStats[] = []

    for (const contentSource of INITIAL_CONTENT_SOURCES) {
      const stats = sourceMap.get(contentSource.id)

      sourceStats.push({
        sourceId: contentSource.id,
        sourceName: contentSource.name,
        sourceType: contentSource.type,
        priority: contentSource.priority,
        embeddingCount: stats?.count || 0,
        lastUpdated: stats?.lastUpdated || 'Not populated'
      })
    }

    // Calculate coverage
    const sourcesCovered = sourceStats.filter(s => s.embeddingCount > 0).length
    const coverage = (sourcesCovered / INITIAL_CONTENT_SOURCES.length) * 100

    // Generate recommendations
    const recommendations: string[] = []

    if (coverage < 100) {
      const missingSources = sourceStats
        .filter(s => s.embeddingCount === 0)
        .map(s => s.sourceName)

      recommendations.push(
        `Populate missing sources: ${missingSources.join(', ')}`
      )
    }

    if (vectorStats.totalEmbeddings < 100) {
      recommendations.push(
        'Consider adding more content for better coverage'
      )
    }

    const lowCountSources = sourceStats
      .filter(s => s.embeddingCount > 0 && s.embeddingCount < 10)
      .map(s => s.sourceName)

    if (lowCountSources.length > 0) {
      recommendations.push(
        `Low embedding count for: ${lowCountSources.join(', ')} - Consider rechunking with smaller size`
      )
    }

    // Build response
    const stats: KnowledgeBaseStats = {
      overview: {
        totalEmbeddings: vectorStats.totalEmbeddings,
        totalSources: INITIAL_CONTENT_SOURCES.length,
        sourcesCovered,
        lastPopulated: sourceStats
          .filter(s => s.lastUpdated !== 'Not populated')
          .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0]
          ?.lastUpdated || null,
        databaseSizeBytes: 0 // Database size not tracked in current implementation
      },
      sources: sourceStats.sort((a, b) => b.embeddingCount - a.embeddingCount),
      health: {
        isHealthy: coverage >= 75 && vectorStats.totalEmbeddings > 0,
        coverage,
        recommendations
      }
    }

    return NextResponse.json(stats, { status: 200 })

  } catch (error) {
    console.error('Error fetching knowledge base stats:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch knowledge base statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Example response:
 * {
 *   "overview": {
 *     "totalEmbeddings": 156,
 *     "totalSources": 4,
 *     "sourcesCovered": 4,
 *     "lastPopulated": "2025-10-10T12:30:00Z",
 *     "databaseSizeBytes": 524288
 *   },
 *   "sources": [
 *     {
 *       "sourceId": "ciq-faq",
 *       "sourceName": "Consumer IQ FAQ",
 *       "sourceType": "faq",
 *       "priority": "high",
 *       "embeddingCount": 45,
 *       "lastUpdated": "2025-10-10T12:25:00Z"
 *     },
 *     ...
 *   ],
 *   "health": {
 *     "isHealthy": true,
 *     "coverage": 100,
 *     "recommendations": []
 *   }
 * }
 */
