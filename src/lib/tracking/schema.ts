/**
 * Behavioral Tracking Schema
 *
 * Type-safe schemas for event tracking, user behavior analysis, and analytics.
 */

import { z } from 'zod'

/**
 * Event types taxonomy
 */
export const EventTypeSchema = z.enum([
  // Navigation events
  'page_view',
  'page_leave',
  'navigation',

  // Interaction events
  'click',
  'hover',
  'scroll',
  'focus',
  'blur',

  // Form events
  'form_start',
  'form_submit',
  'form_abandon',
  'input_change',
  'input_focus',

  // Media events
  'video_play',
  'video_pause',
  'video_complete',

  // Engagement events
  'time_on_page',
  'session_start',
  'session_end',
  'download',
  'share',

  // CTA events
  'cta_view',
  'cta_click',
  'button_click',

  // Error events
  'error',
  'api_error',

  // Custom events
  'custom',
])

export type EventType = z.infer<typeof EventTypeSchema>

/**
 * Event category for grouping
 */
export const EventCategorySchema = z.enum([
  'navigation',
  'interaction',
  'form',
  'media',
  'engagement',
  'conversion',
  'error',
  'custom',
])

export type EventCategory = z.infer<typeof EventCategorySchema>

/**
 * Event metadata schema
 */
export const EventMetadataSchema = z.object({
  /** Element selector (CSS selector) */
  selector: z.string().optional(),

  /** Element text content */
  text: z.string().optional(),

  /** Element attributes */
  attributes: z.record(z.string(), z.string()).optional(),

  /** Element position (x, y) */
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),

  /** Scroll depth percentage (0-100) */
  scrollDepth: z.number().min(0).max(100).optional(),

  /** Time spent in milliseconds */
  duration: z.number().optional(),

  /** Page URL */
  url: z.string().optional(),

  /** Referrer URL */
  referrer: z.string().optional(),

  /** Form ID */
  formId: z.string().optional(),

  /** Field name */
  fieldName: z.string().optional(),

  /** Error message */
  errorMessage: z.string().optional(),

  /** Additional custom properties */
  custom: z.record(z.string(), z.unknown()).optional(),
})

export type EventMetadata = z.infer<typeof EventMetadataSchema>

/**
 * Tracking event schema
 */
export const TrackingEventSchema = z.object({
  /** Unique event ID */
  id: z.string(),

  /** Event type */
  type: EventTypeSchema,

  /** Event category */
  category: EventCategorySchema,

  /** Event name/label */
  name: z.string(),

  /** Event timestamp */
  timestamp: z.date(),

  /** Session ID */
  sessionId: z.string(),

  /** User ID (if authenticated) */
  userId: z.string().optional(),

  /** Page path */
  pagePath: z.string(),

  /** Page title */
  pageTitle: z.string().optional(),

  /** Event metadata */
  metadata: EventMetadataSchema,

  /** Device information */
  device: z.object({
    type: z.enum(['desktop', 'mobile', 'tablet']).optional(),
    userAgent: z.string().optional(),
    screenWidth: z.number().optional(),
    screenHeight: z.number().optional(),
    viewportWidth: z.number().optional(),
    viewportHeight: z.number().optional(),
  }).optional(),

  /** Performance metrics */
  performance: z.object({
    /** Time to interactive */
    timeToInteractive: z.number().optional(),
    /** Page load time */
    pageLoadTime: z.number().optional(),
    /** DOM ready time */
    domReady: z.number().optional(),
  }).optional(),
})

export type TrackingEvent = z.infer<typeof TrackingEventSchema>

/**
 * Event batch schema (for batching multiple events)
 */
export const EventBatchSchema = z.object({
  /** Batch ID */
  batchId: z.string(),

  /** Session ID */
  sessionId: z.string(),

  /** Events in this batch */
  events: z.array(TrackingEventSchema),

  /** Batch timestamp */
  timestamp: z.date(),

  /** Batch size */
  size: z.number(),
})

export type EventBatch = z.infer<typeof EventBatchSchema>

/**
 * Event tracking request (client -> server)
 */
export const EventTrackingRequestSchema = z.object({
  /** Single event or batch */
  batch: EventBatchSchema.optional(),

  /** Single event (if not batched) */
  event: TrackingEventSchema.optional(),

  /** Client timestamp for latency calculation */
  clientTimestamp: z.date(),
})

export type EventTrackingRequest = z.infer<typeof EventTrackingRequestSchema>

/**
 * Event tracking response (server -> client)
 */
export const EventTrackingResponseSchema = z.object({
  /** Success status */
  success: z.boolean(),

  /** Events processed count */
  eventsProcessed: z.number(),

  /** Processing time in milliseconds */
  processingTime: z.number(),

  /** Batch ID (if batch was sent) */
  batchId: z.string().optional(),

  /** Any warnings */
  warnings: z.array(z.string()).optional(),

  /** Errors (if any) */
  errors: z.array(z.string()).optional(),
})

export type EventTrackingResponse = z.infer<typeof EventTrackingResponseSchema>

/**
 * Session summary schema
 */
export const SessionSummarySchema = z.object({
  /** Session ID */
  sessionId: z.string(),

  /** Session start time */
  startTime: z.date(),

  /** Session end time */
  endTime: z.date().optional(),

  /** Total duration in milliseconds */
  duration: z.number(),

  /** Pages visited */
  pagesVisited: z.number(),

  /** Total events */
  totalEvents: z.number(),

  /** Events by type */
  eventsByType: z.record(EventTypeSchema, z.number()),

  /** Average time on page */
  avgTimeOnPage: z.number(),

  /** Bounce (single page visit) */
  isBounce: z.boolean(),

  /** Converted (completed desired action) */
  isConverted: z.boolean().optional(),

  /** Device type */
  deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional(),
})

export type SessionSummary = z.infer<typeof SessionSummarySchema>

/**
 * Event filter schema (for querying)
 */
export const EventFilterSchema = z.object({
  /** Session ID filter */
  sessionId: z.string().optional(),

  /** User ID filter */
  userId: z.string().optional(),

  /** Event types filter */
  types: z.array(EventTypeSchema).optional(),

  /** Event categories filter */
  categories: z.array(EventCategorySchema).optional(),

  /** Start date filter */
  startDate: z.date().optional(),

  /** End date filter */
  endDate: z.date().optional(),

  /** Page path filter */
  pagePath: z.string().optional(),

  /** Limit results */
  limit: z.number().max(1000).optional(),

  /** Offset for pagination */
  offset: z.number().optional(),
})

export type EventFilter = z.infer<typeof EventFilterSchema>

/**
 * Analytics query schema
 */
export const AnalyticsQuerySchema = z.object({
  /** Query type */
  queryType: z.enum([
    'events',
    'sessions',
    'funnel',
    'retention',
    'engagement',
    'conversion',
  ]),

  /** Filters */
  filters: EventFilterSchema.optional(),

  /** Group by field */
  groupBy: z.array(z.string()).optional(),

  /** Aggregation functions */
  aggregations: z.array(z.enum(['count', 'sum', 'avg', 'min', 'max'])).optional(),

  /** Date range */
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
})

export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>

/**
 * Validation helper functions
 */

export function validateTrackingEvent(data: unknown): TrackingEvent {
  return TrackingEventSchema.parse(data)
}

export function validateEventBatch(data: unknown): EventBatch {
  return EventBatchSchema.parse(data)
}

export function validateEventTrackingRequest(data: unknown): EventTrackingRequest {
  return EventTrackingRequestSchema.parse(data)
}

export function safeValidateTrackingEvent(
  data: unknown
): { success: true; data: TrackingEvent } | { success: false; error: string } {
  try {
    const validated = TrackingEventSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      }
    }
    return { success: false, error: 'Unknown validation error' }
  }
}

/**
 * Type guards
 */

export function isValidEventType(value: unknown): value is EventType {
  return EventTypeSchema.safeParse(value).success
}

export function isValidEventCategory(value: unknown): value is EventCategory {
  return EventCategorySchema.safeParse(value).success
}

/**
 * Schema version
 */
export const TRACKING_SCHEMA_VERSION = '1.0.0'
