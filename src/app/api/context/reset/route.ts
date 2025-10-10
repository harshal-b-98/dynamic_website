/**
 * Context Reset API
 */

import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { ContextManager } from '@/lib/context-manager'
import { ContextResetOptions } from '@/lib/context-types'

/**
 * POST /api/context/reset
 *
 * Reset conversation context
 * Body: {
 *   conversationId: string
 *   options?: ContextResetOptions
 * }
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { conversationId, options } = body as {
      conversationId?: string
      options?: ContextResetOptions
    }

    // Create context manager
    const contextManager = new ContextManager(session.sessionId, session.userId)

    // If createNewConversation is true, create new context
    if (options?.createNewConversation) {
      const newContext = await contextManager.createContext('New Conversation')
      session.conversationId = newContext.conversationId
      await session.save()

      return NextResponse.json({
        success: true,
        context: newContext,
        message: 'New conversation created'
      })
    }

    // Otherwise reset existing conversation
    if (!conversationId && !session.conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    const targetConversationId = conversationId || session.conversationId!

    // Reset context
    const resetContext = await contextManager.resetContext(targetConversationId, options)

    return NextResponse.json({
      success: true,
      context: resetContext,
      message: 'Context reset successfully'
    })
  } catch (error) {
    console.error('Error resetting context:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset context' },
      { status: 500 }
    )
  }
}
