/**
 * Delete Content Embeddings API
 *
 * Endpoint for deleting embeddings by content ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { deleteContent } from '@/lib/embeddings'

/**
 * DELETE /api/embeddings/delete?contentId=xxx
 *
 * Delete all embeddings for a specific content ID
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId query parameter is required' },
        { status: 400 }
      )
    }

    await deleteContent(contentId)

    return NextResponse.json({
      success: true,
      message: `All embeddings for content ID "${contentId}" have been deleted`
    })
  } catch (error) {
    console.error('Delete embeddings error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete embeddings' },
      { status: 500 }
    )
  }
}
