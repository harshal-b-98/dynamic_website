/**
 * Tracking Context
 *
 * Provides global tracking state management and automatic event collection.
 */

'use client'

import React, { createContext, useContext, useEffect, useRef } from 'react'
import { ClientTracker, initializeTracker, type TrackerConfig } from '@/lib/tracking/client-tracker'
import { EventQueue, initializeQueue, type QueueConfig } from '@/lib/tracking/event-queue'
import type { EventType, EventCategory, EventMetadata } from '@/lib/tracking/schema'

/**
 * Tracking Context State
 */
interface TrackingContextState {
  /** Tracker instance */
  tracker: ClientTracker | null

  /** Event queue instance */
  queue: EventQueue | null

  /** Is tracking enabled? */
  isEnabled: boolean

  /** Track custom event */
  track: (type: EventType, name: string, metadata?: EventMetadata, category?: EventCategory) => void

  /** Enable tracking */
  enable: () => void

  /** Disable tracking */
  disable: () => void

  /** Flush event queue */
  flush: () => Promise<void>
}

/**
 * Create context
 */
const TrackingContext = createContext<TrackingContextState | undefined>(undefined)

/**
 * Tracking Provider Props
 */
interface TrackingProviderProps {
  children: React.ReactNode

  /** Tracker configuration */
  trackerConfig?: Partial<TrackerConfig>

  /** Queue configuration */
  queueConfig?: Partial<QueueConfig>

  /** Session ID (will use tracker's session if not provided) */
  sessionId?: string

  /** Enable tracking by default */
  enabled?: boolean
}

/**
 * Tracking Provider Component
 */
export function TrackingProvider({
  children,
  trackerConfig,
  queueConfig,
  sessionId,
  enabled = true,
}: TrackingProviderProps) {
  const trackerRef = useRef<ClientTracker | null>(null)
  const queueRef = useRef<EventQueue | null>(null)

  useEffect(() => {
    // Initialize queue first
    const session = sessionId || `ts_${Date.now()}`
    const queue = initializeQueue(session, queueConfig)
    queueRef.current = queue

    // Initialize tracker with event callback
    const tracker = initializeTracker({
      ...trackerConfig,
      enabled,
      onEvent: (event) => {
        // Enqueue event for batching
        queue.enqueue(event)
      },
    })
    trackerRef.current = tracker

    // Cleanup on unmount
    return () => {
      if (trackerRef.current) {
        trackerRef.current.destroy()
      }
      if (queueRef.current) {
        queueRef.current.destroy()
      }
    }
  }, [])

  /**
   * Track custom event
   */
  const track = (
    type: EventType,
    name: string,
    metadata?: EventMetadata,
    category: EventCategory = 'custom'
  ) => {
    if (trackerRef.current) {
      trackerRef.current.track(type, name, metadata, category)
    }
  }

  /**
   * Enable tracking
   */
  const enable = () => {
    if (trackerRef.current) {
      trackerRef.current.enable()
    }
  }

  /**
   * Disable tracking
   */
  const disable = () => {
    if (trackerRef.current) {
      trackerRef.current.disable()
    }
  }

  /**
   * Flush event queue
   */
  const flush = async () => {
    if (queueRef.current) {
      await queueRef.current.flush()
    }
  }

  const value: TrackingContextState = {
    tracker: trackerRef.current,
    queue: queueRef.current,
    isEnabled: enabled,
    track,
    enable,
    disable,
    flush,
  }

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>
}

/**
 * Use Tracking Hook
 */
export function useTracking(): TrackingContextState {
  const context = useContext(TrackingContext)

  if (!context) {
    throw new Error('useTracking must be used within TrackingProvider')
  }

  return context
}

/**
 * Use Track Hook (convenience)
 */
export function useTrack() {
  const { track } = useTracking()
  return track
}

/**
 * Use Track Event Hook (custom hook for specific event type)
 */
export function useTrackEvent(
  type: EventType,
  category: EventCategory = 'custom'
): (name: string, metadata?: EventMetadata) => void {
  const { track } = useTracking()

  return React.useCallback(
    (name: string, metadata?: EventMetadata) => {
      track(type, name, metadata, category)
    },
    [track, type, category]
  )
}

/**
 * Use Track Click Hook
 */
export function useTrackClick(): (name: string, metadata?: EventMetadata) => void {
  return useTrackEvent('click', 'interaction')
}

/**
 * Use Track Page View Hook
 */
export function useTrackPageView(): (name?: string, metadata?: EventMetadata) => void {
  const track = useTrackEvent('page_view', 'navigation')

  return React.useCallback(
    (name?: string, metadata?: EventMetadata) => {
      track(name || document.title, {
        ...metadata,
        url: window.location.href,
        referrer: document.referrer,
      })
    },
    [track]
  )
}

/**
 * Use Auto Track Page View Effect
 */
export function useAutoTrackPageView() {
  const trackPageView = useTrackPageView()

  useEffect(() => {
    trackPageView()
  }, [trackPageView])
}
