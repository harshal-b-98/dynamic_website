/**
 * RAG Retrieval API
 *
 * Endpoint for retrieving relevant content using semantic search
 */

import { NextRequest, NextResponse } from 'next/server'
import { retrieveRelevantContent, type RetrievalOptions } from '@/lib/rag'

/**
 * POST /api/rag/retrieve
 *
 * Retrieve relevant content for a query
 *
 * Body:
 * {
 *   query: string
 *   options?: {
 *     topK?: number
 *     similarityThreshold?: number
 *     contentTypes?: string[]
 *     rerank?: boolean
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { error: 'query is required and must be a string' },
        { status: 400 }
      )
    }

    if (body.query.trim().length === 0) {
      return NextResponse.json(
        { error: 'query cannot be empty' },
        { status: 400 }
      )
    }

    // Parse options
    const options: RetrievalOptions = body.options || {}

    // Validate options
    if (options.topK !== undefined && (typeof options.topK !== 'number' || options.topK < 1 || options.topK > 100)) {
      return NextResponse.json(
        { error: 'topK must be a number between 1 and 100' },
        { status: 400 }
      )
    }

    if (options.similarityThreshold !== undefined &&
        (typeof options.similarityThreshold !== 'number' ||
         options.similarityThreshold < 0 ||
         options.similarityThreshold > 1)) {
      return NextResponse.json(
        { error: 'similarityThreshold must be a number between 0 and 1' },
        { status: 400 }
      )
    }

    // Perform retrieval
    const response = await retrieveRelevantContent(body.query, options)

    return NextResponse.json({
      success: true,
      ...response
    })
  } catch (error) {
    console.error('RAG retrieval error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve content',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
