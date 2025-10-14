/**
 * Vector Database Health Check API
 */

import { NextResponse } from 'next/server'
import { vectorDB } from '@/lib/vector-db'

/**
 * GET /api/vector-db/health
 *
 * Check vector database health and connection
 */
export async function GET() {
  try {
    const health = await vectorDB.healthCheck()

    return NextResponse.json({
      success: health.isHealthy,
      ...health
    }, {
      status: health.isHealthy ? 200 : 503
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      success: false,
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Health check failed'
    }, { status: 503 })
  }
}
