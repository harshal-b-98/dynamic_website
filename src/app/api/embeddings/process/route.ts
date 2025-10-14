/**
 * Content Embedding Process API
 *
 * Endpoint for processing content through the embedding pipeline
 */

import { NextRequest, NextResponse } from 'next/server'
import { processContent, processBatch, type PipelineInput } from '@/lib/embeddings'

/**
 * POST /api/embeddings/process
 *
 * Process single or multiple content items through embedding pipeline
 *
 * Body (single):
 * {
 *   contentId: string
 *   contentType: string
 *   content: string
 *   title?: string
 *   sourceUrl?: string
 *   metadata?: object
 *   options?: {
 *     chunkSize?: number
 *     chunkOverlap?: number
 *     deduplicateExisting?: boolean
 *   }
 * }
 *
 * Body (batch):
 * {
 *   items: PipelineInput[]
 *   options?: { ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    if (!body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      )
    }

    // Check if batch processing
    if (body.items && Array.isArray(body.items)) {
      // Batch processing
      if (body.items.length === 0) {
        return NextResponse.json(
          { error: 'items array cannot be empty' },
          { status: 400 }
        )
      }

      // Validate each item
      for (const item of body.items) {
        const validation = validatePipelineInput(item)
        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error },
            { status: 400 }
          )
        }
      }

      const results = await processBatch(body.items, body.options)

      return NextResponse.json({
        success: true,
        results,
        summary: {
          totalItems: results.length,
          totalChunks: results.reduce((sum, r) => sum + r.chunksCreated, 0),
          totalEmbeddings: results.reduce((sum, r) => sum + r.embeddingsStored, 0),
          totalTokens: results.reduce((sum, r) => sum + r.tokensUsed, 0),
          totalCost: results.reduce((sum, r) => sum + r.cost, 0),
          totalTime: results.reduce((sum, r) => sum + r.processingTime, 0)
        }
      })
    } else {
      // Single item processing
      const validation = validatePipelineInput(body)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        )
      }

      const result = await processContent(body as PipelineInput, body.options)

      return NextResponse.json({
        success: true,
        result
      })
    }
  } catch (error) {
    console.error('Embedding process error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process content',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Validate pipeline input
 */
function validatePipelineInput(input: any): { valid: boolean; error?: string } {
  if (!input.contentId) {
    return { valid: false, error: 'contentId is required' }
  }

  if (!input.contentType) {
    return { valid: false, error: 'contentType is required' }
  }

  if (!input.content || typeof input.content !== 'string') {
    return { valid: false, error: 'content is required and must be a string' }
  }

  if (input.content.trim().length === 0) {
    return { valid: false, error: 'content cannot be empty' }
  }

  return { valid: true }
}
