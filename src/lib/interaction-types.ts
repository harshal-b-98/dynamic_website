/**
 * Universal Interaction Types
 *
 * Defines types for capturing ANY user interaction on generated pages
 * and using it to generate new context-aware pages
 */

import { PageSpecification, ComponentSpec } from './page-generation'

/**
 * Types of interactions users can perform
 */
export type InteractionType =
  | 'button'           // Button clicks
  | 'cta'              // Call-to-action clicks
  | 'link'             // Link clicks
  | 'card'             // Card clicks
  | 'list-item'        // List item clicks
  | 'tab'              // Tab selections
  | 'accordion'        // Accordion expansions
  | 'feature'          // Feature item clicks
  | 'metric'           // Metric/stat clicks
  | 'testimonial'      // Testimonial clicks
  | 'related-query'    // Related query suggestions
  | 'navigation'       // Navigation item clicks
  | 'custom'           // Custom interactive elements

/**
 * Intent behind the interaction (what does the user want?)
 */
export type InteractionIntent =
  | 'learn-more'       // User wants more details
  | 'get-started'      // User wants to begin/signup
  | 'request-demo'     // User wants a demo
  | 'compare'          // User wants to compare options
  | 'explore'          // User wants to browse/explore
  | 'contact'          // User wants to contact
  | 'pricing'          // User wants pricing info
  | 'features'         // User wants feature details
  | 'navigate'         // User is navigating through content
  | 'unknown'          // Intent unclear, AI will determine

/**
 * Context about the specific interaction
 */
export interface InteractionContext {
  // What was clicked
  element: {
    type: InteractionType
    label: string           // Text on the element (button text, link text, etc.)
    description?: string    // Additional context (aria-label, title, etc.)
    action?: string         // Explicit action if defined (e.g., "view-pricing")
    href?: string          // If it's a link, what was the href
  }

  // Where was it clicked (component context)
  component: {
    type: string           // Component type (hero-section, feature-grid, etc.)
    id: string             // Component instance ID
    purpose?: string       // Why this component exists
    title?: string         // Component heading/title
  }

  // Current page context
  page: {
    id: string
    type: string
    intent: string
    title: string
    description: string
    generatedFor: string   // Original query that created this page
  }

  // User's inferred intent
  intent: InteractionIntent

  // Additional metadata
  metadata: {
    timestamp: number
    sessionId?: string
    conversationId?: string
  }
}

/**
 * Complete request for generating a page from an interaction
 */
export interface PageGenerationFromInteractionRequest {
  interaction: InteractionContext
  conversationHistory?: {
    conversationId: string
    recentMessages?: Array<{
      role: 'user' | 'assistant'
      content: string
      timestamp: number
    }>
  }
  pageHistory?: PageHistoryItem[]
  userPreferences?: {
    persona?: string
    interests?: string[]
  }
}

/**
 * Page history item for navigation stack
 */
export interface PageHistoryItem {
  page: PageSpecification
  interaction?: InteractionContext  // What interaction led to this page
  timestamp: number
}

/**
 * Navigation stack for managing page history
 */
export interface NavigationStack {
  items: PageHistoryItem[]
  currentIndex: number
  maxDepth: number  // Max navigation depth (default: 5)
}

/**
 * Response from page generation API
 */
export interface InteractionPageGenerationResponse {
  success: boolean
  pageSpec?: PageSpecification
  interaction?: InteractionContext
  error?: string
  generationTime?: number
  cached?: boolean
}

/**
 * Props that should be passed to all interactive elements
 */
export interface InteractionHandlerProps {
  interactionType: InteractionType
  label: string
  action?: string
  intent?: InteractionIntent
  description?: string
  href?: string
  onInteraction?: (context: InteractionContext) => void | Promise<void>
}

/**
 * Helper to create interaction context from component props
 */
export function createInteractionContext(
  element: InteractionHandlerProps,
  componentSpec: ComponentSpec,
  pageSpec: PageSpecification,
  sessionId?: string,
  conversationId?: string
): InteractionContext {
  return {
    element: {
      type: element.interactionType,
      label: element.label,
      description: element.description,
      action: element.action,
      href: element.href,
    },
    component: {
      type: componentSpec.componentType,
      id: componentSpec.id,
      purpose: componentSpec.metadata?.purpose,
      title: componentSpec.props?.headline || componentSpec.props?.title,
    },
    page: {
      id: pageSpec.id,
      type: pageSpec.type,
      intent: pageSpec.metadata.generatedFor,
      title: pageSpec.metadata.title,
      description: pageSpec.metadata.description,
      generatedFor: pageSpec.metadata.generatedFor,
    },
    intent: element.intent || inferIntentFromLabel(element.label),
    metadata: {
      timestamp: Date.now(),
      sessionId,
      conversationId,
    },
  }
}

/**
 * Infer user intent from element label/text
 */
function inferIntentFromLabel(label: string): InteractionIntent {
  const lower = label.toLowerCase()

  if (lower.includes('learn more') || lower.includes('read more') || lower.includes('details')) {
    return 'learn-more'
  }
  if (lower.includes('get started') || lower.includes('sign up') || lower.includes('try')) {
    return 'get-started'
  }
  if (lower.includes('demo') || lower.includes('schedule') || lower.includes('book')) {
    return 'request-demo'
  }
  if (lower.includes('compare') || lower.includes('vs') || lower.includes('difference')) {
    return 'compare'
  }
  if (lower.includes('contact') || lower.includes('talk to') || lower.includes('speak with')) {
    return 'contact'
  }
  if (lower.includes('pricing') || lower.includes('price') || lower.includes('cost')) {
    return 'pricing'
  }
  if (lower.includes('feature') || lower.includes('capability') || lower.includes('benefit')) {
    return 'features'
  }
  if (lower.includes('explore') || lower.includes('browse') || lower.includes('discover')) {
    return 'explore'
  }

  return 'unknown'
}

/**
 * Create a query from interaction context for page generation
 */
export function createQueryFromInteraction(context: InteractionContext): string {
  const { element, component, page } = context

  // Build a natural language query based on the interaction
  let query = ''

  switch (context.intent) {
    case 'learn-more':
      query = `Tell me more about ${element.label}`
      if (component.title) {
        query += ` from the ${component.title} section`
      }
      break

    case 'features':
      query = `What features are related to ${element.label}?`
      break

    case 'pricing':
      query = `What is the pricing for ${element.label}?`
      break

    case 'request-demo':
      query = `I want to request a demo for ${element.label}`
      break

    case 'compare':
      query = `Compare ${element.label} with alternatives`
      break

    case 'contact':
      query = `How can I contact you about ${element.label}?`
      break

    case 'get-started':
      query = `How do I get started with ${element.label}?`
      break

    case 'explore':
      query = `Show me more about ${element.label}`
      break

    default:
      // Unknown intent - use the label directly
      query = element.label
  }

  // Add context from the current page
  query += `. Context: I was viewing "${page.title}"`

  return query
}
