import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { anthropic, DEFAULT_CLAUDE_PARAMS } from '@/lib/claude'
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

    // Classify intent using internal API call
    const intentResponse = await fetch(`${request.nextUrl.origin}/api/intent/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })

    let intent = 'general_conversation'
    let intentMetadata = {}

    if (intentResponse.ok) {
      const intentData = await intentResponse.json()
      intent = intentData.classification.intent
      intentMetadata = {
        intent: intentData.classification.intent,
        confidence: intentData.classification.confidence,
        reasoning: intentData.classification.reasoning,
        entities: intentData.classification.entities
      }
    }

    // Store user message with intent metadata
    const { data: userMessage, error: userMsgError } = await supabaseAdmin
      .from('dyn_messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'user',
        content: message,
        metadata: intentMetadata
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

    // Get conversation history for context (last 10 messages)
    const { data: history } = await supabaseAdmin
      .from('dyn_messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Build conversation history for Claude (reverse to get chronological order)
    const conversationHistory = (history || [])
      .reverse()
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

    // Generate AI response using Claude
    const systemPrompt = `You are ConsumerIQ Assistant, an AI helper for ConsumerIQ - a beverage alcohol analytics platform for U.S. suppliers.

Your role:
- Help users understand ConsumerIQ features and capabilities
- Answer questions about beverage alcohol data, market intelligence, and analytics
- Guide users toward scheduling demos or contacting sales when appropriate
- Be professional, knowledgeable, and concise

Key ConsumerIQ capabilities:
- Natural Language Analytics: Plain English queries for data insights
- Predictive Intelligence: COLA approval forecasting, market trend prediction
- Competitive Launch Tracking: Monitor TTB filings and competitor innovations
- Distributor Performance: Real-time distributor health scoring and analytics
- Trade Spend ROI: Link promotions to field execution and sales outcomes
- Compliance Monitoring: AI-powered label review and approval tracking

Detected intent: ${intent}

Respond helpfully based on the user's intent. Keep responses concise (2-3 paragraphs max).`

    const claudeResponse = await anthropic.messages.create({
      ...DEFAULT_CLAUDE_PARAMS,
      system: systemPrompt,
      messages: conversationHistory as any
    })

    // Validate Claude response structure
    let aiResponse = 'I apologize, I encountered an error generating a response.'

    if (claudeResponse.content && claudeResponse.content.length > 0) {
      const firstContent = claudeResponse.content[0]
      if (firstContent.type === 'text') {
        aiResponse = firstContent.text
      }
    } else {
      console.error('Claude response missing content:', claudeResponse)
    }

    // Store assistant message
    const { data: assistantMessage, error: assistantMsgError } = await supabaseAdmin
      .from('dyn_messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'assistant',
        content: aiResponse,
        metadata: {
          model: DEFAULT_CLAUDE_PARAMS.model,
          input_tokens: claudeResponse.usage.input_tokens,
          output_tokens: claudeResponse.usage.output_tokens
        }
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
