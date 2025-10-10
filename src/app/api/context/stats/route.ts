/**
 * Context Stats API
 */

import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { ContextManager } from '@/lib/context-manager'

/**
 * GET /api/context/stats
 *
 * Get storage statistics for a conversation
 * Query params:
 *   - conversationId: conversation to get stats for (required)
 */
export async function GET(request: NextRequest) {
  try {
    // Get session
    const cookieStore = await cookies()
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

    if (!session.sessionId) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId') || session.conversationId

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    // Create context manager
    const contextManager = new ContextManager(session.sessionId, session.userId)

    // Get storage stats
    const stats = await contextManager.getStorageStats(conversationId)

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error fetching context stats:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
