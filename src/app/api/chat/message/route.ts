import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    // Get or create session
    const cookieStore = await cookies()
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

    // Initialize session if new
    if (!session.sessionId) {
      session.sessionId = uuidv4()
      session.createdAt = Date.now()
      await session.save()
    }

    // Parse request body
    const { message, conversationId } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    let activeConversationId = conversationId

    // Create new conversation if none exists
    if (!activeConversationId) {
      const { data: conversation, error: convError } = await supabaseAdmin
        .from('dyn_conversations')
        .insert({
          session_id: session.sessionId,
          user_id: session.userId || null,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          metadata: {}
        })
        .select()
        .single()

      if (convError) {
        console.error('Error creating conversation:', convError)
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        )
      }

      activeConversationId = conversation.id
      session.conversationId = activeConversationId
      await session.save()
    }

    // Store user message
    const { data: userMessage, error: userMsgError } = await supabaseAdmin
      .from('dyn_messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'user',
        content: message,
        metadata: {}
      })
      .select()
      .single()

    if (userMsgError) {
      console.error('Error storing user message:', userMsgError)
      return NextResponse.json(
        { error: 'Failed to store message' },
        { status: 500 }
      )
    }

    // Generate AI response (placeholder for now, will integrate with Anthropic in next story)
    const aiResponse = `Thank you for your message: "${message}". I'm currently being set up to provide intelligent responses. Full AI capabilities will be available in the next development phase.`

    // Store assistant message
    const { data: assistantMessage, error: assistantMsgError } = await supabaseAdmin
      .from('dyn_messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'assistant',
        content: aiResponse,
        metadata: {}
      })
      .select()
      .single()

    if (assistantMsgError) {
      console.error('Error storing assistant message:', assistantMsgError)
      return NextResponse.json(
        { error: 'Failed to store response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      conversationId: activeConversationId,
      userMessage,
      assistantMessage,
      sessionId: session.sessionId
    })
  } catch (error) {
    console.error('Error in chat message route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
