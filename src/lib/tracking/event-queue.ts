/**
 * Event Queue and Batching System
 *
 * Manages event batching to reduce network overhead and optimize performance.
 */

import { v4 as uuidv4 } from 'uuid'
import type { TrackingEvent, EventBatch, EventTrackingResponse } from './schema'

/**
 * Queue configuration
 */
export interface QueueConfig {
  /** Maximum batch size (number of events) */
  maxBatchSize: number

  /** Maximum time to hold events before flushing (ms) */
  maxBatchWait: number

  /** Maximum queue size */
  maxQueueSize: number

  /** API endpoint for sending events */
  endpoint: string

  /** Retry configuration */
  retry: {
    /** Maximum retries */
    maxRetries: number
    /** Initial retry delay (ms) */
    initialDelay: number
    /** Backoff multiplier */
    backoffMultiplier: number
  }

  /** Enable persistence (localStorage) */
  enablePersistence: boolean

  /** Debug mode */
  debug: boolean

  /** Callback for successful batch send */
  onSuccess?: (batch: EventBatch, response: EventTrackingResponse) => void

  /** Callback for failed batch send */
  onError?: (batch: EventBatch, error: Error) => void
}

/**
 * Default queue configuration
 */
const DEFAULT_CONFIG: QueueConfig = {
  maxBatchSize: 50,
  maxBatchWait: 5000, // 5 seconds
  maxQueueSize: 500,
  endpoint: '/api/tracking/events',
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
  },
  enablePersistence: true,
  debug: false,
}

/**
 * Queue status
 */
export type QueueStatus = 'idle' | 'flushing' | 'paused'

/**
 * Event queue for batching
 */
export class EventQueue {
  private config: QueueConfig
  private queue: TrackingEvent[]
  private sessionId: string
  private flushTimer?: NodeJS.Timeout
  private status: QueueStatus
  private retryCount: Map<string, number>

  constructor(sessionId: string, config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.queue = []
    this.sessionId = sessionId
    this.status = 'idle'
    this.retryCount = new Map()

    // Load persisted events
    if (this.config.enablePersistence) {
      this.loadPersistedEvents()
    }

    // Start flush timer
    this.startFlushTimer()

    if (this.config.debug) {
      console.log('[EventQueue] Initialized', {
        sessionId,
        config: this.config,
      })
    }
  }

  /**
   * Add event to queue
   */
  enqueue(event: TrackingEvent): void {
    if (this.queue.length >= this.config.maxQueueSize) {
      console.warn('[EventQueue] Queue full, dropping oldest event')
      this.queue.shift()
    }

    this.queue.push(event)

    if (this.config.debug) {
      console.log('[EventQueue] Event enqueued', {
        eventId: event.id,
        queueSize: this.queue.length,
      })
    }

    // Persist queue
    if (this.config.enablePersistence) {
      this.persistQueue()
    }

    // Check if should flush immediately
    if (this.queue.length >= this.config.maxBatchSize) {
      this.flush()
    }
  }

  /**
   * Flush queue (send all events)
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) {
      if (this.config.debug) {
        console.log('[EventQueue] Nothing to flush')
      }
      return
    }

    if (this.status === 'flushing') {
      if (this.config.debug) {
        console.log('[EventQueue] Already flushing')
      }
      return
    }

    this.status = 'flushing'

    // Create batch
    const events = this.queue.splice(0, this.config.maxBatchSize)
    const batch: EventBatch = {
      batchId: uuidv4(),
      sessionId: this.sessionId,
      events,
      timestamp: new Date(),
      size: events.length,
    }

    if (this.config.debug) {
      console.log('[EventQueue] Flushing batch', {
        batchId: batch.batchId,
        eventCount: batch.size,
      })
    }

    try {
      // Send batch
      const response = await this.sendBatch(batch)

      if (this.config.debug) {
        console.log('[EventQueue] Batch sent successfully', {
          batchId: batch.batchId,
          processingTime: response.processingTime,
        })
      }

      // Clear retry count
      this.retryCount.delete(batch.batchId)

      // Callback
      if (this.config.onSuccess) {
        this.config.onSuccess(batch, response)
      }
    } catch (error) {
      console.error('[EventQueue] Failed to send batch', error)

      // Check retry count
      const retries = this.retryCount.get(batch.batchId) || 0

      if (retries < this.config.retry.maxRetries) {
        // Re-queue events for retry
        this.queue.unshift(...batch.events)
        this.retryCount.set(batch.batchId, retries + 1)

        // Schedule retry with exponential backoff
        const delay = this.config.retry.initialDelay * Math.pow(this.config.retry.backoffMultiplier, retries)

        setTimeout(() => {
          this.flush()
        }, delay)

        if (this.config.debug) {
          console.log('[EventQueue] Scheduled retry', {
            batchId: batch.batchId,
            attempt: retries + 1,
            delay,
          })
        }
      } else {
        console.error('[EventQueue] Max retries reached, dropping batch', batch.batchId)

        // Callback
        if (this.config.onError) {
          this.config.onError(batch, error as Error)
        }
      }
    } finally {
      this.status = 'idle'

      // Persist queue
      if (this.config.enablePersistence) {
        this.persistQueue()
      }
    }
  }

  /**
   * Send batch to server
   */
  private async sendBatch(batch: EventBatch): Promise<EventTrackingResponse> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        batch,
        clientTimestamp: new Date(),
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0 && this.status !== 'paused') {
        this.flush()
      }
    }, this.config.maxBatchWait)
  }

  /**
   * Persist queue to localStorage
   */
  private persistQueue(): void {
    if (typeof window === 'undefined') return

    try {
      const data = JSON.stringify({
        sessionId: this.sessionId,
        events: this.queue,
        timestamp: Date.now(),
      })

      localStorage.setItem('tracking_event_queue', data)
    } catch (error) {
      console.error('[EventQueue] Failed to persist queue', error)
    }
  }

  /**
   * Load persisted events from localStorage
   */
  private loadPersistedEvents(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('tracking_event_queue')
      if (!stored) return

      const data = JSON.parse(stored)

      // Check if data is recent (within 1 hour)
      const age = Date.now() - data.timestamp
      if (age > 60 * 60 * 1000) {
        localStorage.removeItem('tracking_event_queue')
        return
      }

      // Restore events
      if (data.sessionId === this.sessionId && Array.isArray(data.events)) {
        this.queue = data.events.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }))

        if (this.config.debug) {
          console.log('[EventQueue] Loaded persisted events', {
            count: this.queue.length,
          })
        }
      }
    } catch (error) {
      console.error('[EventQueue] Failed to load persisted events', error)
    }
  }

  /**
   * Clear persisted queue
   */
  private clearPersistedQueue(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem('tracking_event_queue')
    } catch (error) {
      console.error('[EventQueue] Failed to clear persisted queue', error)
    }
  }

  /**
   * Get queue size
   */
  getSize(): number {
    return this.queue.length
  }

  /**
   * Get queue status
   */
  getStatus(): QueueStatus {
    return this.status
  }

  /**
   * Pause queue (stop flushing)
   */
  pause(): void {
    this.status = 'paused'
  }

  /**
   * Resume queue
   */
  resume(): void {
    this.status = 'idle'
    this.startFlushTimer()
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = []
    this.retryCount.clear()
    this.clearPersistedQueue()

    if (this.config.debug) {
      console.log('[EventQueue] Queue cleared')
    }
  }

  /**
   * Destroy queue
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    // Flush remaining events
    if (this.queue.length > 0) {
      this.flush()
    }

    this.clear()
  }
}

/**
 * Global queue instance
 */
let globalQueue: EventQueue | null = null

/**
 * Initialize global queue
 */
export function initializeQueue(
  sessionId: string,
  config?: Partial<QueueConfig>
): EventQueue {
  if (globalQueue) {
    return globalQueue
  }

  globalQueue = new EventQueue(sessionId, config)
  return globalQueue
}

/**
 * Get global queue
 */
export function getQueue(): EventQueue | null {
  return globalQueue
}

/**
 * Enqueue event to global queue
 */
export function enqueueEvent(event: TrackingEvent): void {
  if (!globalQueue) {
    console.warn('[EventQueue] Queue not initialized, event dropped')
    return
  }

  globalQueue.enqueue(event)
}

/**
 * Flush global queue
 */
export async function flushQueue(): Promise<void> {
  if (!globalQueue) {
    return
  }

  await globalQueue.flush()
}
