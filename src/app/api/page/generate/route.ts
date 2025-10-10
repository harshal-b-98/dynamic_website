import { NextRequest, NextResponse } from 'next/server'
import { anthropic, DEFAULT_CLAUDE_PARAMS } from '@/lib/claude'
import {
  PageGenerationRequest,
  PageGenerationResponse,
  PageSpecification,
  PageGenerationError,
  PageGenerationMetrics
} from '@/lib/page-generation'
import {
  buildPageGenerationSystemPrompt,
  buildPageGenerationUserMessage,
  buildErrorRecoveryPrompt
} from '@/lib/page-generation-prompts'
import { validateComponent } from '@/lib/component-registry'
import { validatePageSpecification, sanitizePageSpecification, autoCorrectPageSpecification } from '@/lib/page-validation'
import { getCachedPage, cachePage } from '@/lib/page-cache'
import { v4 as uuidv4 } from 'uuid'

// Timeout for page generation (15 seconds)
const GENERATION_TIMEOUT_MS = 15000

// Maximum retry attempts for failed generation
const MAX_RETRY_ATTEMPTS = 2

/**
 * POST /api/page/generate
 * Generate dynamic page specification using LLM
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = uuidv4()

  try {
    // Parse request body
    const body = await request.json() as PageGenerationRequest

    const { query, intent, conversationHistory, persona, sessionId } = body

    // Check cache first
    const cachedSpec = getCachedPage(query, intent, persona)
    if (cachedSpec) {
      console.log(`Cache hit for query: "${query}" (intent: ${intent})`)
      return NextResponse.json(
        {
          success: true,
          pageSpec: cachedSpec,
          cached: true
        } as PageGenerationResponse,
        { status: 200 }
      )
    }

    // Validate required fields
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Query is required and must be a string'
        } as PageGenerationResponse,
        { status: 400 }
      )
    }

    if (!intent || typeof intent !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Intent is required and must be a string'
        } as PageGenerationResponse,
        { status: 400 }
      )
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Session ID is required'
        } as PageGenerationResponse,
        { status: 400 }
      )
    }

    // Generate page specification with retry logic
    let pageSpec: PageSpecification | null = null
    let lastError: string | null = null
    let attempts = 0

    while (attempts < MAX_RETRY_ATTEMPTS && !pageSpec) {
      attempts++

      try {
        // Build prompts
        const systemPrompt = buildPageGenerationSystemPrompt()
        const userMessage = attempts === 1
          ? buildPageGenerationUserMessage(body)
          : buildErrorRecoveryPrompt(query, lastError || 'Previous attempt failed')

        // Call Claude API with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS)

        try {
          const claudeResponse = await anthropic.messages.create({
            ...DEFAULT_CLAUDE_PARAMS,
            max_tokens: 2048, // Increased for page generation
            temperature: 0.5, // Balanced between creativity and consistency
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: userMessage
              }
            ]
          })

          clearTimeout(timeoutId)

          // Extract response content
          const content = claudeResponse.content[0]
          if (content.type !== 'text') {
            throw new Error('Unexpected response type from Claude')
          }

          // Parse JSON response
          const responseText = content.text.trim()

          // Remove markdown code blocks if present
          let jsonText = responseText
          if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '')
          } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '')
          }

          const pageData = JSON.parse(jsonText)

          // Validate and construct PageSpecification
          pageSpec = {
            id: uuidv4(),
            type: pageData.type,
            metadata: {
              ...pageData.metadata,
              generatedFor: query  // Add original user query
            },
            layout: pageData.layout,
            navigation: pageData.navigation,
            generatedAt: new Date(),
            generatedBy: 'llm',
            llmModel: DEFAULT_CLAUDE_PARAMS.model,
            generationTime: Date.now() - startTime
          }

          // Validate page specification
          const validation = validatePageSpecification(pageSpec)
          if (!validation.valid) {
            lastError = `Validation failed: ${validation.errors.join(', ')}`
            pageSpec = null
            console.error('Page spec validation errors:', validation.errors)
            continue
          }

          // Log warnings (non-blocking)
          if (validation.warnings.length > 0) {
            console.warn('Page spec validation warnings:', validation.warnings)
          }

          // Sanitize page specification
          pageSpec = sanitizePageSpecification(pageSpec)

          // Auto-correct UI quality issues
          const { corrected, corrections } = autoCorrectPageSpecification(pageSpec)
          if (corrections.length > 0) {
            console.log('Auto-corrections applied:', corrections)
            pageSpec = corrected
          }

          // Log generation metrics
          const metrics: PageGenerationMetrics = {
            requestId,
            query,
            intent,
            generationTime: Date.now() - startTime,
            llmTokens: {
              input: claudeResponse.usage.input_tokens,
              output: claudeResponse.usage.output_tokens
            },
            componentsGenerated: pageSpec.layout.components.length,
            cached: false,
            success: true,
            timestamp: new Date()
          }

          console.log('Page generation successful:', metrics)

        } catch (abortError) {
          if (controller.signal.aborted) {
            throw new Error('Page generation timeout exceeded')
          }
          throw abortError
        }

      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Page generation attempt ${attempts} failed:`, lastError)

        if (attempts >= MAX_RETRY_ATTEMPTS) {
          // Log failure metrics
          const metrics: PageGenerationMetrics = {
            requestId,
            query,
            intent,
            generationTime: Date.now() - startTime,
            llmTokens: { input: 0, output: 0 },
            componentsGenerated: 0,
            cached: false,
            success: false,
            errorType: lastError.includes('timeout')
              ? PageGenerationError.TIMEOUT
              : lastError.includes('component')
              ? PageGenerationError.COMPONENT_NOT_FOUND
              : PageGenerationError.LLM_UNAVAILABLE,
            timestamp: new Date()
          }

          console.error('Page generation failed after retries:', metrics)

          // Return error response based on error type
          if (lastError.includes('timeout')) {
            return NextResponse.json(
              {
                success: false,
                error: 'Page generation timeout exceeded. Please try again with a simpler query.'
              } as PageGenerationResponse,
              { status: 504 }
            )
          } else if (lastError.includes('component')) {
            return NextResponse.json(
              {
                success: false,
                error: `Page generation temporarily unavailable: ${lastError}`
              } as PageGenerationResponse,
              { status: 500 }
            )
          } else {
            return NextResponse.json(
              {
                success: false,
                error: 'Page generation temporarily unavailable. Please try again.'
              } as PageGenerationResponse,
              { status: 503 }
            )
          }
        }
      }
    }

    // Cache the generated page
    if (pageSpec) {
      cachePage(query, intent, pageSpec, persona)
    }

    // Success - return page specification
    return NextResponse.json(
      {
        success: true,
        pageSpec,
        cached: false
      } as PageGenerationResponse,
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in page generation route:', error)

    // Log error metrics
    const metrics: PageGenerationMetrics = {
      requestId,
      query: 'unknown',
      intent: 'unknown',
      generationTime: Date.now() - startTime,
      llmTokens: { input: 0, output: 0 },
      componentsGenerated: 0,
      cached: false,
      success: false,
      errorType: PageGenerationError.LLM_UNAVAILABLE,
      timestamp: new Date()
    }

    console.error('Page generation error:', metrics)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during page generation'
      } as PageGenerationResponse,
      { status: 500 }
    )
  }
}
