/**
 * Vector Database Search API
 *
 * Performs similarity search on embeddings
 */

import { NextRequest, NextResponse } from 'next/server'
import { vectorDB } from '@/lib/vector-db'
import type { SearchOptions } from '@/lib/vector-db'

/**
 * POST /api/vector-db/search
 *
 * Search for similar content using vector similarity
 *
 * Body:
 * {
 *   embedding: number[],
 *   options?: {
 *     threshold?: number,
 *     limit?: number,
 *     contentType?: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { embedding, options } = body as {
      embedding: number[]
      options?: SearchOptions
    }

    if (!embedding || !Array.isArray(embedding)) {
      return NextResponse.json(
        { error: 'embedding is required and must be an array' },
        { status: 400 }
      )
    }

    if (embedding.length !== 1536) {
      return NextResponse.json(
        { error: 'embedding must have 1536 dimensions' },
        { status: 400 }
      )
    }

    // Perform similarity search
    const results = await vectorDB.search(embedding, options)

    return NextResponse.json({
      success: true,
      results,
      count: results.length
    })
  } catch (error) {
    console.error('Vector search error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search vectors' },
      { status: 500 }
    )
  }
}
