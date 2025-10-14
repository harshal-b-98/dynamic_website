/**
 * RAG Context Builder API
 *
 * Endpoint for building LLM context from retrieval results
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildContext, type RetrievalResult, type ContextBuilderOptions } from '@/lib/rag'

/**
 * POST /api/rag/context
 *
 * Build optimized context from retrieval results for LLM prompts
 *
 * Body:
 * {
 *   results: RetrievalResult[]
 *   query: string
 *   options?: {
 *     maxTokens?: number
 *     includeMetadata?: boolean
 *     deduplicate?: boolean
 *     format?: 'plain' | 'markdown'
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

    if (!body.results || !Array.isArray(body.results)) {
      return NextResponse.json(
        { error: 'results is required and must be an array' },
        { status: 400 }
      )
    }

    // Parse options
    const options: ContextBuilderOptions = body.options || {}

    // Build context
    const result = buildContext(
      body.results as RetrievalResult[],
      body.query,
      options
    )

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Context builder error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to build context',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
