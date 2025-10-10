import { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { anthropic, DEFAULT_CLAUDE_PARAMS } from '@/lib/claude'
import { v4 as uuidv4 } from 'uuid'
import { STAGE_MESSAGES } from '@/lib/thinking-process'

/**
 * Server-Sent Events (SSE) endpoint for streaming thinking process updates
 *
 * This endpoint provides real-time updates as the AI processes a message:
 * 1. Intent classification
 * 2. Context gathering
 * 3. Planning response
 * 4. Generating page (if needed)
 * 5. Validation and storage
 */

export async function POST(request: NextRequest) {
  // Create SSE stream
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      const sendStageUpdate = (stageId: string, status: 'active' | 'complete' | 'error', message: string, progress?: number) => {
        sendEvent('stage', { stageId, status, message, progress, timestamp: Date.now() })
      }

      try {
        // Parse request body
        const { message, conversationId } = await request.json()

        if (!message || typeof message !== 'string') {
          sendEvent('error', { message: 'Message is required' })
          controller.close()
          return
        }

        // Get or create session
        const cookieStore = await cookies()
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

        if (!session.sessionId) {
          session.sessionId = uuidv4()
          session.createdAt = Date.now()
          await session.save()
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
            sendEvent('error', { message: 'Failed to create conversation' })
            controller.close()
            return
          }

          activeConversationId = conversation.id
          session.conversationId = activeConversationId
          await session.save()
        }

        // STAGE 1: Intent Classification
        sendStageUpdate('intent', 'active', STAGE_MESSAGES.intent.start)

        const intentResponse = await fetch(`${request.nextUrl.origin}/api/intent/classify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        })

        let intent = 'general_conversation'
        let intentMetadata = {}
        let confidence = 0

        if (intentResponse.ok) {
          const intentData = await intentResponse.json()
          intent = intentData.classification.intent
          confidence = intentData.classification.confidence
          intentMetadata = {
            intent,
            confidence,
            reasoning: intentData.classification.reasoning,
            entities: intentData.classification.entities
          }

          sendStageUpdate(
            'intent',
            'complete',
            STAGE_MESSAGES.intent.complete(confidence)
          )
        } else {
          sendStageUpdate('intent', 'error', 'Failed to classify intent')
        }

        // Store user message
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
          sendEvent('error', { message: 'Failed to store message' })
          controller.close()
          return
        }

        // STAGE 2: Context Gathering
        sendStageUpdate('context', 'active', STAGE_MESSAGES.context.start)

        const { data: history } = await supabaseAdmin
          .from('dyn_messages')
          .select('role, content')
          .eq('conversation_id', activeConversationId)
          .order('created_at', { ascending: false })
          .limit(10)

        const conversationHistory = (history || [])
          .reverse()
          .map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))

        sendStageUpdate(
          'context',
          'complete',
          STAGE_MESSAGES.context.complete(conversationHistory.length)
        )

        // STAGE 3: Planning
        sendStageUpdate('planning', 'active', STAGE_MESSAGES.planning.start)

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

        let aiResponse = 'I apologize, I encountered an error generating a response.'

        if (claudeResponse.content && claudeResponse.content.length > 0) {
          const firstContent = claudeResponse.content[0]
          if (firstContent.type === 'text') {
            aiResponse = firstContent.text
          }
        }

        sendStageUpdate(
          'planning',
          'complete',
          STAGE_MESSAGES.planning.complete(4) // Placeholder component count
        )

        // STAGE 4: Generation
        const pageGenerationIntents = [
          'product_inquiry',
          'data_query',
          'competitor_analysis',
          'distributor_inquiry',
          'compliance_question'
        ]

        let pageSpec = null
        let generatedComponents: string[] = []

        if (pageGenerationIntents.includes(intent)) {
          sendStageUpdate('generation', 'active', STAGE_MESSAGES.generation.start)

          try {
            const pageGenResponse = await fetch(`${request.nextUrl.origin}/api/page/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: message,
                intent,
                conversationHistory: conversationHistory.slice(-5),
                sessionId: session.sessionId
              })
            })

            if (pageGenResponse.ok) {
              const pageData = await pageGenResponse.json()
              if (pageData.success && pageData.pageSpec) {
                pageSpec = pageData.pageSpec

                // Extract component types from page spec
                if (pageSpec.layout?.sections) {
                  generatedComponents = pageSpec.layout.sections
                    .flatMap((section: any) => section.components || [])
                    .map((comp: any) => comp.type)
                    .slice(0, 3) // First 3 for display
                }

                sendStageUpdate(
                  'generation',
                  'complete',
                  STAGE_MESSAGES.generation.complete(generatedComponents)
                )
              }
            }
          } catch (pageGenError) {
            console.error('Page generation error:', pageGenError)
            sendStageUpdate('generation', 'error', 'Failed to generate page')
          }
        } else {
          // Skip generation for non-page intents
          sendStageUpdate(
            'generation',
            'complete',
            '✓ Response ready (no page needed)'
          )
        }

        // STAGE 5: Validation
        sendStageUpdate('validation', 'active', STAGE_MESSAGES.validation.start)

        const { data: assistantMessage, error: assistantMsgError } = await supabaseAdmin
          .from('dyn_messages')
          .insert({
            conversation_id: activeConversationId,
            role: 'assistant',
            content: aiResponse,
            metadata: {
              model: DEFAULT_CLAUDE_PARAMS.model,
              input_tokens: claudeResponse.usage.input_tokens,
              output_tokens: claudeResponse.usage.output_tokens,
              pageGenerated: !!pageSpec,
              ...(pageSpec && { pageId: pageSpec.id })
            }
          })
          .select()
          .single()

        if (assistantMsgError) {
          sendEvent('error', { message: 'Failed to store response' })
          controller.close()
          return
        }

        sendStageUpdate('validation', 'complete', STAGE_MESSAGES.validation.complete())

        // Send final result
        sendEvent('complete', {
          success: true,
          conversationId: activeConversationId,
          userMessage,
          assistantMessage,
          sessionId: session.sessionId,
          ...(pageSpec && { pageSpec })
        })

        controller.close()
      } catch (error) {
        console.error('SSE stream error:', error)
        sendEvent('error', { message: 'Internal server error' })
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
