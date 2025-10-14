/**
 * Vector Database Embeddings API
 *
 * CRUD operations for content embeddings
 */

import { NextRequest, NextResponse } from 'next/server'
import { vectorDB } from '@/lib/vector-db'
import type { CreateEmbeddingInput, UpdateEmbeddingInput } from '@/lib/vector-db'

/**
 * GET /api/vector-db/embeddings
 *
 * List embeddings with optional filters
 * Query params:
 *   - limit: number (default: 50)
 *   - offset: number (default: 0)
 *   - contentType: string (optional)
 *   - contentId: string (optional - get by content ID)
 *   - id: string (optional - get by ID)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const contentId = searchParams.get('contentId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const contentType = searchParams.get('contentType')

    // Get by ID
    if (id) {
      const embedding = await vectorDB.getEmbedding(id)
      if (!embedding) {
        return NextResponse.json(
          { error: 'Embedding not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, embedding })
    }

    // Get by content ID
    if (contentId) {
      const embeddings = await vectorDB.getEmbeddingsByContentId(contentId)
      return NextResponse.json({
        success: true,
        embeddings,
        count: embeddings.length
      })
    }

    // List embeddings
    const embeddings = await vectorDB.listEmbeddings({
      limit,
      offset,
      contentType: contentType as any
    })

    return NextResponse.json({
      success: true,
      embeddings,
      count: embeddings.length,
      limit,
      offset
    })
  } catch (error) {
    console.error('Get embeddings error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get embeddings' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/vector-db/embeddings
 *
 * Create a new embedding
 * Body: CreateEmbeddingInput
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const input = body as CreateEmbeddingInput

    // Validate input
    if (!input.content_id || !input.content_type || !input.content_text || !input.embedding) {
      return NextResponse.json(
        { error: 'content_id, content_type, content_text, and embedding are required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(input.embedding) || input.embedding.length !== 1536) {
      return NextResponse.json(
        { error: 'embedding must be an array of 1536 numbers' },
        { status: 400 }
      )
    }

    // Create embedding
    const embedding = await vectorDB.createEmbedding(input)

    return NextResponse.json({
      success: true,
      embedding
    }, { status: 201 })
  } catch (error) {
    console.error('Create embedding error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create embedding' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/vector-db/embeddings
 *
 * Update an existing embedding
 * Body: { id: string, updates: UpdateEmbeddingInput }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, updates } = body as {
      id: string
      updates: UpdateEmbeddingInput
    }

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    // Update embedding
    const embedding = await vectorDB.updateEmbedding(id, updates)

    return NextResponse.json({
      success: true,
      embedding
    })
  } catch (error) {
    console.error('Update embedding error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update embedding' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/vector-db/embeddings
 *
 * Delete an embedding
 * Query params:
 *   - id: string (delete by ID)
 *   - contentId: string (delete all by content ID)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const contentId = searchParams.get('contentId')

    if (!id && !contentId) {
      return NextResponse.json(
        { error: 'id or contentId is required' },
        { status: 400 }
      )
    }

    // Delete by ID or content ID
    if (id) {
      await vectorDB.deleteEmbedding(id)
    } else if (contentId) {
      await vectorDB.deleteEmbeddingsByContentId(contentId)
    }

    return NextResponse.json({
      success: true,
      message: 'Embedding(s) deleted successfully'
    })
  } catch (error) {
    console.error('Delete embedding error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete embedding' },
      { status: 500 }
    )
  }
}
