/**
 * Page Generation Service
 *
 * Handles dynamic page generation using LLM with RAG-enhanced context
 * Extracted from /api/page/generate
 */

import { anthropic, DEFAULT_CLAUDE_PARAMS } from '@/lib/claude'
import {
  PageGenerationRequest,
  PageSpecification,
  PageGenerationError,
  PageGenerationMetrics
} from '@/lib/page-generation'
import {
  buildPageGenerationSystemPrompt,
  buildPageGenerationUserMessage,
  buildErrorRecoveryPrompt
} from '@/lib/page-generation-prompts'
import { validatePageSpecification, sanitizePageSpecification, autoCorrectPageSpecification } from '@/lib/page-validation'
import { getCachedPage, cachePage } from '@/lib/page-cache'
import { ServiceResult } from './types'
import { v4 as uuidv4 } from 'uuid'
// RAG integration
import { retrieveFromMultipleKBs } from '@/lib/knowledge-base/multi-kb-retriever'
import { getContextBuilder } from '@/lib/rag/context-builder'

export interface PageGenerationResponse {
  pageSpec: PageSpecification
  cached: boolean
  metrics: PageGenerationMetrics
}

export interface PageGenerationServiceConfig {
  timeoutMs?: number
  maxRetryAttempts?: number
}

/**
 * Page Generation Service
 */
export class PageGenerationService {
  private readonly timeoutMs: number
  private readonly maxRetryAttempts: number

  constructor(config: PageGenerationServiceConfig = {}) {
    this.timeoutMs = config.timeoutMs || 15000 // 15 seconds default
    this.maxRetryAttempts = config.maxRetryAttempts || 2
  }

  /**
   * Generate a page specification from user query
   */
  async generatePage(
    request: PageGenerationRequest
  ): Promise<ServiceResult<PageGenerationResponse>> {
    const startTime = Date.now()
    const requestId = uuidv4()

    try {
      const { query, intent, conversationHistory, persona, sessionId } = request

      // Validate required fields
      const validation = this.validateRequest(request)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Check cache first
      const cachedSpec = getCachedPage(query, intent, persona)
      if (cachedSpec) {
        console.log(`Cache hit for query: "${query}" (intent: ${intent})`)

        const metrics: PageGenerationMetrics = {
          requestId,
          query,
          intent,
          generationTime: Date.now() - startTime,
          llmTokens: { input: 0, output: 0 },
          componentsGenerated: cachedSpec.layout.components.length,
          cached: true,
          success: true,
          timestamp: new Date()
        }

        return {
          success: true,
          data: {
            pageSpec: cachedSpec,
            cached: true,
            metrics
          }
        }
      }

      // Generate page specification with retry logic
      const result = await this.generateWithRetry(request, requestId, startTime)

      if (!result.success || !result.data) {
        return result
      }

      // Cache the generated page
      cachePage(query, intent, result.data.pageSpec, persona)

      return result

    } catch (error) {
      console.error('Error in page generation service:', error)

      const metrics: PageGenerationMetrics = {
        requestId,
        query: request.query || 'unknown',
        intent: request.intent || 'unknown',
        generationTime: Date.now() - startTime,
        llmTokens: { input: 0, output: 0 },
        componentsGenerated: 0,
        cached: false,
        success: false,
        errorType: PageGenerationError.LLM_UNAVAILABLE,
        timestamp: new Date()
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'PAGE_GENERATION_FAILED'
      }
    }
  }

  /**
   * Generate page with retry logic
   */
  private async generateWithRetry(
    request: PageGenerationRequest,
    requestId: string,
    startTime: number
  ): Promise<ServiceResult<PageGenerationResponse>> {
    let pageSpec: PageSpecification | null = null
    let lastError: string | null = null
    let attempts = 0

    while (attempts < this.maxRetryAttempts && !pageSpec) {
      attempts++

      try {
        // Step 1: Retrieve relevant context from knowledge bases (with graceful fallback)
        let kbContext = ''
        try {
          console.log(`Retrieving knowledge base context for intent: ${request.intent}`)
          const kbRetrieval = await retrieveFromMultipleKBs(request.query, {
            intent: request.intent,
            threshold: 0.7
          })

          console.log(`KB retrieval stats:`, {
            guidelines: kbRetrieval.guidelines.length,
            personas: kbRetrieval.personas.length,
            product: kbRetrieval.product.length,
            total: kbRetrieval.totalResults,
            processingTime: kbRetrieval.processingTime
          })

          // Build structured context from multiple KBs
          if (kbRetrieval.totalResults > 0) {
            const contextBuilder = getContextBuilder()
            const builtContext = contextBuilder.buildMultiKBContext(
              kbRetrieval.guidelines,
              kbRetrieval.personas,
              kbRetrieval.product,
              request.query,
              {
                maxTokens: 4000,
                format: 'markdown',
                includeMetadata: false
              }
            )
            kbContext = builtContext.context
            console.log(`Built KB context: ${builtContext.tokenCount} tokens, ${builtContext.resultsIncluded} results`)
          } else {
            console.warn('No relevant KB content found, proceeding without RAG context')
          }
        } catch (ragError) {
          console.error('RAG retrieval failed, proceeding without KB context:', ragError)
          // Continue without RAG context - graceful degradation
        }

        // Step 2: Build prompts (with optional KB context)
        const systemPrompt = buildPageGenerationSystemPrompt(kbContext)
        const userMessage = attempts === 1
          ? buildPageGenerationUserMessage(request)
          : buildErrorRecoveryPrompt(request.query, lastError || 'Previous attempt failed')

        // Call Claude API with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs)

        try {
          const claudeResponse = await anthropic.messages.create({
            ...DEFAULT_CLAUDE_PARAMS,
            max_tokens: 2048,
            temperature: 0.5,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: userMessage
              }
            ]
          })

          clearTimeout(timeoutId)

          // Extract and parse response
          const content = claudeResponse.content[0]
          if (content.type !== 'text') {
            throw new Error('Unexpected response type from Claude')
          }

          // Parse JSON response (remove markdown code blocks if present)
          let jsonText = content.text.trim()
          if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '')
          } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '')
          }

          const pageData = JSON.parse(jsonText)

          // Construct PageSpecification
          pageSpec = {
            id: uuidv4(),
            type: pageData.type,
            metadata: {
              ...pageData.metadata,
              generatedFor: request.query
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

          // Sanitize and auto-correct
          pageSpec = sanitizePageSpecification(pageSpec)
          const { corrected, corrections } = autoCorrectPageSpecification(pageSpec)
          if (corrections.length > 0) {
            console.log('Auto-corrections applied:', corrections)
            pageSpec = corrected
          }

          // Log success metrics
          const metrics: PageGenerationMetrics = {
            requestId,
            query: request.query,
            intent: request.intent,
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

          return {
            success: true,
            data: {
              pageSpec,
              cached: false,
              metrics
            }
          }

        } catch (abortError) {
          if (controller.signal.aborted) {
            throw new Error('Page generation timeout exceeded')
          }
          throw abortError
        }

      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Page generation attempt ${attempts} failed:`, lastError)

        if (attempts >= this.maxRetryAttempts) {
          // Log failure metrics
          const metrics: PageGenerationMetrics = {
            requestId,
            query: request.query,
            intent: request.intent,
            generationTime: Date.now() - startTime,
            llmTokens: { input: 0, output: 0 },
            componentsGenerated: 0,
            cached: false,
            success: false,
            errorType: this.classifyError(lastError),
            timestamp: new Date()
          }

          console.error('Page generation failed after retries:', metrics)

          return {
            success: false,
            error: this.getUserFriendlyError(lastError),
            errorCode: metrics.errorType
          }
        }
      }
    }

    // Should not reach here, but return error if we do
    return {
      success: false,
      error: 'Page generation failed',
      errorCode: 'GENERATION_FAILED'
    }
  }

  /**
   * Validate page generation request
   */
  private validateRequest(request: PageGenerationRequest): { valid: boolean; error?: string } {
    if (!request.query || typeof request.query !== 'string') {
      return { valid: false, error: 'Query is required and must be a string' }
    }

    if (!request.intent || typeof request.intent !== 'string') {
      return { valid: false, error: 'Intent is required and must be a string' }
    }

    if (!request.sessionId || typeof request.sessionId !== 'string') {
      return { valid: false, error: 'Session ID is required' }
    }

    return { valid: true }
  }

  /**
   * Classify error type
   */
  private classifyError(error: string): PageGenerationError {
    if (error.includes('timeout')) {
      return PageGenerationError.TIMEOUT
    } else if (error.includes('component')) {
      return PageGenerationError.COMPONENT_NOT_FOUND
    } else {
      return PageGenerationError.LLM_UNAVAILABLE
    }
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyError(error: string): string {
    if (error.includes('timeout')) {
      return 'Page generation timeout exceeded. Please try again with a simpler query.'
    } else if (error.includes('component')) {
      return `Page generation temporarily unavailable: ${error}`
    } else {
      return 'Page generation temporarily unavailable. Please try again.'
    }
  }
}

/**
 * Singleton instance
 */
export const pageGenerationService = new PageGenerationService()
