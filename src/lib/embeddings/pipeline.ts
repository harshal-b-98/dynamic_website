/**
 * Content Embedding Pipeline
 *
 * Orchestrates the full pipeline: content → chunks → embeddings → vector DB storage
 * with progress tracking, deduplication, and error handling.
 */

import { chunkContent, type ContentChunk } from './chunker'
import { getEmbeddingGenerator } from './generator'
import { vectorDB } from '../vector-db'
import type { ContentType, CreateEmbeddingInput } from '../vector-db'

export interface PipelineInput {
  contentId: string
  contentType: ContentType
  content: string
  title?: string
  sourceUrl?: string
  metadata?: Record<string, any>
}

export interface PipelineOptions {
  chunkSize?: number
  chunkOverlap?: number
  batchSize?: number
  deduplicateExisting?: boolean
  onProgress?: (progress: PipelineProgress) => void
}

export interface PipelineProgress {
  stage: 'chunking' | 'embedding' | 'storing' | 'complete'
  current: number
  total: number
  percentage: number
  message: string
}

export interface PipelineResult {
  contentId: string
  chunksCreated: number
  embeddingsGenerated: number
  embeddingsStored: number
  tokensUsed: number
  cost: number
  processingTime: number
  skippedDuplicates: number
}

/**
 * Main pipeline class for processing content into embeddings
 */
export class EmbeddingPipeline {
  /**
   * Process a single content item through the pipeline
   */
  async processContent(
    input: PipelineInput,
    options: PipelineOptions = {}
  ): Promise<PipelineResult> {
    const startTime = Date.now()
    let tokensUsed = 0
    let cost = 0
    let skippedDuplicates = 0

    const {
      chunkSize = 1000,
      chunkOverlap = 200,
      batchSize = 50,
      deduplicateExisting = true,
      onProgress
    } = options

    // Stage 1: Chunking
    onProgress?.({
      stage: 'chunking',
      current: 0,
      total: 1,
      percentage: 0,
      message: 'Chunking content...'
    })

    const chunks = await chunkContent(
      input.content,
      {
        contentId: input.contentId,
        contentType: input.contentType,
        title: input.title,
        sourceUrl: input.sourceUrl
      },
      { chunkSize, chunkOverlap }
    )

    onProgress?.({
      stage: 'chunking',
      current: 1,
      total: 1,
      percentage: 100,
      message: `Created ${chunks.length} chunks`
    })

    // Stage 2: Deduplication (if enabled)
    let chunksToProcess = chunks

    if (deduplicateExisting) {
      const existingEmbeddings = await vectorDB.getEmbeddingsByContentId(input.contentId)

      if (existingEmbeddings.length > 0) {
        // Delete existing embeddings for this content
        await vectorDB.deleteEmbeddingsByContentId(input.contentId)
        skippedDuplicates = existingEmbeddings.length
      }
    }

    // Stage 3: Generate embeddings
    onProgress?.({
      stage: 'embedding',
      current: 0,
      total: chunksToProcess.length,
      percentage: 0,
      message: 'Generating embeddings...'
    })

    const generator = getEmbeddingGenerator({ batchSize })
    const texts = chunksToProcess.map(chunk => chunk.text)
    const embeddingResult = await generator.generateEmbeddingsBatch(texts)

    tokensUsed = embeddingResult.totalTokens
    cost = embeddingResult.totalCost

    onProgress?.({
      stage: 'embedding',
      current: chunksToProcess.length,
      total: chunksToProcess.length,
      percentage: 100,
      message: `Generated ${embeddingResult.embeddings.length} embeddings`
    })

    // Stage 4: Store in vector database
    onProgress?.({
      stage: 'storing',
      current: 0,
      total: embeddingResult.embeddings.length,
      percentage: 0,
      message: 'Storing embeddings...'
    })

    const embeddingInputs: CreateEmbeddingInput[] = chunksToProcess.map((chunk, index) => ({
      content_id: input.contentId,
      content_type: input.contentType,
      content_text: chunk.text,
      content_title: input.title,
      embedding: embeddingResult.embeddings[index],
      metadata: {
        ...input.metadata,
        ...chunk.metadata,
        sourceUrl: input.sourceUrl
      }
    }))

    // Store in batches
    const storedEmbeddings = await vectorDB.createEmbeddingsBatch(embeddingInputs)

    onProgress?.({
      stage: 'storing',
      current: storedEmbeddings.length,
      total: storedEmbeddings.length,
      percentage: 100,
      message: `Stored ${storedEmbeddings.length} embeddings`
    })

    // Stage 5: Complete
    const processingTime = Date.now() - startTime

    onProgress?.({
      stage: 'complete',
      current: 1,
      total: 1,
      percentage: 100,
      message: 'Pipeline complete'
    })

    return {
      contentId: input.contentId,
      chunksCreated: chunks.length,
      embeddingsGenerated: embeddingResult.embeddings.length,
      embeddingsStored: storedEmbeddings.length,
      tokensUsed,
      cost,
      processingTime,
      skippedDuplicates
    }
  }

  /**
   * Process multiple content items in batch
   */
  async processBatch(
    inputs: PipelineInput[],
    options: PipelineOptions = {}
  ): Promise<PipelineResult[]> {
    const results: PipelineResult[] = []
    let completed = 0

    for (const input of inputs) {
      const result = await this.processContent(input, {
        ...options,
        onProgress: (progress) => {
          // Adjust progress to account for batch processing
          const batchProgress: PipelineProgress = {
            ...progress,
            current: completed + (progress.percentage / 100),
            total: inputs.length,
            percentage: ((completed + (progress.percentage / 100)) / inputs.length) * 100,
            message: `[${completed + 1}/${inputs.length}] ${progress.message}`
          }
          options.onProgress?.(batchProgress)
        }
      })

      results.push(result)
      completed++

      // Small delay between items to avoid overwhelming the API
      if (completed < inputs.length) {
        await this.sleep(100)
      }
    }

    return results
  }

  /**
   * Delete embeddings for a content item
   */
  async deleteContent(contentId: string): Promise<void> {
    await vectorDB.deleteEmbeddingsByContentId(contentId)
  }

  /**
   * Update embeddings for a content item (delete old + create new)
   */
  async updateContent(
    input: PipelineInput,
    options: PipelineOptions = {}
  ): Promise<PipelineResult> {
    // Force deduplication to delete old embeddings
    return this.processContent(input, {
      ...options,
      deduplicateExisting: true
    })
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Singleton instance
let pipelineInstance: EmbeddingPipeline | null = null

/**
 * Get or create singleton pipeline instance
 */
export function getEmbeddingPipeline(): EmbeddingPipeline {
  if (!pipelineInstance) {
    pipelineInstance = new EmbeddingPipeline()
  }
  return pipelineInstance
}

/**
 * Process a single content item (convenience function)
 */
export async function processContent(
  input: PipelineInput,
  options?: PipelineOptions
): Promise<PipelineResult> {
  const pipeline = getEmbeddingPipeline()
  return pipeline.processContent(input, options)
}

/**
 * Process multiple content items (convenience function)
 */
export async function processBatch(
  inputs: PipelineInput[],
  options?: PipelineOptions
): Promise<PipelineResult[]> {
  const pipeline = getEmbeddingPipeline()
  return pipeline.processBatch(inputs, options)
}

/**
 * Delete content embeddings (convenience function)
 */
export async function deleteContent(contentId: string): Promise<void> {
  const pipeline = getEmbeddingPipeline()
  return pipeline.deleteContent(contentId)
}

/**
 * Update content embeddings (convenience function)
 */
export async function updateContent(
  input: PipelineInput,
  options?: PipelineOptions
): Promise<PipelineResult> {
  const pipeline = getEmbeddingPipeline()
  return pipeline.updateContent(input, options)
}
