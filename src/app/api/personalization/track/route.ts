/**
 * Personalization Tracking API Endpoint
 *
 * POST /api/personalization/track
 *
 * Tracks personalization events (impressions, interactions, conversions).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsTracker } from '@/lib/personalization/analytics'
import { getABTestManager } from '@/lib/personalization/ab-testing'
import { serverSession } from '@/lib/persona/session'
import type { ConversionEvent } from '@/lib/personalization/schema'
import { v4 as uuidv4 } from 'uuid'

/**
 * POST /api/personalization/track
 *
 * Track personalization event
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { type, sessionId, variantId, slotId, testId, metadata, conversionGoal } = body

    if (!type || !sessionId || !variantId || !slotId) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'type, sessionId, variantId, and slotId are required',
        },
        { status: 400 }
      )
    }

    // Get persona profile
    const profile = serverSession.getProfileById(sessionId)

    const analyticsTracker = getAnalyticsTracker()
    const abTestManager = getABTestManager()

    switch (type) {
      case 'impression':
        // Track impression
        analyticsTracker.trackImpression(sessionId, variantId, slotId, {
          personaId: profile?.currentPersona?.personaId,
          testId,
          metadata,
        })

        // Track A/B test impression if applicable
        if (testId) {
          abTestManager.recordImpression(testId, variantId)
        }

        return NextResponse.json(
          {
            success: true,
            type: 'impression',
            tracked: true,
          },
          { status: 200 }
        )

      case 'interaction':
        // Track interaction
        analyticsTracker.trackInteraction(sessionId, variantId, slotId, {
          personaId: profile?.currentPersona?.personaId,
          testId,
          metadata,
        })

        return NextResponse.json(
          {
            success: true,
            type: 'interaction',
            tracked: true,
          },
          { status: 200 }
        )

      case 'conversion':
        if (!conversionGoal) {
          return NextResponse.json(
            {
              error: 'Missing conversion goal',
              message: 'conversionGoal is required for conversion events',
            },
            { status: 400 }
          )
        }

        // Create conversion event
        const conversionEvent: ConversionEvent = {
          id: uuidv4(),
          sessionId,
          abTestId: testId,
          variantId,
          conversionGoal,
          timestamp: new Date(),
          metadata,
        }

        // Track conversion
        analyticsTracker.trackConversion(conversionEvent)

        // Track A/B test conversion if applicable
        if (testId) {
          abTestManager.recordConversion(conversionEvent)

          // Calculate statistical significance
          abTestManager.calculateSignificance(testId)

          // Check for winner
          const winner = abTestManager.getWinner(testId)
          if (winner) {
            console.log(`[Personalization] Test ${testId} has a winner: ${winner.variantId}`)
          }
        }

        return NextResponse.json(
          {
            success: true,
            type: 'conversion',
            tracked: true,
            conversionId: conversionEvent.id,
          },
          { status: 200 }
        )

      default:
        return NextResponse.json(
          {
            error: 'Invalid event type',
            message: 'type must be one of: impression, interaction, conversion',
          },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[Personalization] Error tracking event:', error)

    return NextResponse.json(
      {
        error: 'Event tracking failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/personalization/track
 *
 * Return API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/personalization/track',
    method: 'POST',
    description: 'Track personalization events (impressions, interactions, conversions)',
    version: '1.0.0',
    eventTypes: ['impression', 'interaction', 'conversion'],
    parameters: {
      type: 'Event type (impression | interaction | conversion)',
      sessionId: 'Session ID',
      variantId: 'Variant ID that was shown',
      slotId: 'Content slot ID',
      testId: 'Optional: A/B test ID',
      conversionGoal: 'Required for conversions: Goal identifier',
      metadata: 'Optional: Additional event metadata',
    },
    response: {
      success: 'Tracking success status',
      type: 'Event type that was tracked',
      tracked: 'Whether event was successfully tracked',
      conversionId: 'Conversion event ID (for conversions only)',
    },
  })
}
