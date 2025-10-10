/**
 * Interaction Service
 *
 * Converts user interactions into queries and calls the existing
 * page generation API (/api/page/generate)
 */

import { InteractionContext, createQueryFromInteraction } from './interaction-types'
import { PageSpecification } from './page-generation'
import { NavigationStack, getNavigationContext } from './navigation-stack'

export interface GeneratePageFromInteractionOptions {
  interaction: InteractionContext
  navigationStack?: NavigationStack
  conversationId?: string
  sessionId?: string
  onThinkingStart?: () => void
  onStageUpdate?: (event: any) => void
}

export interface PageGenerationResult {
  success: boolean
  pageSpec?: PageSpecification
  error?: string
}

/**
 * Generate a new page from a user interaction
 *
 * This reuses the existing /api/page/generate endpoint by:
 * 1. Converting the interaction into a natural language query
 * 2. Adding page context for better AI understanding
 * 3. Calling the same page generation flow
 */
export async function generatePageFromInteraction(
  options: GeneratePageFromInteractionOptions
): Promise<PageGenerationResult> {
  const { interaction, navigationStack, conversationId, sessionId, onThinkingStart, onStageUpdate } = options

  try {
    // Step 1: Convert interaction to a natural language query
    const query = createQueryFromInteraction(interaction)

    // Step 2: Build context from navigation history
    const context = buildContextString(interaction, navigationStack)

    // Step 3: Classify intent (can be done client-side or let the API do it)
    const intent = await classifyIntent(query, context)

    // Step 4: Call existing page generation API
    onThinkingStart?.()

    const result = await callPageGenerationAPI({
      query,
      intent,
      context,
      conversationId,
      sessionId,
      onStageUpdate
    })

    return result

  } catch (error) {
    console.error('Error generating page from interaction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Build context string from interaction and navigation history
 */
function buildContextString(
  interaction: InteractionContext,
  navigationStack?: NavigationStack
): string {
  let context = ''

  // Add current page context
  context += `Current Page: "${interaction.page.title}"\n`
  context += `Page Type: ${interaction.page.type}\n`
  context += `Original Query: "${interaction.page.generatedFor}"\n\n`

  // Add interaction context
  context += `User Interaction:\n`
  context += `- Clicked: "${interaction.element.label}"\n`
  context += `- Element Type: ${interaction.element.type}\n`
  context += `- Component: ${interaction.component.type}\n`
  if (interaction.component.title) {
    context += `- Section: "${interaction.component.title}"\n`
  }
  context += `- Inferred Intent: ${interaction.intent}\n\n`

  // Add navigation history (last 3 pages)
  if (navigationStack) {
    const recentPages = getNavigationContext(navigationStack, 3)
    if (recentPages.length > 1) {
      context += `Recent Pages:\n`
      recentPages.slice(0, -1).forEach((item, index) => {
        context += `${index + 1}. "${item.page.metadata.title}"`
        if (item.interaction) {
          context += ` (via "${item.interaction.element.label}")`
        }
        context += `\n`
      })
    }
  }

  return context
}

/**
 * Classify intent from query (reuse existing API)
 */
async function classifyIntent(query: string, context?: string): Promise<string> {
  try {
    const response = await fetch('/api/intent/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: query,
        context: context || ''
      })
    })

    if (!response.ok) {
      console.warn('Intent classification failed, using default')
      return 'general_conversation'
    }

    const data = await response.json()
    return data.intent || 'general_conversation'

  } catch (error) {
    console.warn('Intent classification error:', error)
    return 'general_conversation'
  }
}

/**
 * Call the existing page generation API
 */
async function callPageGenerationAPI(options: {
  query: string
  intent: string
  context: string
  conversationId?: string
  sessionId?: string
  onStageUpdate?: (event: any) => void
}): Promise<PageGenerationResult> {
  const { query, intent, context, conversationId, sessionId, onStageUpdate } = options

  try {
    const response = await fetch('/api/page/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        intent,
        context,
        conversationId,
        sessionId
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
      }
    }

    const data = await response.json()

    if (!data.pageSpec) {
      return {
        success: false,
        error: 'No page specification returned from API'
      }
    }

    return {
      success: true,
      pageSpec: data.pageSpec as PageSpecification
    }

  } catch (error) {
    console.error('Page generation API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}

/**
 * Generate page with streaming (for future implementation)
 * This would use the /api/chat/stream endpoint
 */
export async function generatePageFromInteractionStream(
  options: GeneratePageFromInteractionOptions
): Promise<PageGenerationResult> {
  // Future: Implement streaming version using SSE
  // For now, fall back to non-streaming
  return generatePageFromInteraction(options)
}
