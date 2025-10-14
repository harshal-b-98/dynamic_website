/**
 * CMS Sync System Types
 *
 * Type definitions for CMS webhook integration and sync operations
 */

export type JobType = 'full_reindex' | 'incremental' | 'single_content'
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type OperationType = 'create' | 'update' | 'delete'
export type OperationStatus = 'pending' | 'processing' | 'completed' | 'failed'

/**
 * CMS Sync Job
 */
export interface CMSSyncJob {
  id: string
  job_type: JobType
  status: JobStatus
  content_type?: string
  total_items: number
  processed_items: number
  failed_items: number
  error_message?: string
  metadata: Record<string, any>
  started_at?: Date
  completed_at?: Date
  created_at: Date
  updated_at: Date
}

/**
 * CMS Sync Operation (individual content item)
 */
export interface CMSSyncOperation {
  id: string
  job_id: string
  content_id: string
  content_type: string
  operation_type: OperationType
  status: OperationStatus
  chunks_created: number
  embeddings_stored: number
  error_message?: string
  metadata: Record<string, any>
  started_at?: Date
  completed_at?: Date
  created_at: Date
  updated_at: Date
}

/**
 * Webhook Event
 */
export interface WebhookEvent {
  id: string
  event_type: string
  source: string
  content_id?: string
  payload: Record<string, any>
  processed: boolean
  sync_operation_id?: string
  error_message?: string
  received_at: Date
  processed_at?: Date
  created_at: Date
}

/**
 * Create Job Input
 */
export interface CreateJobInput {
  job_type: JobType
  content_type?: string
  total_items?: number
  metadata?: Record<string, any>
}

/**
 * Create Operation Input
 */
export interface CreateOperationInput {
  job_id: string
  content_id: string
  content_type: string
  operation_type: OperationType
  metadata?: Record<string, any>
}

/**
 * Update Job Input
 */
export interface UpdateJobInput {
  status?: JobStatus
  total_items?: number
  processed_items?: number
  failed_items?: number
  error_message?: string
  metadata?: Record<string, any>
  started_at?: Date
  completed_at?: Date
}

/**
 * Update Operation Input
 */
export interface UpdateOperationInput {
  status?: OperationStatus
  chunks_created?: number
  embeddings_stored?: number
  error_message?: string
  metadata?: Record<string, any>
  started_at?: Date
  completed_at?: Date
}

/**
 * CMS Content Item
 */
export interface CMSContent {
  id: string
  type: string
  title: string
  content: string
  url?: string
  metadata?: Record<string, any>
  updated_at?: Date
}

/**
 * Webhook Payload (generic structure)
 */
export interface WebhookPayload {
  event: string
  source: string
  content?: CMSContent
  timestamp?: string
}

/**
 * Sync Progress
 */
export interface SyncProgress {
  jobId: string
  status: JobStatus
  totalItems: number
  processedItems: number
  failedItems: number
  percentage: number
  currentItem?: string
}
