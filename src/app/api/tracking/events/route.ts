/**
 * Event Tracking API Endpoint
 *
 * POST /api/tracking/events
 *
 * Processes batched tracking events and feeds them into the persona detection system.
 */

import { NextRequest, NextResponse } from 'next/server'
import type {
  EventTrackingRequest,
  EventTrackingResponse,
  TrackingEvent,
} from '@/lib/tracking/schema'
import { serverSession } from '@/lib/persona/session'
import type { DetectionSignal } from '@/lib/persona/schema'

/**
 * POST /api/tracking/events
 *
 * Process tracking events
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request body
    const body: EventTrackingRequest = await request.json()

    let events: TrackingEvent[] = []

    if (body.batch) {
      events = body.batch.events
    } else if (body.event) {
      events = [body.event]
    } else {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Must provide either batch or event',
        },
        { status: 400 }
      )
    }

    if (events.length === 0) {
      return NextResponse.json(
        {
          error: 'No events provided',
        },
        { status: 400 }
      )
    }

    // Process events
    const sessionId = events[0].sessionId
    const signals = convertEventsToSignals(events)

    // Get existing persona profile
    const profile = serverSession.getProfileById(sessionId)

    if (profile) {
      // Add behavioral signals to profile
      profile.signals = [...profile.signals, ...signals]
      profile.lastUpdated = new Date()
      profile.interactionCount += events.length

      // Save updated profile
      serverSession.saveProfile(profile)
    }

    // Calculate processing time
    const processingTime = Date.now() - startTime

    // Build response
    const response: EventTrackingResponse = {
      success: true,
      eventsProcessed: events.length,
      processingTime,
      batchId: body.batch?.batchId,
    }

    // Add warnings if needed
    if (processingTime > 100) {
      response.warnings = [`Processing time (${processingTime}ms) exceeded target of 100ms`]
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'X-Processing-Time': `${processingTime}ms`,
        'X-Events-Processed': `${events.length}`,
      },
    })
  } catch (error) {
    console.error('Error processing tracking events:', error)

    return NextResponse.json(
      {
        error: 'Event processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Convert tracking events to persona detection signals
 */
function convertEventsToSignals(events: TrackingEvent[]): DetectionSignal[] {
  const signals: DetectionSignal[] = []

  for (const event of events) {
    // Create behavioral signal
    const signal: DetectionSignal = {
      type: 'behavioral',
      value: `${event.type}: ${event.name}`,
      weight: getEventWeight(event.type),
      confidence: 75,
      timestamp: event.timestamp,
      metadata: {
        eventId: event.id,
        eventType: event.type,
        eventCategory: event.category,
        pagePath: event.pagePath,
        ...event.metadata,
      },
    }

    signals.push(signal)
  }

  return signals
}

/**
 * Get event weight for persona detection
 */
function getEventWeight(eventType: string): number {
  const weights: Record<string, number> = {
    // High weight - strong indicators
    'form_submit': 1.0,
    'cta_click': 1.0,
    'button_click': 0.9,
    'download': 1.0,

    // Medium weight - moderate indicators
    'page_view': 0.7,
    'navigation': 0.7,
    'click': 0.6,
    'time_on_page': 0.8,

    // Lower weight - weaker indicators
    'scroll': 0.4,
    'hover': 0.3,
    'focus': 0.3,

    // Default
    'default': 0.5,
  }

  return weights[eventType] || weights.default
}

/**
 * GET /api/tracking/events
 *
 * Return API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/tracking/events',
    method: 'POST',
    description: 'Process behavioral tracking events and feed them into persona detection',
    version: '1.0.0',
    parameters: {
      batch: 'Event batch object with multiple events',
      event: 'Single tracking event (if not batching)',
      clientTimestamp: 'Client timestamp for latency calculation',
    },
    response: {
      success: 'Processing success status',
      eventsProcessed: 'Number of events processed',
      processingTime: 'Processing time in milliseconds',
      batchId: 'Batch ID if batch was sent',
      warnings: 'Optional warnings',
    },
    example: {
      request: {
        batch: {
          batchId: 'batch_123',
          sessionId: 'ts_abc',
          events: [
            {
              id: 'evt_1',
              type: 'click',
              category: 'interaction',
              name: 'Button Click',
              timestamp: '2025-10-13T12:00:00Z',
              metadata: {
                selector: 'button.cta',
                text: 'Get Started',
              },
            },
          ],
        },
      },
      response: {
        success: true,
        eventsProcessed: 1,
        processingTime: 45,
        batchId: 'batch_123',
      },
    },
  })
}

/**
 * OPTIONS /api/tracking/events
 *
 * CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
