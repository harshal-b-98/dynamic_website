/**
 * Anthropic Claude AI Client Configuration
 */

import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set')
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Claude model to use for intent classification and chat
 */
export const CLAUDE_MODEL = 'claude-3-haiku-20240307'

/**
 * Default Claude parameters
 */
export const DEFAULT_CLAUDE_PARAMS = {
  model: CLAUDE_MODEL,
  max_tokens: 1024,
  temperature: 0.7,
}
