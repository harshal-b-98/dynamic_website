/**
 * CMS Sync Job Details API
 *
 * Get detailed information about a specific sync job
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSyncTracker } from '@/lib/cms'

/**
 * GET /api/cms/sync/[jobId]
 *
 * Get sync job details and operations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params

    const tracker = getSyncTracker()
    const job = await tracker.getJob(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Get operations for this job
    const operations = await tracker.getJobOperations(jobId)
    const failedOperations = await tracker.getFailedOperations(jobId)

    return NextResponse.json({
      success: true,
      job,
      operations: {
        all: operations,
        failed: failedOperations
      },
      stats: {
        totalOperations: operations.length,
        completedOperations: operations.filter(op => op.status === 'completed').length,
        failedOperations: failedOperations.length,
        pendingOperations: operations.filter(op => op.status === 'pending').length
      }
    })
  } catch (error) {
    console.error('Get job details error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get job details' },
      { status: 500 }
    )
  }
}
