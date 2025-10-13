/**
 * Multi-KB Retrieval API
 *
 * Endpoint for retrieving from multiple knowledge bases in parallel
 */

import { NextRequest, NextResponse } from 'next/server'
import { retrieveFromMultipleKBs, getRetrievalStats } from '@/lib/knowledge-base/multi-kb-retriever'

/**
 * POST /api/knowledge-base/multi-retrieve
 * Retrieve relevant content from multiple KBs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, intent, threshold, guidelinesTopK, personasTopK, productTopK } = body

    // Validate request
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    // Retrieve from multiple KBs
    const result = await retrieveFromMultipleKBs(query, {
      intent,
      threshold,
      guidelinesTopK,
      personasTopK,
      productTopK
    })

    // Get statistics
    const stats = getRetrievalStats(result)

    return NextResponse.json({
      success: true,
      query,
      intent,
      results: {
        guidelines: result.guidelines,
        personas: result.personas,
        product: result.product
      },
      stats,
      weights: result.weights,
      processingTime: result.processingTime
    })
  } catch (error) {
    console.error('Multi-KB retrieval error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Multi-KB retrieval failed'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/knowledge-base/multi-retrieve
 * Get information about multi-KB retrieval
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/knowledge-base/multi-retrieve',
    method: 'POST',
    description: 'Retrieve relevant content from multiple knowledge bases in parallel',
    parameters: {
      query: {
        type: 'string',
        required: true,
        description: 'Search query'
      },
      intent: {
        type: 'string',
        required: false,
        description: 'User intent for KB weighting'
      },
      threshold: {
        type: 'number',
        required: false,
        default: 0.7,
        description: 'Minimum similarity threshold (0-1)'
      },
      guidelinesTopK: {
        type: 'number',
        required: false,
        description: 'Override guidelines KB result count'
      },
      personasTopK: {
        type: 'number',
        required: false,
        description: 'Override personas KB result count'
      },
      productTopK: {
        type: 'number',
        required: false,
        description: 'Override product KB result count'
      }
    },
    knowledgeBases: {
      guidelines: {
        name: 'UI/UX Guidelines',
        description: 'UI component usage, brand voice, design patterns',
        icon: '📐'
      },
      personas: {
        name: 'User Personas',
        description: 'User persona definitions and characteristics',
        icon: '👤'
      },
      product: {
        name: 'Product Knowledge',
        description: 'ConsumerIQ features, capabilities, FAQ',
        icon: '🎯'
      }
    },
    exampleRequest: {
      query: 'What are the main features of ConsumerIQ?',
      intent: 'product_inquiry',
      threshold: 0.7
    }
  })
}
