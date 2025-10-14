/**
 * Embedding Statistics API
 *
 * Endpoint for retrieving embedding generation statistics and costs
 */

import { NextResponse } from 'next/server'
import { getEmbeddingStats } from '@/lib/embeddings'

/**
 * GET /api/embeddings/stats
 *
 * Get embedding generator statistics including token usage and costs
 */
export async function GET() {
  try {
    const stats = getEmbeddingStats()

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get stats' },
      { status: 500 }
    )
  }
}
