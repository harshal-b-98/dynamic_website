/**
 * Vector Database Client
 *
 * Manages connections and operations with Supabase pgvector
 */

import { supabaseAdmin } from '../supabase'
import { getVectorDBConfig } from './config'
import type {
  ContentEmbedding,
  CreateEmbeddingInput,
  UpdateEmbeddingInput,
  SearchResult,
  SearchOptions,
  VectorDBStats,
  HealthCheckResult,
  ContentType
} from './types'

/**
 * Vector Database Client Class
 */
export class VectorDBClient {
  private config = getVectorDBConfig()
  private readonly EMBEDDING_DIMENSIONS = this.config.embedding.dimensions
  private readonly DEFAULT_THRESHOLD = this.config.search.defaultThreshold
  private readonly DEFAULT_LIMIT = this.config.search.defaultLimit

  /**
   * Test database connection
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      const { data, error } = await supabaseAdmin
        .from('content_embeddings')
        .select('count')
        .limit(1)
        .single()

      const responseTime = Date.now() - startTime

      if (error) {
        return {
          isHealthy: false,
          responseTime,
          error: error.message
        }
      }

      return {
        isHealthy: true,
        responseTime
      }
    } catch (error) {
      return {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Create a new content embedding
   */
  async createEmbedding(input: CreateEmbeddingInput): Promise<ContentEmbedding> {
    const { data, error } = await supabaseAdmin
      .from('content_embeddings')
      .insert({
        content_id: input.content_id,
        content_type: input.content_type,
        content_text: input.content_text,
        content_title: input.content_title,
        embedding: JSON.stringify(input.embedding),
        metadata: input.metadata || {}
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create embedding: ${error.message}`)
    }

    return this.mapToContentEmbedding(data)
  }

  /**
   * Create multiple embeddings in batch
   */
  async createEmbeddingsBatch(inputs: CreateEmbeddingInput[]): Promise<ContentEmbedding[]> {
    const records = inputs.map(input => ({
      content_id: input.content_id,
      content_type: input.content_type,
      content_text: input.content_text,
      content_title: input.content_title,
      embedding: JSON.stringify(input.embedding),
      metadata: input.metadata || {}
    }))

    const { data, error } = await supabaseAdmin
      .from('content_embeddings')
      .insert(records)
      .select()

    if (error) {
      throw new Error(`Failed to create embeddings batch: ${error.message}`)
    }

    return data.map(record => this.mapToContentEmbedding(record))
  }

  /**
   * Get an embedding by ID
   */
  async getEmbedding(id: string): Promise<ContentEmbedding | null> {
    const { data, error } = await supabaseAdmin
      .from('content_embeddings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to get embedding: ${error.message}`)
    }

    return this.mapToContentEmbedding(data)
  }

  /**
   * Get embeddings by content ID
   */
  async getEmbeddingsByContentId(contentId: string): Promise<ContentEmbedding[]> {
    const { data, error } = await supabaseAdmin
      .from('content_embeddings')
      .select('*')
      .eq('content_id', contentId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get embeddings by content ID: ${error.message}`)
    }

    return data.map(record => this.mapToContentEmbedding(record))
  }

  /**
   * Update an existing embedding
   */
  async updateEmbedding(id: string, input: UpdateEmbeddingInput): Promise<ContentEmbedding> {
    const updateData: any = {}

    if (input.content_text !== undefined) {
      updateData.content_text = input.content_text
    }
    if (input.content_title !== undefined) {
      updateData.content_title = input.content_title
    }
    if (input.embedding !== undefined) {
      updateData.embedding = JSON.stringify(input.embedding)
    }
    if (input.metadata !== undefined) {
      updateData.metadata = input.metadata
    }

    const { data, error } = await supabaseAdmin
      .from('content_embeddings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update embedding: ${error.message}`)
    }

    return this.mapToContentEmbedding(data)
  }

  /**
   * Delete an embedding by ID
   */
  async deleteEmbedding(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('content_embeddings')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete embedding: ${error.message}`)
    }
  }

  /**
   * Delete all embeddings for a content ID
   */
  async deleteEmbeddingsByContentId(contentId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('content_embeddings')
      .delete()
      .eq('content_id', contentId)

    if (error) {
      throw new Error(`Failed to delete embeddings by content ID: ${error.message}`)
    }
  }

  /**
   * Perform similarity search
   */
  async search(
    queryEmbedding: number[],
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const threshold = options.threshold ?? this.DEFAULT_THRESHOLD
    const limit = options.limit ?? this.DEFAULT_LIMIT
    const contentType = options.contentType

    // Use the match_content_embeddings function
    const { data, error } = await supabaseAdmin
      .rpc('match_content_embeddings', {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: threshold,
        match_count: limit,
        filter_content_type: contentType || null
      })

    if (error) {
      throw new Error(`Failed to search embeddings: ${error.message}`)
    }

    return data.map((record: any) => ({
      id: record.id,
      content_id: record.content_id,
      content_type: record.content_type,
      content_text: record.content_text,
      content_title: record.content_title,
      metadata: record.metadata,
      similarity: record.similarity
    }))
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<VectorDBStats> {
    // Get total count
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('content_embeddings')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw new Error(`Failed to get total count: ${countError.message}`)
    }

    // Get counts by type
    const { data: typeCounts, error: typeError } = await supabaseAdmin
      .from('content_embeddings')
      .select('content_type')

    if (typeError) {
      throw new Error(`Failed to get type counts: ${typeError.message}`)
    }

    const embeddingsByType: Record<ContentType, number> = {} as any

    typeCounts?.forEach(record => {
      const type = record.content_type as ContentType
      embeddingsByType[type] = (embeddingsByType[type] || 0) + 1
    })

    // Get latest update time
    const { data: latestRecord } = await supabaseAdmin
      .from('content_embeddings')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    return {
      totalEmbeddings: totalCount || 0,
      embeddingsByType,
      averageEmbeddingSize: this.EMBEDDING_DIMENSIONS,
      lastUpdated: latestRecord ? new Date(latestRecord.updated_at) : new Date()
    }
  }

  /**
   * List all embeddings with pagination
   */
  async listEmbeddings(options: {
    limit?: number
    offset?: number
    contentType?: ContentType
  } = {}): Promise<ContentEmbedding[]> {
    const limit = options.limit ?? 50
    const offset = options.offset ?? 0

    let query = supabaseAdmin
      .from('content_embeddings')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (options.contentType) {
      query = query.eq('content_type', options.contentType)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to list embeddings: ${error.message}`)
    }

    return data.map(record => this.mapToContentEmbedding(record))
  }

  /**
   * Map database record to ContentEmbedding
   */
  private mapToContentEmbedding(record: any): ContentEmbedding {
    return {
      id: record.id,
      content_id: record.content_id,
      content_type: record.content_type,
      content_text: record.content_text,
      content_title: record.content_title,
      embedding: typeof record.embedding === 'string'
        ? JSON.parse(record.embedding)
        : record.embedding,
      metadata: record.metadata || {},
      created_at: new Date(record.created_at),
      updated_at: new Date(record.updated_at)
    }
  }
}

/**
 * Singleton instance of VectorDBClient
 */
export const vectorDB = new VectorDBClient()

/**
 * Test vector database connection
 */
export async function testVectorDBConnection(): Promise<boolean> {
  const result = await vectorDB.healthCheck()
  return result.isHealthy
}
