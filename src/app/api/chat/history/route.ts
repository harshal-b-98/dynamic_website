import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get session
    const cookieStore = await cookies()
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

    if (!session.sessionId) {
      return NextResponse.json(
        { conversations: [], messages: [] },
        { status: 200 }
      )
    }

    // Get conversation ID from query params or session
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId') || session.conversationId

    // If specific conversation requested, get messages for that conversation
    if (conversationId) {
      const { data: messages, error: messagesError } = await supabaseAdmin
        .from('dyn_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Error fetching messages:', messagesError)
        return NextResponse.json(
          { error: 'Failed to fetch messages' },
          { status: 500 }
        )
      }

      // Get conversation details
      const { data: conversation, error: convError } = await supabaseAdmin
        .from('dyn_conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (convError) {
        console.error('Error fetching conversation:', convError)
      }

      return NextResponse.json({
        conversation,
        messages,
        sessionId: session.sessionId
      })
    }

    // Otherwise, get all conversations for this session
    const { data: conversations, error: convsError } = await supabaseAdmin
      .from('dyn_conversations')
      .select('*')
      .eq('session_id', session.sessionId)
      .order('updated_at', { ascending: false })

    if (convsError) {
      console.error('Error fetching conversations:', convsError)
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      conversations,
      sessionId: session.sessionId
    })
  } catch (error) {
    console.error('Error in chat history route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
