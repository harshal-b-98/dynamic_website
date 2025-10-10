/**
 * Context Manager
 *
 * Manages conversation context using Supabase for persistence
 * and iron-session for session identification
 */

import { supabaseAdmin, DynConversation, DynMessage } from './supabase'
import {
  ConversationContext,
  Message,
  PageView,
  ContextRetrievalOptions,
  ContextUpdateOptions,
  ContextResetOptions,
  ContextStorageStats,
  createEmptyContext,
  shouldCompressContext,
  estimateContextSize
} from './context-types'
import { v4 as uuidv4 } from 'uuid'
import LZString from 'lz-string'

/**
 * Context Manager Class
 */
export class ContextManager {
  private sessionId: string
  private userId?: string

  constructor(sessionId: string, userId?: string) {
    this.sessionId = sessionId
    this.userId = userId
  }

  /**
   * Get or create conversation context
   */
  async getContext(conversationId?: string): Promise<ConversationContext> {
    // If no conversation ID provided, get the most recent conversation for this session
    if (!conversationId) {
      const { data: conversations } = await supabaseAdmin
        .from('dyn_conversations')
        .select('id')
        .eq('session_id', this.sessionId)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (conversations && conversations.length > 0) {
        conversationId = conversations[0].id
      } else {
        // Create new conversation
        return this.createContext()
      }
    }

    // Get conversation from Supabase
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('dyn_conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      throw new Error(`Conversation not found: ${conversationId}`)
    }

    // Get messages for this conversation
    const { data: messages, error: msgError } = await supabaseAdmin
      .from('dyn_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (msgError) {
      throw new Error(`Failed to fetch messages: ${msgError.message}`)
    }

    // Build ConversationContext from database data
    const context: ConversationContext = {
      sessionId: conversation.session_id,
      conversationId: conversation.id,
      userId: conversation.user_id,
      messages: this.mapMessages(messages || []),
      pages: this.extractPages(conversation.metadata),
      preferences: this.extractPreferences(conversation.metadata),
      metadata: this.extractMetadata(conversation, messages || []),
      currentPage: conversation.metadata?.currentPage,
      currentSection: conversation.metadata?.currentSection,
      lastIntent: conversation.metadata?.lastIntent,
      createdAt: new Date(conversation.created_at),
      updatedAt: new Date(conversation.updated_at),
      expiresAt: this.calculateExpiration(conversation.updated_at)
    }

    return context
  }

  /**
   * Create a new conversation context
   */
  async createContext(title?: string): Promise<ConversationContext> {
    const conversationId = uuidv4()
    const now = new Date().toISOString()

    const { data: conversation, error } = await supabaseAdmin
      .from('dyn_conversations')
      .insert({
        id: conversationId,
        session_id: this.sessionId,
        user_id: this.userId || null,
        title: title || 'New Conversation',
        metadata: {
          pages: [],
          preferences: { interests: [], seenContent: [], preferences: {} },
          turnCount: 0,
          totalTokens: 0,
          intentHistory: [],
          pageGenerationCount: 0,
          averageResponseTime: 0
        },
        created_at: now,
        updated_at: now
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`)
    }

    return createEmptyContext(this.sessionId, conversationId, this.userId)
  }

  /**
   * Update conversation context
   */
  async updateContext(
    conversationId: string,
    options: ContextUpdateOptions
  ): Promise<ConversationContext> {
    // Get current context
    const context = await this.getContext(conversationId)

    // Apply updates
    if (options.addMessage) {
      // Message is already stored in dyn_messages table
      // Just add to context object
      context.messages.push(options.addMessage)
      context.metadata.turnCount++
      context.metadata.totalTokens += options.addMessage.metadata?.input_tokens || 0
      context.metadata.totalTokens += options.addMessage.metadata?.output_tokens || 0

      if (options.addMessage.intent) {
        context.metadata.intentHistory.push(options.addMessage.intent)
        context.lastIntent = options.addMessage.intent
      }
    }

    if (options.addPageView) {
      context.pages.push(options.addPageView)
      context.metadata.pageGenerationCount++
      context.currentPage = options.addPageView.pageId
    }

    if (options.updatePreferences) {
      context.preferences = {
        ...context.preferences,
        ...options.updatePreferences,
        interests: [
          ...context.preferences.interests,
          ...(options.updatePreferences.interests || [])
        ],
        seenContent: [
          ...context.preferences.seenContent,
          ...(options.updatePreferences.seenContent || [])
        ]
      }
    }

    if (options.updateMetadata) {
      context.metadata = {
        ...context.metadata,
        ...options.updateMetadata
      }
    }

    if (options.currentPage !== undefined) {
      context.currentPage = options.currentPage
    }

    if (options.currentSection !== undefined) {
      context.currentSection = options.currentSection
    }

    if (options.lastIntent !== undefined) {
      context.lastIntent = options.lastIntent
    }

    context.metadata.lastActiveAt = new Date()
    context.updatedAt = new Date()

    // Check if compression is needed
    const compressed = shouldCompressContext(context)

    // Update conversation metadata in Supabase
    const { error } = await supabaseAdmin
      .from('dyn_conversations')
      .update({
        metadata: {
          pages: context.pages,
          preferences: context.preferences,
          currentPage: context.currentPage,
          currentSection: context.currentSection,
          lastIntent: context.lastIntent,
          turnCount: context.metadata.turnCount,
          totalTokens: context.metadata.totalTokens,
          intentHistory: context.metadata.intentHistory.slice(-20), // Keep last 20
          pageGenerationCount: context.metadata.pageGenerationCount,
          averageResponseTime: context.metadata.averageResponseTime,
          compressed
        },
        updated_at: context.updatedAt.toISOString()
      })
      .eq('id', conversationId)

    if (error) {
      throw new Error(`Failed to update context: ${error.message}`)
    }

    return context
  }

  /**
   * Get recent context (last N messages)
   */
  async getRecentContext(
    conversationId: string,
    options: ContextRetrievalOptions = {}
  ): Promise<Partial<ConversationContext>> {
    const messageLimit = options.messageLimit || 10
    const pageLimit = options.pageLimit || 5

    // Get conversation
    const { data: conversation } = await supabaseAdmin
      .from('dyn_conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`)
    }

    // Get recent messages
    const { data: messages } = await supabaseAdmin
      .from('dyn_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(messageLimit)

    const recentMessages = this.mapMessages((messages || []).reverse())
    const recentPages = (conversation.metadata?.pages || []).slice(-pageLimit)

    return {
      sessionId: conversation.session_id,
      conversationId: conversation.id,
      messages: recentMessages,
      pages: recentPages,
      preferences: this.extractPreferences(conversation.metadata),
      metadata: this.extractMetadata(conversation, messages || []),
      lastIntent: conversation.metadata?.lastIntent
    }
  }

  /**
   * Reset conversation context
   */
  async resetContext(
    conversationId: string,
    options: ContextResetOptions = {}
  ): Promise<ConversationContext> {
    const context = await this.getContext(conversationId)

    if (options.createNewConversation) {
      // Create a completely new conversation
      return this.createContext()
    }

    // Clear messages if requested
    if (options.clearMessages) {
      await supabaseAdmin
        .from('dyn_messages')
        .delete()
        .eq('conversation_id', conversationId)

      context.messages = []
    }

    // Clear pages if requested
    if (options.clearPages) {
      context.pages = []
    }

    // Preserve or clear preferences
    if (!options.preservePreferences) {
      context.preferences = {
        interests: [],
        seenContent: [],
        preferences: {}
      }
    }

    // Reset metadata
    context.metadata = {
      startedAt: context.metadata.startedAt,
      lastActiveAt: new Date(),
      turnCount: 0,
      totalTokens: 0,
      intentHistory: [],
      pageGenerationCount: 0,
      averageResponseTime: 0
    }

    context.currentPage = undefined
    context.currentSection = undefined
    context.lastIntent = undefined
    context.updatedAt = new Date()

    // Update in database
    await supabaseAdmin
      .from('dyn_conversations')
      .update({
        metadata: {
          pages: context.pages,
          preferences: context.preferences,
          resetReason: options.reason || 'user_request',
          resetAt: new Date().toISOString(),
          ...context.metadata
        },
        updated_at: context.updatedAt.toISOString()
      })
      .eq('id', conversationId)

    return context
  }

  /**
   * Get context storage statistics
   */
  async getStorageStats(conversationId: string): Promise<ContextStorageStats> {
    const context = await this.getContext(conversationId)
    const size = estimateContextSize(context)

    return {
      messageCount: context.messages.length,
      pageCount: context.pages.length,
      storageSize: size,
      compressionRatio: undefined, // TODO: Calculate if compressed
      lastCompressed: undefined
    }
  }

  /**
   * Delete conversation context (hard delete)
   */
  async deleteContext(conversationId: string): Promise<void> {
    // Delete messages first (foreign key constraint)
    await supabaseAdmin
      .from('dyn_messages')
      .delete()
      .eq('conversation_id', conversationId)

    // Delete conversation
    const { error } = await supabaseAdmin
      .from('dyn_conversations')
      .delete()
      .eq('id', conversationId)

    if (error) {
      throw new Error(`Failed to delete context: ${error.message}`)
    }
  }

  /**
   * Cleanup expired contexts (TTL management)
   */
  static async cleanupExpiredContexts(ttlHours: number = 24): Promise<number> {
    const expirationDate = new Date()
    expirationDate.setHours(expirationDate.getHours() - ttlHours)

    // Find expired conversations
    const { data: expiredConvs } = await supabaseAdmin
      .from('dyn_conversations')
      .select('id')
      .lt('updated_at', expirationDate.toISOString())

    if (!expiredConvs || expiredConvs.length === 0) {
      return 0
    }

    const expiredIds = expiredConvs.map(c => c.id)

    // Delete messages
    await supabaseAdmin
      .from('dyn_messages')
      .delete()
      .in('conversation_id', expiredIds)

    // Delete conversations
    const { error } = await supabaseAdmin
      .from('dyn_conversations')
      .delete()
      .in('id', expiredIds)

    if (error) {
      console.error('Error cleaning up expired contexts:', error)
      return 0
    }

    return expiredIds.length
  }

  // Helper methods

  private mapMessages(dbMessages: DynMessage[]): Message[] {
    return dbMessages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      intent: msg.metadata?.intent,
      timestamp: new Date(msg.created_at),
      metadata: msg.metadata
    }))
  }

  private extractPages(metadata: any): PageView[] {
    return metadata?.pages || []
  }

  private extractPreferences(metadata: any): any {
    return metadata?.preferences || {
      interests: [],
      seenContent: [],
      preferences: {}
    }
  }

  private extractMetadata(conversation: DynConversation, messages: DynMessage[]): any {
    return {
      startedAt: new Date(conversation.created_at),
      lastActiveAt: new Date(conversation.updated_at),
      turnCount: conversation.metadata?.turnCount || messages.length,
      totalTokens: conversation.metadata?.totalTokens || 0,
      intentHistory: conversation.metadata?.intentHistory || [],
      pageGenerationCount: conversation.metadata?.pageGenerationCount || 0,
      averageResponseTime: conversation.metadata?.averageResponseTime || 0
    }
  }

  private calculateExpiration(updatedAt: string): Date {
    const expiration = new Date(updatedAt)
    expiration.setMinutes(expiration.getMinutes() + 30) // 30 minutes TTL
    return expiration
  }
}

/**
 * Helper: Compress context data for storage
 */
export function compressContext(context: ConversationContext): string {
  const json = JSON.stringify(context)
  return LZString.compressToUTF16(json)
}

/**
 * Helper: Decompress context data
 */
export function decompressContext(compressed: string): ConversationContext {
  const json = LZString.decompressFromUTF16(compressed)
  if (!json) {
    throw new Error('Failed to decompress context')
  }
  return JSON.parse(json)
}
