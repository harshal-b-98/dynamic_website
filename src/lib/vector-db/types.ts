/**
 * Vector Database Types
 *
 * Type definitions for vector embeddings and similarity search
 */

/**
 * Knowledge base categories for multi-KB organization
 */
export type KBCategory =
  | 'guidelines'    // UI/UX guidelines, brand voice, design patterns
  | 'personas'      // User persona definitions and characteristics
  | 'product'       // Product features, capabilities, technical details

/**
 * Content types that can be embedded
 */
export type ContentType =
  | 'page'
  | 'section'
  | 'faq'
  | 'product'
  | 'feature'
  | 'article'
  | 'documentation'
  | 'chat-response'

/**
 * Content embedding record
 */
export interface ContentEmbedding {
  id: string
  content_id: string
  content_type: ContentType
  content_text: string
  content_title?: string
  embedding: number[]
  metadata: Record<string, any>
  created_at: Date
  updated_at: Date
}

/**
 * Input for creating a new embedding
 */
export interface CreateEmbeddingInput {
  content_id: string
  content_type: ContentType
  content_text: string
  content_title?: string
  embedding: number[]
  metadata?: Record<string, any>
}

/**
 * Input for updating an existing embedding
 */
export interface UpdateEmbeddingInput {
  content_text?: string
  content_title?: string
  embedding?: number[]
  metadata?: Record<string, any>
}

/**
 * Search result with similarity score
 */
export interface SearchResult {
  id: string
  content_id: string
  content_type: ContentType
  content_text: string
  content_title?: string
  metadata: Record<string, any>
  similarity: number
}

/**
 * Options for similarity search
 */
export interface SearchOptions {
  // Minimum similarity threshold (0-1)
  threshold?: number

  // Maximum number of results
  limit?: number

  // Filter by content type
  contentType?: ContentType

  // Filter by knowledge base category
  kbCategory?: KBCategory

  // Additional metadata filters
  metadataFilters?: Record<string, any>
}

/**
 * Vector database configuration
 */
export interface VectorDBConfig {
  supabaseUrl: string
  supabaseKey: string
  embeddingDimensions: number
  defaultThreshold: number
  defaultLimit: number
}

/**
 * Statistics about vector database
 */
export interface VectorDBStats {
  totalEmbeddings: number
  embeddingsByType: Record<ContentType, number>
  averageEmbeddingSize: number
  lastUpdated: Date
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  isHealthy: boolean
  responseTime: number
  error?: string
}
