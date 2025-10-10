/**
 * Context Management Types
 *
 * Defines the schema for conversation context tracking
 * across multiple turns and sessions
 */

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  intent?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface PageView {
  pageId: string
  pageType: string
  title: string
  viewedAt: Date
  duration?: number
  interactionCount?: number
  specification?: any  // PageSpecification
}

export interface UserPreferences {
  persona?: string
  interests: string[]
  seenContent: string[]
  preferredComponents?: string[]
  preferences: Record<string, any>
}

export interface ConversationMetadata {
  startedAt: Date
  lastActiveAt: Date
  turnCount: number
  totalTokens: number
  intentHistory: string[]
  pageGenerationCount: number
  averageResponseTime: number
}

export interface ConversationContext {
  // Identifiers
  sessionId: string
  conversationId: string
  userId?: string

  // Conversation data
  messages: Message[]
  pages: PageView[]
  preferences: UserPreferences
  metadata: ConversationMetadata

  // State
  currentPage?: string
  currentSection?: string
  lastIntent?: string

  // Timestamps
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface ContextRetrievalOptions {
  // How many recent messages to retrieve
  messageLimit?: number

  // How many recent pages to retrieve
  pageLimit?: number

  // Include full page specifications
  includePageSpecs?: boolean

  // Filter by time range
  since?: Date
  until?: Date

  // Semantic search query (future)
  searchQuery?: string
}

export interface ContextUpdateOptions {
  // Add a message to context
  addMessage?: Message

  // Add a page view to context
  addPageView?: PageView

  // Update preferences
  updatePreferences?: Partial<UserPreferences>

  // Update metadata
  updateMetadata?: Partial<ConversationMetadata>

  // Update current state
  currentPage?: string
  currentSection?: string
  lastIntent?: string
}

export interface ContextStorageStats {
  messageCount: number
  pageCount: number
  storageSize: number  // bytes
  compressionRatio?: number
  lastCompressed?: Date
}

export interface ContextResetOptions {
  // Clear all messages
  clearMessages?: boolean

  // Clear page history
  clearPages?: boolean

  // Preserve user preferences
  preservePreferences?: boolean

  // Create new conversation
  createNewConversation?: boolean

  // Reason for reset (for analytics)
  reason?: 'user_request' | 'timeout' | 'error' | 'context_switch'
}

/**
 * Create an empty conversation context
 */
export function createEmptyContext(
  sessionId: string,
  conversationId: string,
  userId?: string
): ConversationContext {
  const now = new Date()

  return {
    sessionId,
    conversationId,
    userId,
    messages: [],
    pages: [],
    preferences: {
      interests: [],
      seenContent: [],
      preferences: {}
    },
    metadata: {
      startedAt: now,
      lastActiveAt: now,
      turnCount: 0,
      totalTokens: 0,
      intentHistory: [],
      pageGenerationCount: 0,
      averageResponseTime: 0
    },
    createdAt: now,
    updatedAt: now
  }
}

/**
 * Get recent context (last N turns)
 */
export function getRecentContext(
  context: ConversationContext,
  turnCount: number = 5
): Partial<ConversationContext> {
  const recentMessages = context.messages.slice(-turnCount * 2) // User + assistant = 2 messages per turn
  const recentPages = context.pages.slice(-turnCount)

  return {
    ...context,
    messages: recentMessages,
    pages: recentPages
  }
}

/**
 * Calculate context relevance score for semantic search
 */
export function calculateContextRelevance(
  context: ConversationContext,
  query: string
): number {
  let score = 0

  // Recent activity boost
  const hoursSinceActive = (Date.now() - context.metadata.lastActiveAt.getTime()) / (1000 * 60 * 60)
  if (hoursSinceActive < 1) score += 0.3
  else if (hoursSinceActive < 24) score += 0.2

  // Intent match
  if (context.lastIntent && query.toLowerCase().includes(context.lastIntent)) {
    score += 0.3
  }

  // Message content similarity (simple keyword match)
  const queryWords = query.toLowerCase().split(' ')
  const matchedMessages = context.messages.filter(msg =>
    queryWords.some(word => msg.content.toLowerCase().includes(word))
  )
  score += Math.min(0.4, matchedMessages.length * 0.1)

  return Math.min(1.0, score)
}

/**
 * Check if context should be compressed
 */
export function shouldCompressContext(context: ConversationContext): boolean {
  return (
    context.messages.length > 50 ||
    context.pages.length > 20 ||
    context.metadata.turnCount > 25
  )
}

/**
 * Estimate context size in bytes (approximate)
 */
export function estimateContextSize(context: ConversationContext): number {
  const json = JSON.stringify(context)
  return new Blob([json]).size
}
