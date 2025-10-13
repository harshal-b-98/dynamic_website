/**
 * Intent Classification Service
 *
 * Handles intent classification using LLM
 * Extracted from /api/intent/classify
 */

import { anthropic, DEFAULT_CLAUDE_PARAMS } from '@/lib/claude'
import { IntentClassification, INTENT_DESCRIPTIONS, IntentType } from '@/lib/intents'
import { ServiceResult } from './types'

export interface IntentClassificationRequest {
  message: string
  conversationHistory?: Array<{ role: string; content: string }>
}

export interface IntentClassificationResponse {
  classification: IntentClassification
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

/**
 * Intent Classification Service
 */
export class IntentClassificationService {
  private readonly temperature = 0.3 // Lower temperature for consistent classification
  private readonly maxTokens = 256

  /**
   * Classify user intent using LLM
   */
  async classifyIntent(
    request: IntentClassificationRequest
  ): Promise<ServiceResult<IntentClassificationResponse>> {
    try {
      const { message } = request

      // Validate input
      if (!message || typeof message !== 'string') {
        return {
          success: false,
          error: 'Message is required and must be a string'
        }
      }

      // Build intent classification prompt
      const systemPrompt = this.buildSystemPrompt()

      // Call Claude API for intent classification
      const response = await anthropic.messages.create({
        ...DEFAULT_CLAUDE_PARAMS,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      })

      // Parse Claude's response
      const content = response.content[0]
      if (content.type !== 'text') {
        return {
          success: false,
          error: 'Unexpected response type from Claude'
        }
      }

      let classification: IntentClassification
      try {
        const parsed = JSON.parse(content.text)
        classification = {
          intent: parsed.intent as IntentType,
          confidence: parsed.confidence,
          reasoning: parsed.reasoning,
          entities: parsed.entities || []
        }
      } catch (parseError) {
        console.error('Failed to parse Claude response:', content.text)
        // Fallback to general_conversation if parsing fails
        classification = {
          intent: 'general_conversation',
          confidence: 0.5,
          reasoning: 'Failed to parse intent classification',
          entities: []
        }
      }

      return {
        success: true,
        data: {
          classification,
          usage: {
            input_tokens: response.usage.input_tokens,
            output_tokens: response.usage.output_tokens
          }
        }
      }
    } catch (error) {
      console.error('Error in intent classification service:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'INTENT_CLASSIFICATION_FAILED'
      }
    }
  }

  /**
   * Build system prompt for intent classification
   */
  private buildSystemPrompt(): string {
    const intentList = Object.entries(INTENT_DESCRIPTIONS)
      .map(([intent, description]) => `- ${intent}: ${description}`)
      .join('\n')

    return `You are an intent classification system for ConsumerIQ, a beverage alcohol analytics platform for U.S. suppliers.

Your task is to classify user messages into one of the following intents:

${intentList}

Analyze the user's message and respond with a JSON object containing:
{
  "intent": "the_intent_type",
  "confidence": 0.95,
  "reasoning": "brief explanation of why this intent was chosen",
  "entities": ["any", "extracted", "entities"]
}

Guidelines:
- Choose the most specific intent that matches
- confidence should be 0-1 (1.0 = very confident)
- entities should extract product names, locations, distributors, dates, etc.
- reasoning should be 1-2 sentences explaining the classification

Respond ONLY with valid JSON, no other text.`
  }
}

/**
 * Singleton instance
 */
export const intentClassificationService = new IntentClassificationService()
