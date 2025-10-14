/**
 * Behavioral Tracking System
 *
 * Central exports for the behavioral tracking system.
 */

// Schema exports
export * from './schema'
export type {
  EventType,
  EventCategory,
  EventMetadata,
  TrackingEvent,
  EventBatch,
  EventTrackingRequest,
  EventTrackingResponse,
  SessionSummary,
  EventFilter,
  AnalyticsQuery,
} from './schema'

export {
  EventTypeSchema,
  EventCategorySchema,
  EventMetadataSchema,
  TrackingEventSchema,
  EventBatchSchema,
  EventTrackingRequestSchema,
  EventTrackingResponseSchema,
  SessionSummarySchema,
  EventFilterSchema,
  AnalyticsQuerySchema,
  validateTrackingEvent,
  validateEventBatch,
  validateEventTrackingRequest,
  safeValidateTrackingEvent,
  isValidEventType,
  isValidEventCategory,
  TRACKING_SCHEMA_VERSION,
} from './schema'

// Client tracker exports
export type { TrackerConfig } from './client-tracker'

export {
  ClientTracker,
  initializeTracker,
  getTracker,
} from './client-tracker'

// Event queue exports
export type { QueueConfig, QueueStatus } from './event-queue'

export {
  EventQueue,
  initializeQueue,
  getQueue,
  enqueueEvent,
  flushQueue,
} from './event-queue'
