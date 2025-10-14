/**
 * Embedding Generation Service
 *
 * Generates vector embeddings using OpenAI's text-embedding-ada-002 model
 * with rate limiting, error handling, and cost tracking.
 */

import OpenAI from 'openai'

export interface EmbeddingResult {
  embedding: number[]
  tokenCount: number
  model: string
  cost: number
}

export interface BatchEmbeddingResult {
  embeddings: number[][]
  totalTokens: number
  totalCost: number
  model: string
  processingTime: number
}

export interface GeneratorConfig {
  apiKey?: string
  model?: string
  maxRetries?: number
  retryDelay?: number
  batchSize?: number
}

const DEFAULT_MODEL = 'text-embedding-ada-002'
const COST_PER_1K_TOKENS = 0.0001 // $0.0001 per 1k tokens for ada-002
const MAX_TOKENS_PER_REQUEST = 8191
const DEFAULT_BATCH_SIZE = 100
const DEFAULT_MAX_RETRIES = 3
const DEFAULT_RETRY_DELAY = 1000 // ms

/**
 * OpenAI Embedding Generator
 */
export class EmbeddingGenerator {
  private client: OpenAI
  private model: string
  private maxRetries: number
  private retryDelay: number
  private batchSize: number
  private requestCount = 0
  private totalTokensUsed = 0
  private totalCost = 0

  constructor(config: GeneratorConfig = {}) {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable.')
    }

    this.client = new OpenAI({ apiKey })
    this.model = config.model || DEFAULT_MODEL
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES
    this.retryDelay = config.retryDelay ?? DEFAULT_RETRY_DELAY
    this.batchSize = config.batchSize ?? DEFAULT_BATCH_SIZE
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty')
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.embeddings.create({
          model: this.model,
          input: text,
          encoding_format: 'float'
        })

        const embedding = response.data[0].embedding
        const tokenCount = response.usage.total_tokens
        const cost = this.calculateCost(tokenCount)

        // Update statistics
        this.requestCount++
        this.totalTokensUsed += tokenCount
        this.totalCost += cost

        return {
          embedding,
          tokenCount,
          model: this.model,
          cost
        }
      } catch (error: any) {
        lastError = error

        // Don't retry on certain errors
        if (error.status === 401 || error.status === 403) {
          throw new Error(`Authentication error: ${error.message}`)
        }

        if (error.status === 400) {
          throw new Error(`Invalid request: ${error.message}`)
        }

        // Retry on rate limits and server errors
        if (attempt < this.maxRetries) {
          const delay = this.calculateRetryDelay(attempt, error)
          await this.sleep(delay)
          continue
        }
      }
    }

    throw new Error(`Failed to generate embedding after ${this.maxRetries} retries: ${lastError?.message}`)
  }

  /**
   * Generate embeddings for multiple texts in batches
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<BatchEmbeddingResult> {
    if (texts.length === 0) {
      throw new Error('Text array cannot be empty')
    }

    const startTime = Date.now()
    const allEmbeddings: number[][] = []
    let totalTokens = 0

    // Process in batches to respect rate limits
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize)
      const batchResults = await this.processBatch(batch)

      allEmbeddings.push(...batchResults.embeddings)
      totalTokens += batchResults.totalTokens

      // Add delay between batches to respect rate limits
      if (i + this.batchSize < texts.length) {
        await this.sleep(100) // 100ms between batches
      }
    }

    const processingTime = Date.now() - startTime
    const totalCost = this.calculateCost(totalTokens)

    return {
      embeddings: allEmbeddings,
      totalTokens,
      totalCost,
      model: this.model,
      processingTime
    }
  }

  /**
   * Process a single batch of texts
   */
  private async processBatch(texts: string[]): Promise<{
    embeddings: number[][]
    totalTokens: number
  }> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.embeddings.create({
          model: this.model,
          input: texts,
          encoding_format: 'float'
        })

        const embeddings = response.data.map(item => item.embedding)
        const totalTokens = response.usage.total_tokens

        // Update statistics
        this.requestCount++
        this.totalTokensUsed += totalTokens
        this.totalCost += this.calculateCost(totalTokens)

        return {
          embeddings,
          totalTokens
        }
      } catch (error: any) {
        lastError = error

        // Don't retry on certain errors
        if (error.status === 401 || error.status === 403 || error.status === 400) {
          throw error
        }

        // Retry on rate limits and server errors
        if (attempt < this.maxRetries) {
          const delay = this.calculateRetryDelay(attempt, error)
          await this.sleep(delay)
          continue
        }
      }
    }

    throw new Error(`Failed to process batch after ${this.maxRetries} retries: ${lastError?.message}`)
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number, error: any): number {
    // If rate limited, use the retry-after header if available
    if (error.status === 429 && error.headers?.['retry-after']) {
      return parseInt(error.headers['retry-after']) * 1000
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    return this.retryDelay * Math.pow(2, attempt)
  }

  /**
   * Calculate cost based on token usage
   */
  private calculateCost(tokens: number): number {
    return (tokens / 1000) * COST_PER_1K_TOKENS
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get usage statistics
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      totalTokensUsed: this.totalTokensUsed,
      totalCost: this.totalCost,
      averageTokensPerRequest: this.requestCount > 0
        ? Math.round(this.totalTokensUsed / this.requestCount)
        : 0
    }
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.requestCount = 0
    this.totalTokensUsed = 0
    this.totalCost = 0
  }
}

// Singleton instance for easy use
let generatorInstance: EmbeddingGenerator | null = null

/**
 * Get or create singleton embedding generator
 */
export function getEmbeddingGenerator(config?: GeneratorConfig): EmbeddingGenerator {
  if (!generatorInstance) {
    generatorInstance = new EmbeddingGenerator(config)
  }
  return generatorInstance
}

/**
 * Generate a single embedding (convenience function)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const generator = getEmbeddingGenerator()
  const result = await generator.generateEmbedding(text)
  return result.embedding
}

/**
 * Generate multiple embeddings (convenience function)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const generator = getEmbeddingGenerator()
  const result = await generator.generateEmbeddingsBatch(texts)
  return result.embeddings
}

/**
 * Validate OpenAI API configuration
 */
export function validateEmbeddingConfig(): boolean {
  return !!process.env.OPENAI_API_KEY
}

/**
 * Get embedding generator statistics
 */
export function getEmbeddingStats() {
  return generatorInstance?.getStats() || {
    requestCount: 0,
    totalTokensUsed: 0,
    totalCost: 0,
    averageTokensPerRequest: 0
  }
}
