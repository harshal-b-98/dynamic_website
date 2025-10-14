/**
 * CMS Sync Tracker
 *
 * Manages sync jobs, operations, and webhook events in the database
 */

import { supabaseAdmin } from '../supabase'
import type {
  CMSSyncJob,
  CMSSyncOperation,
  WebhookEvent,
  CreateJobInput,
  CreateOperationInput,
  UpdateJobInput,
  UpdateOperationInput,
  JobStatus,
  OperationStatus
} from './types'

/**
 * Sync Tracker Class
 */
export class SyncTracker {
  /**
   * Create a new sync job
   */
  async createJob(input: CreateJobInput): Promise<CMSSyncJob> {
    const { data, error } = await supabaseAdmin
      .from('cms_sync_jobs')
      .insert({
        job_type: input.job_type,
        content_type: input.content_type,
        total_items: input.total_items || 0,
        metadata: input.metadata || {}
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create sync job: ${error.message}`)
    }

    return this.mapToSyncJob(data)
  }

  /**
   * Get a sync job by ID
   */
  async getJob(jobId: string): Promise<CMSSyncJob | null> {
    const { data, error } = await supabaseAdmin
      .from('cms_sync_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get sync job: ${error.message}`)
    }

    return this.mapToSyncJob(data)
  }

  /**
   * Update a sync job
   */
  async updateJob(jobId: string, input: UpdateJobInput): Promise<CMSSyncJob> {
    const { data, error } = await supabaseAdmin
      .from('cms_sync_jobs')
      .update(input)
      .eq('id', jobId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update sync job: ${error.message}`)
    }

    return this.mapToSyncJob(data)
  }

  /**
   * List sync jobs with filters
   */
  async listJobs(options: {
    status?: JobStatus
    limit?: number
    offset?: number
  } = {}): Promise<CMSSyncJob[]> {
    let query = supabaseAdmin
      .from('cms_sync_jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to list sync jobs: ${error.message}`)
    }

    return data.map(record => this.mapToSyncJob(record))
  }

  /**
   * Create a sync operation
   */
  async createOperation(input: CreateOperationInput): Promise<CMSSyncOperation> {
    const { data, error } = await supabaseAdmin
      .from('cms_sync_operations')
      .insert({
        job_id: input.job_id,
        content_id: input.content_id,
        content_type: input.content_type,
        operation_type: input.operation_type,
        metadata: input.metadata || {}
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create sync operation: ${error.message}`)
    }

    return this.mapToSyncOperation(data)
  }

  /**
   * Update a sync operation
   */
  async updateOperation(
    operationId: string,
    input: UpdateOperationInput
  ): Promise<CMSSyncOperation> {
    const { data, error } = await supabaseAdmin
      .from('cms_sync_operations')
      .update(input)
      .eq('id', operationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update sync operation: ${error.message}`)
    }

    return this.mapToSyncOperation(data)
  }

  /**
   * Get operations for a job
   */
  async getJobOperations(jobId: string): Promise<CMSSyncOperation[]> {
    const { data, error } = await supabaseAdmin
      .from('cms_sync_operations')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to get job operations: ${error.message}`)
    }

    return data.map(record => this.mapToSyncOperation(record))
  }

  /**
   * Get failed operations for a job
   */
  async getFailedOperations(jobId: string): Promise<CMSSyncOperation[]> {
    const { data, error } = await supabaseAdmin
      .from('cms_sync_operations')
      .select('*')
      .eq('job_id', jobId)
      .eq('status', 'failed')

    if (error) {
      throw new Error(`Failed to get failed operations: ${error.message}`)
    }

    return data.map(record => this.mapToSyncOperation(record))
  }

  /**
   * Record a webhook event
   */
  async recordWebhookEvent(
    eventType: string,
    source: string,
    payload: Record<string, any>,
    contentId?: string
  ): Promise<WebhookEvent> {
    const { data, error } = await supabaseAdmin
      .from('cms_webhook_events')
      .insert({
        event_type: eventType,
        source,
        content_id: contentId,
        payload
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to record webhook event: ${error.message}`)
    }

    return this.mapToWebhookEvent(data)
  }

  /**
   * Mark webhook event as processed
   */
  async markWebhookProcessed(
    eventId: string,
    syncOperationId?: string,
    errorMessage?: string
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from('cms_webhook_events')
      .update({
        processed: true,
        sync_operation_id: syncOperationId,
        error_message: errorMessage,
        processed_at: new Date().toISOString()
      })
      .eq('id', eventId)

    if (error) {
      throw new Error(`Failed to mark webhook as processed: ${error.message}`)
    }
  }

  /**
   * Get unprocessed webhook events
   */
  async getUnprocessedWebhooks(limit = 100): Promise<WebhookEvent[]> {
    const { data, error } = await supabaseAdmin
      .from('cms_webhook_events')
      .select('*')
      .eq('processed', false)
      .order('received_at', { ascending: true })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get unprocessed webhooks: ${error.message}`)
    }

    return data.map(record => this.mapToWebhookEvent(record))
  }

  /**
   * Map database record to CMSSyncJob
   */
  private mapToSyncJob(record: any): CMSSyncJob {
    return {
      id: record.id,
      job_type: record.job_type,
      status: record.status,
      content_type: record.content_type,
      total_items: record.total_items,
      processed_items: record.processed_items,
      failed_items: record.failed_items,
      error_message: record.error_message,
      metadata: record.metadata || {},
      started_at: record.started_at ? new Date(record.started_at) : undefined,
      completed_at: record.completed_at ? new Date(record.completed_at) : undefined,
      created_at: new Date(record.created_at),
      updated_at: new Date(record.updated_at)
    }
  }

  /**
   * Map database record to CMSSyncOperation
   */
  private mapToSyncOperation(record: any): CMSSyncOperation {
    return {
      id: record.id,
      job_id: record.job_id,
      content_id: record.content_id,
      content_type: record.content_type,
      operation_type: record.operation_type,
      status: record.status,
      chunks_created: record.chunks_created,
      embeddings_stored: record.embeddings_stored,
      error_message: record.error_message,
      metadata: record.metadata || {},
      started_at: record.started_at ? new Date(record.started_at) : undefined,
      completed_at: record.completed_at ? new Date(record.completed_at) : undefined,
      created_at: new Date(record.created_at),
      updated_at: new Date(record.updated_at)
    }
  }

  /**
   * Map database record to WebhookEvent
   */
  private mapToWebhookEvent(record: any): WebhookEvent {
    return {
      id: record.id,
      event_type: record.event_type,
      source: record.source,
      content_id: record.content_id,
      payload: record.payload,
      processed: record.processed,
      sync_operation_id: record.sync_operation_id,
      error_message: record.error_message,
      received_at: new Date(record.received_at),
      processed_at: record.processed_at ? new Date(record.processed_at) : undefined,
      created_at: new Date(record.created_at)
    }
  }
}

// Singleton instance
let trackerInstance: SyncTracker | null = null

/**
 * Get or create singleton tracker instance
 */
export function getSyncTracker(): SyncTracker {
  if (!trackerInstance) {
    trackerInstance = new SyncTracker()
  }
  return trackerInstance
}
