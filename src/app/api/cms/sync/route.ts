/**
 * CMS Sync API
 *
 * Endpoints for managing CMS sync jobs and operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSyncPipeline, getSyncTracker, type CMSContent } from '@/lib/cms'

/**
 * POST /api/cms/sync
 *
 * Trigger a manual sync operation
 *
 * Body:
 * {
 *   type: 'full_reindex' | 'batch'
 *   contents: CMSContent[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.type || !['full_reindex', 'batch'].includes(body.type)) {
      return NextResponse.json(
        { error: 'type must be "full_reindex" or "batch"' },
        { status: 400 }
      )
    }

    if (!body.contents || !Array.isArray(body.contents)) {
      return NextResponse.json(
        { error: 'contents array is required' },
        { status: 400 }
      )
    }

    const pipeline = getSyncPipeline()

    if (body.type === 'full_reindex') {
      const job = await pipeline.fullReindex(body.contents)

      return NextResponse.json({
        success: true,
        message: 'Full reindex started',
        job
      })
    } else {
      const job = await pipeline.processBatch(
        body.contents,
        'update',
        { continueOnError: true }
      )

      return NextResponse.json({
        success: true,
        message: 'Batch sync completed',
        job
      })
    }
  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cms/sync
 *
 * List sync jobs
 *
 * Query params:
 * - status: Filter by job status
 * - limit: Number of jobs to return (default: 50)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const tracker = getSyncTracker()
    const jobs = await tracker.listJobs({
      status: status as any,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      jobs,
      count: jobs.length,
      limit,
      offset
    })
  } catch (error) {
    console.error('List jobs error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list jobs' },
      { status: 500 }
    )
  }
}
