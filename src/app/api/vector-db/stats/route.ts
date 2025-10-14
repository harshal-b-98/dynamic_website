/**
 * Vector Database Statistics API
 */

import { NextResponse } from 'next/server'
import { vectorDB } from '@/lib/vector-db'

/**
 * GET /api/vector-db/stats
 *
 * Get vector database statistics
 */
export async function GET() {
  try {
    const stats = await vectorDB.getStats()

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
