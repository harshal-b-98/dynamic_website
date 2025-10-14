/**
 * Persona Retrieval API Endpoint
 *
 * GET /api/persona/get?sessionId=xxx
 *
 * Retrieves existing persona profile for a session.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  serverSession,
  getPersonaDefinition,
  type PersonaProfile,
} from '@/lib/persona'

/**
 * GET /api/persona/get
 *
 * Retrieve persona profile by session ID
 */
export async function GET(request: NextRequest) {
  try {
    // Get session ID from query params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        {
          error: 'Missing sessionId parameter',
          message: 'Please provide a sessionId query parameter',
        },
        { status: 400 }
      )
    }

    // Get profile from session
    const profile = serverSession.getProfileById(sessionId)

    if (!profile) {
      return NextResponse.json(
        {
          error: 'Session not found',
          message: `No persona profile found for session: ${sessionId}`,
          sessionId,
        },
        { status: 404 }
      )
    }

    // Get persona definition for additional context
    const personaDefinition = getPersonaDefinition(profile.currentPersona.personaId)

    // Build response
    const response = {
      sessionId: profile.sessionId,
      persona: {
        id: profile.currentPersona.personaId,
        name: personaDefinition.name,
        description: personaDefinition.description,
        confidence: profile.currentPersona.confidence,
        isConfident: profile.currentPersona.isConfident,
        classifiedAt: profile.currentPersona.classifiedAt,
        reasoning: profile.currentPersona.reasoning,
      },
      profile: {
        sessionStart: profile.sessionStart,
        lastUpdated: profile.lastUpdated,
        interactionCount: profile.interactionCount,
        classificationHistory: profile.classificationHistory.map(c => ({
          personaId: c.personaId,
          confidence: c.confidence,
          classifiedAt: c.classifiedAt,
        })),
        signalCount: profile.signals.length,
      },
      metadata: profile.metadata,
      consent: profile.consent,
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60',
        'X-Persona-Id': profile.currentPersona.personaId,
        'X-Confidence': `${profile.currentPersona.confidence}`,
      },
    })
  } catch (error) {
    console.error('Error retrieving persona:', error)

    return NextResponse.json(
      {
        error: 'Failed to retrieve persona',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/persona/get
 *
 * Batch retrieve multiple persona profiles
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionIds } = body

    if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Please provide an array of sessionIds',
        },
        { status: 400 }
      )
    }

    // Limit batch size
    if (sessionIds.length > 100) {
      return NextResponse.json(
        {
          error: 'Batch too large',
          message: 'Maximum 100 session IDs per request',
        },
        { status: 400 }
      )
    }

    // Retrieve all profiles
    const profiles: Array<{ sessionId: string; persona: any; profile: any }> = []
    const notFound: string[] = []

    for (const sessionId of sessionIds) {
      const profile = serverSession.getProfileById(sessionId)

      if (profile) {
        const personaDefinition = getPersonaDefinition(profile.currentPersona.personaId)

        profiles.push({
          sessionId: profile.sessionId,
          persona: {
            id: profile.currentPersona.personaId,
            name: personaDefinition.name,
            confidence: profile.currentPersona.confidence,
            isConfident: profile.currentPersona.isConfident,
          },
          profile: {
            sessionStart: profile.sessionStart,
            lastUpdated: profile.lastUpdated,
            interactionCount: profile.interactionCount,
          },
        })
      } else {
        notFound.push(sessionId)
      }
    }

    return NextResponse.json({
      profiles,
      notFound,
      total: sessionIds.length,
      found: profiles.length,
    })
  } catch (error) {
    console.error('Error in batch persona retrieval:', error)

    return NextResponse.json(
      {
        error: 'Batch retrieval failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/persona/get
 *
 * Delete persona profile (GDPR compliance)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        {
          error: 'Missing sessionId parameter',
          message: 'Please provide a sessionId query parameter',
        },
        { status: 400 }
      )
    }

    // Delete session
    serverSession.clearSessionById(sessionId)

    return NextResponse.json({
      message: 'Persona profile deleted successfully',
      sessionId,
    })
  } catch (error) {
    console.error('Error deleting persona:', error)

    return NextResponse.json(
      {
        error: 'Failed to delete persona',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/persona/get
 *
 * CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
