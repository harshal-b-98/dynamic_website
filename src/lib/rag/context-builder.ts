/**
 * Context Builder for RAG
 *
 * Constructs optimized context for LLM prompts from retrieval results
 * while managing token limits and ensuring relevant information is included.
 */

import type { RetrievalResult } from './retriever'

export interface ContextBuilderOptions {
  maxTokens?: number              // Maximum tokens for context (default: 8000)
  includeMetadata?: boolean       // Include metadata in context (default: false)
  deduplicate?: boolean           // Remove duplicate content (default: true)
  format?: 'plain' | 'markdown'   // Output format (default: 'markdown')
  systemPrompt?: string           // Custom system prompt
}

export interface BuiltContext {
  context: string
  tokenCount: number
  resultsIncluded: number
  resultsTruncated: number
  metadata: {
    sources: string[]
    contentTypes: string[]
  }
}

/**
 * Context Builder Class
 */
export class ContextBuilder {
  /**
   * Build optimized context from retrieval results
   */
  buildContext(
    results: RetrievalResult[],
    query: string,
    options: ContextBuilderOptions = {}
  ): BuiltContext {
    const {
      maxTokens = 8000,
      includeMetadata = false,
      deduplicate = true,
      format = 'markdown',
      systemPrompt
    } = options

    // Deduplicate if needed
    let processedResults = results
    if (deduplicate) {
      processedResults = this.deduplicateResults(results)
    }

    // Calculate available tokens (reserve space for system prompt and query)
    const systemPromptTokens = systemPrompt ? this.estimateTokens(systemPrompt) : 0
    const queryTokens = this.estimateTokens(query)
    const availableTokens = maxTokens - systemPromptTokens - queryTokens - 500 // 500 buffer

    // Build context incrementally within token limits
    const contextParts: string[] = []
    let currentTokens = 0
    let resultsIncluded = 0
    const sources = new Set<string>()
    const contentTypes = new Set<string>()

    for (const result of processedResults) {
      const part = this.formatResult(result, format, includeMetadata)
      const partTokens = this.estimateTokens(part)

      if (currentTokens + partTokens > availableTokens) {
        // Would exceed token limit
        break
      }

      contextParts.push(part)
      currentTokens += partTokens
      resultsIncluded++

      // Track metadata
      if (result.contentTitle) {
        sources.add(result.contentTitle)
      } else {
        sources.add(result.contentId)
      }
      contentTypes.add(result.contentType)
    }

    // Combine parts
    const context = format === 'markdown'
      ? this.formatMarkdownContext(contextParts, query)
      : this.formatPlainContext(contextParts, query)

    return {
      context,
      tokenCount: this.estimateTokens(context),
      resultsIncluded,
      resultsTruncated: processedResults.length - resultsIncluded,
      metadata: {
        sources: Array.from(sources),
        contentTypes: Array.from(contentTypes)
      }
    }
  }

  /**
   * Format a single result based on output format
   */
  private formatResult(
    result: RetrievalResult,
    format: 'plain' | 'markdown',
    includeMetadata: boolean
  ): string {
    if (format === 'markdown') {
      let formatted = ''

      if (result.contentTitle) {
        formatted += `### ${result.contentTitle}\n\n`
      }

      formatted += `${result.contentText}\n\n`

      if (includeMetadata) {
        formatted += `*Source: ${result.contentId} | Relevance: ${(result.similarity * 100).toFixed(1)}%*\n\n`
      }

      return formatted
    } else {
      // Plain text format
      let formatted = ''

      if (result.contentTitle) {
        formatted += `${result.contentTitle}\n\n`
      }

      formatted += `${result.contentText}\n\n`

      if (includeMetadata) {
        formatted += `(Source: ${result.contentId}, Relevance: ${(result.similarity * 100).toFixed(1)}%)\n\n`
      }

      return formatted
    }
  }

  /**
   * Format context as markdown with proper structure
   */
  private formatMarkdownContext(parts: string[], query: string): string {
    return `# Relevant Information

The following information is relevant to answer the query: "${query}"

---

${parts.join('\n---\n\n')}

---

Please use the above information to provide an accurate and helpful response.`
  }

  /**
   * Format context as plain text
   */
  private formatPlainContext(parts: string[], query: string): string {
    return `RELEVANT INFORMATION FOR QUERY: "${query}"\n\n${parts.join('\n\n---\n\n')}\n\nUse the above information to provide an accurate response.`
  }

  /**
   * Deduplicate results based on content similarity
   */
  private deduplicateResults(results: RetrievalResult[]): RetrievalResult[] {
    const seen = new Set<string>()
    const deduplicated: RetrievalResult[] = []

    for (const result of results) {
      // Create fingerprint from content
      const fingerprint = this.createFingerprint(result.contentText)

      if (!seen.has(fingerprint)) {
        seen.add(fingerprint)
        deduplicated.push(result)
      }
    }

    return deduplicated
  }

  /**
   * Create content fingerprint for deduplication
   */
  private createFingerprint(text: string): string {
    // Use first 200 characters as fingerprint
    return text.slice(0, 200).toLowerCase().trim()
  }

  /**
   * Estimate token count from text
   * Rough approximation: 1 token ≈ 4 characters for English
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }

  /**
   * Build context for multi-turn conversation
   */
  buildConversationContext(
    results: RetrievalResult[],
    conversationHistory: { role: 'user' | 'assistant'; content: string }[],
    currentQuery: string,
    options: ContextBuilderOptions = {}
  ): BuiltContext {
    const {
      maxTokens = 8000,
      includeMetadata = false
    } = options

    // Estimate tokens for conversation history
    const historyText = conversationHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n')
    const historyTokens = this.estimateTokens(historyText)

    // Reduce available tokens for results
    const adjustedOptions: ContextBuilderOptions = {
      ...options,
      maxTokens: maxTokens - historyTokens
    }

    return this.buildContext(results, currentQuery, adjustedOptions)
  }

  /**
   * Build multi-KB context with organized sections
   */
  buildMultiKBContext(
    guidelinesResults: RetrievalResult[],
    personasResults: RetrievalResult[],
    productResults: RetrievalResult[],
    query: string,
    options: ContextBuilderOptions = {}
  ): BuiltContext {
    const {
      maxTokens = 8000,
      includeMetadata = false,
      deduplicate = true,
      format = 'markdown'
    } = options

    // Calculate token budget per KB (roughly equal distribution)
    const tokenBudget = Math.floor(maxTokens / 3)

    // Build contexts for each KB
    const guidelinesContext = this.buildKBSection(
      guidelinesResults,
      'UI/UX Guidelines',
      '📐',
      tokenBudget,
      format,
      includeMetadata
    )

    const personasContext = this.buildKBSection(
      personasResults,
      'User Personas',
      '👤',
      tokenBudget,
      format,
      includeMetadata
    )

    const productContext = this.buildKBSection(
      productResults,
      'Product Knowledge',
      '🎯',
      tokenBudget,
      format,
      includeMetadata
    )

    // Combine all sections
    const sections = [guidelinesContext, personasContext, productContext].filter(s => s.content)

    const context = format === 'markdown'
      ? this.formatMultiKBMarkdownContext(sections, query)
      : this.formatMultiKBPlainContext(sections, query)

    return {
      context,
      tokenCount: this.estimateTokens(context),
      resultsIncluded: guidelinesContext.count + personasContext.count + productContext.count,
      resultsTruncated: 0,
      metadata: {
        sources: [
          ...guidelinesContext.sources,
          ...personasContext.sources,
          ...productContext.sources
        ],
        contentTypes: [
          ...new Set([
            ...guidelinesResults.map(r => r.contentType),
            ...personasResults.map(r => r.contentType),
            ...productResults.map(r => r.contentType)
          ])
        ]
      }
    }
  }

  /**
   * Build a single KB section
   */
  private buildKBSection(
    results: RetrievalResult[],
    sectionName: string,
    icon: string,
    maxTokens: number,
    format: 'plain' | 'markdown',
    includeMetadata: boolean
  ): { content: string; count: number; sources: string[] } {
    if (results.length === 0) {
      return { content: '', count: 0, sources: [] }
    }

    const parts: string[] = []
    let currentTokens = 0
    let count = 0
    const sources: string[] = []

    for (const result of results) {
      const part = this.formatResult(result, format, includeMetadata)
      const partTokens = this.estimateTokens(part)

      if (currentTokens + partTokens > maxTokens) {
        break
      }

      parts.push(part)
      currentTokens += partTokens
      count++

      if (result.contentTitle) {
        sources.push(result.contentTitle)
      }
    }

    if (parts.length === 0) {
      return { content: '', count: 0, sources: [] }
    }

    const content = format === 'markdown'
      ? `## ${icon} ${sectionName}\n\n${parts.join('\n')}`
      : `${icon} ${sectionName.toUpperCase()}\n\n${parts.join('\n')}`

    return { content, count, sources }
  }

  /**
   * Format multi-KB context as markdown
   */
  private formatMultiKBMarkdownContext(
    sections: Array<{ content: string }>,
    query: string
  ): string {
    const sectionContents = sections.map(s => s.content).join('\n\n---\n\n')

    return `# Relevant Knowledge Base Information

Query: "${query}"

The following information from multiple knowledge bases is relevant:

---

${sectionContents}

---

Please use the above information to provide an accurate, brand-consistent, and persona-aware response.`
  }

  /**
   * Format multi-KB context as plain text
   */
  private formatMultiKBPlainContext(
    sections: Array<{ content: string }>,
    query: string
  ): string {
    const sectionContents = sections.map(s => s.content).join('\n\n---\n\n')

    return `KNOWLEDGE BASE INFORMATION FOR QUERY: "${query}"\n\n${sectionContents}\n\nUse the above information to provide an accurate response.`
  }
}

// Singleton instance
let contextBuilderInstance: ContextBuilder | null = null

/**
 * Get or create singleton context builder instance
 */
export function getContextBuilder(): ContextBuilder {
  if (!contextBuilderInstance) {
    contextBuilderInstance = new ContextBuilder()
  }
  return contextBuilderInstance
}

/**
 * Build context from results (convenience function)
 */
export function buildContext(
  results: RetrievalResult[],
  query: string,
  options?: ContextBuilderOptions
): BuiltContext {
  const builder = getContextBuilder()
  return builder.buildContext(results, query, options)
}
