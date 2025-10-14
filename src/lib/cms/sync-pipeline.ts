/**
 * CMS Sync Pipeline
 *
 * Orchestrates syncing CMS content changes to the vector database
 */

import { processContent, deleteContent, type PipelineInput } from '../embeddings'
import { getSyncTracker } from './sync-tracker'
import type {
  CMSContent,
  CMSSyncJob,
  CMSSyncOperation,
  OperationType,
  SyncProgress
} from './types'

export interface SyncOptions {
  onProgress?: (progress: SyncProgress) => void
  batchSize?: number
  continueOnError?: boolean
}

/**
 * CMS Sync Pipeline Class
 */
export class CMSSyncPipeline {
  private tracker = getSyncTracker()

  /**
   * Process a single CMS content change
   */
  async processSingleContent(
    content: CMSContent,
    operationType: OperationType,
    options: SyncOptions = {}
  ): Promise<CMSSyncOperation> {
    // Create job
    const job = await this.tracker.createJob({
      job_type: 'single_content',
      content_type: content.type,
      total_items: 1
    })

    // Create operation
    const operation = await this.tracker.createOperation({
      job_id: job.id,
      content_id: content.id,
      content_type: content.type,
      operation_type: operationType
    })

    // Start job and operation
    await this.tracker.updateJob(job.id, {
      status: 'running',
      started_at: new Date()
    })

    await this.tracker.updateOperation(operation.id, {
      status: 'processing',
      started_at: new Date()
    })

    try {
      // Process based on operation type
      if (operationType === 'delete') {
        await deleteContent(content.id)

        await this.tracker.updateOperation(operation.id, {
          status: 'completed',
          completed_at: new Date()
        })
      } else {
        // Create or update - process content
        const pipelineInput: PipelineInput = {
          contentId: content.id,
          contentType: content.type as any,
          content: content.content,
          title: content.title,
          sourceUrl: content.url,
          metadata: content.metadata
        }

        const result = await processContent(pipelineInput, {
          deduplicateExisting: true
        })

        await this.tracker.updateOperation(operation.id, {
          status: 'completed',
          chunks_created: result.chunksCreated,
          embeddings_stored: result.embeddingsStored,
          completed_at: new Date(),
          metadata: {
            tokensUsed: result.tokensUsed,
            cost: result.cost,
            processingTime: result.processingTime
          }
        })
      }

      // Complete job
      await this.tracker.updateJob(job.id, {
        status: 'completed',
        processed_items: 1,
        completed_at: new Date()
      })

      return await this.tracker.updateOperation(operation.id, {})
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      await this.tracker.updateOperation(operation.id, {
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date()
      })

      await this.tracker.updateJob(job.id, {
        status: 'failed',
        failed_items: 1,
        error_message: errorMessage,
        completed_at: new Date()
      })

      throw error
    }
  }

  /**
   * Process multiple content items in batch
   */
  async processBatch(
    contents: CMSContent[],
    operationType: OperationType,
    options: SyncOptions = {}
  ): Promise<CMSSyncJob> {
    const { onProgress, continueOnError = true } = options

    // Create job
    const job = await this.tracker.createJob({
      job_type: 'incremental',
      total_items: contents.length
    })

    // Start job
    await this.tracker.updateJob(job.id, {
      status: 'running',
      started_at: new Date()
    })

    let processed = 0
    let failed = 0

    for (const content of contents) {
      try {
        // Create operation
        const operation = await this.tracker.createOperation({
          job_id: job.id,
          content_id: content.id,
          content_type: content.type,
          operation_type: operationType
        })

        await this.tracker.updateOperation(operation.id, {
          status: 'processing',
          started_at: new Date()
        })

        // Process based on operation type
        if (operationType === 'delete') {
          await deleteContent(content.id)

          await this.tracker.updateOperation(operation.id, {
            status: 'completed',
            completed_at: new Date()
          })
        } else {
          const pipelineInput: PipelineInput = {
            contentId: content.id,
            contentType: content.type as any,
            content: content.content,
            title: content.title,
            sourceUrl: content.url,
            metadata: content.metadata
          }

          const result = await processContent(pipelineInput, {
            deduplicateExisting: true
          })

          await this.tracker.updateOperation(operation.id, {
            status: 'completed',
            chunks_created: result.chunksCreated,
            embeddings_stored: result.embeddingsStored,
            completed_at: new Date()
          })
        }

        processed++

        // Update job progress
        await this.tracker.updateJob(job.id, {
          processed_items: processed,
          failed_items: failed
        })

        // Report progress
        onProgress?.({
          jobId: job.id,
          status: 'running',
          totalItems: contents.length,
          processedItems: processed,
          failedItems: failed,
          percentage: (processed / contents.length) * 100,
          currentItem: content.id
        })
      } catch (error) {
        failed++

        if (!continueOnError) {
          await this.tracker.updateJob(job.id, {
            status: 'failed',
            failed_items: failed,
            error_message: error instanceof Error ? error.message : 'Batch processing failed',
            completed_at: new Date()
          })

          throw error
        }
      }
    }

    // Complete job
    const finalStatus = failed > 0 ? 'completed' : 'completed'
    await this.tracker.updateJob(job.id, {
      status: finalStatus,
      processed_items: processed,
      failed_items: failed,
      completed_at: new Date()
    })

    onProgress?.({
      jobId: job.id,
      status: finalStatus,
      totalItems: contents.length,
      processedItems: processed,
      failedItems: failed,
      percentage: 100
    })

    return this.tracker.getJob(job.id) as Promise<CMSSyncJob>
  }

  /**
   * Full reindex of all content
   */
  async fullReindex(
    contents: CMSContent[],
    options: SyncOptions = {}
  ): Promise<CMSSyncJob> {
    // Create job
    const job = await this.tracker.createJob({
      job_type: 'full_reindex',
      total_items: contents.length
    })

    options.onProgress?.({
      jobId: job.id,
      status: 'running',
      totalItems: contents.length,
      processedItems: 0,
      failedItems: 0,
      percentage: 0
    })

    // Process all content as updates
    return this.processBatch(contents, 'update', {
      ...options,
      onProgress: (progress) => {
        options.onProgress?.({
          ...progress,
          status: progress.status
        })
      }
    })
  }
}

// Singleton instance
let pipelineInstance: CMSSyncPipeline | null = null

/**
 * Get or create singleton pipeline instance
 */
export function getSyncPipeline(): CMSSyncPipeline {
  if (!pipelineInstance) {
    pipelineInstance = new CMSSyncPipeline()
  }
  return pipelineInstance
}
