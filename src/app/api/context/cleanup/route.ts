/**
 * Context Cleanup API - TTL Management
 *
 * This endpoint cleans up expired contexts based on TTL.
 * In production, this should be called by a cron job or scheduled task.
 */

import { NextRequest, NextResponse } from 'next/server'
import { ContextManager } from '@/lib/context-manager'

/**
 * POST /api/context/cleanup
 *
 * Cleanup expired contexts
 * Body: {
 *   ttlHours?: number (default: 24)
 *   authToken?: string (for cron job authentication)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { ttlHours = 24, authToken } = body

    // Simple auth for cron jobs (in production, use proper auth)
    const expectedToken = process.env.CLEANUP_AUTH_TOKEN

    if (expectedToken && authToken !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Run cleanup
    const deletedCount = await ContextManager.cleanupExpiredContexts(ttlHours)

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} expired contexts`
    })
  } catch (error) {
    console.error('Error during cleanup:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cleanup failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/context/cleanup
 *
 * Get cleanup status (for monitoring)
 */
export async function GET(request: NextRequest) {
  try {
    // This could return statistics about contexts that need cleanup
    return NextResponse.json({
      success: true,
      message: 'Cleanup endpoint is operational',
      recommendation: 'Run POST /api/context/cleanup to clean expired contexts'
    })
  } catch (error) {
    console.error('Error checking cleanup status:', error)
    return NextResponse.json(
      { error: 'Failed to check cleanup status' },
      { status: 500 }
    )
  }
}
