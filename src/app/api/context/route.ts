/**
 * Context API - Get and Update Conversation Context
 */

import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { ContextManager } from '@/lib/context-manager'
import { ContextUpdateOptions } from '@/lib/context-types'

/**
 * GET /api/context
 *
 * Get current conversation context
 * Query params:
 *   - conversationId: specific conversation (optional)
 *   - messageLimit: number of recent messages (default: 10)
 *   - pageLimit: number of recent pages (default: 5)
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
    const messageLimit = parseInt(searchParams.get('messageLimit') || '10')
    const pageLimit = parseInt(searchParams.get('pageLimit') || '5')
    const recent = searchParams.get('recent') === 'true'

    // Create context manager
    const contextManager = new ContextManager(session.sessionId, session.userId)

    // Get context
    let context
    if (recent && conversationId) {
      // Get recent context only
      context = await contextManager.getRecentContext(conversationId, {
        messageLimit,
        pageLimit
      })
    } else if (conversationId) {
      // Get full context
      context = await contextManager.getContext(conversationId)
    } else {
      // Get or create new context
      context = await contextManager.getContext()
    }

    return NextResponse.json({
      success: true,
      context
    })
  } catch (error) {
    console.error('Error fetching context:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch context' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/context
 *
 * Update conversation context
 * Body: ContextUpdateOptions
 */
export async function PUT(request: NextRequest) {
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
    const { conversationId, updates } = body as {
      conversationId: string
      updates: ContextUpdateOptions
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    // Create context manager
    const contextManager = new ContextManager(session.sessionId, session.userId)

    // Update context
    const updatedContext = await contextManager.updateContext(conversationId, updates)

    return NextResponse.json({
      success: true,
      context: updatedContext
    })
  } catch (error) {
    console.error('Error updating context:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update context' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/context
 *
 * Create a new conversation context
 * Body: { title?: string }
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
    const { title } = body

    // Create context manager
    const contextManager = new ContextManager(session.sessionId, session.userId)

    // Create new context
    const newContext = await contextManager.createContext(title)

    // Update session
    session.conversationId = newContext.conversationId
    await session.save()

    return NextResponse.json({
      success: true,
      context: newContext
    })
  } catch (error) {
    console.error('Error creating context:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create context' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/context
 *
 * Delete a conversation context
 * Query params:
 *   - conversationId: conversation to delete (required)
 */
export async function DELETE(request: NextRequest) {
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
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    // Create context manager
    const contextManager = new ContextManager(session.sessionId, session.userId)

    // Delete context
    await contextManager.deleteContext(conversationId)

    // Clear from session if it's the active conversation
    if (session.conversationId === conversationId) {
      session.conversationId = undefined
      await session.save()
    }

    return NextResponse.json({
      success: true,
      message: 'Context deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting context:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete context' },
      { status: 500 }
    )
  }
}
