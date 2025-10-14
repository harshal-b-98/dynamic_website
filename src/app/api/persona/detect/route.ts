/**
 * Persona Detection API Endpoint
 *
 * POST /api/persona/detect
 *
 * Classifies user into persona categories based on conversation, behavior, and context.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  classifyPersona,
  quickPersonaCheck,
  generateSessionId,
  createInitialProfile,
  updateProfileWithClassification,
  serverSession,
  safeValidatePersonaDetectionRequest,
  type PersonaDetectionRequest,
  type PersonaDetectionResponse,
} from '@/lib/persona'

/**
 * POST /api/persona/detect
 *
 * Detect and classify user persona
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request body
    const body = await request.json()

    // Validate request
    const validation = safeValidatePersonaDetectionRequest(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error,
        },
        { status: 400 }
      )
    }

    const detectionRequest: PersonaDetectionRequest = validation.data

    // Get or create session ID
    const sessionId = detectionRequest.sessionId || generateSessionId()

    // Get existing profile if available
    let profile = serverSession.getProfileById(sessionId)
    let isNew = false

    if (!profile) {
      // Create new profile
      profile = createInitialProfile(sessionId)
      isNew = true
    }

    // Check if we need to reclassify
    const existingPersona = profile.currentPersona
    const shouldReclassify =
      detectionRequest.forceReclassify ||
      isNew ||
      existingPersona.personaId === 'unknown' ||
      existingPersona.confidence < 70

    let classification = existingPersona

    if (shouldReclassify) {
      // Perform classification
      classification = await classifyPersona(detectionRequest, profile.signals)

      // Update profile with new classification
      const newSignals = classification.signals.filter(
        signal => !profile!.signals.some(s => s.timestamp === signal.timestamp && s.value === signal.value)
      )

      profile = updateProfileWithClassification(profile, classification, newSignals)

      // Save updated profile
      serverSession.saveProfile(profile)
    } else {
      // Quick check if classification is still valid
      const quickCheck = quickPersonaCheck(
        existingPersona.personaId,
        existingPersona.confidence,
        classification.signals
      )

      if (quickCheck.shouldReclassify) {
        // Reclassify
        classification = await classifyPersona(detectionRequest, profile.signals)

        const newSignals = classification.signals.filter(
          signal => !profile!.signals.some(s => s.timestamp === signal.timestamp && s.value === signal.value)
        )

        profile = updateProfileWithClassification(profile, classification, newSignals)
        serverSession.saveProfile(profile)
      }
    }

    // Calculate processing time
    const processingTime = Date.now() - startTime

    // Build response
    const response: PersonaDetectionResponse = {
      sessionId: profile.sessionId,
      classification,
      profile,
      isNew,
      processingTime,
    }

    // Add warnings if needed
    if (processingTime > 200) {
      response.warnings = [`Processing time (${processingTime}ms) exceeded target of 200ms`]
    }

    if (classification.confidence < 60) {
      response.warnings = [
        ...(response.warnings || []),
        'Low confidence classification - consider collecting more signals',
      ]
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'X-Processing-Time': `${processingTime}ms`,
        'X-Persona-Id': classification.personaId,
        'X-Confidence': `${classification.confidence}`,
      },
    })
  } catch (error) {
    console.error('Error in persona detection:', error)

    return NextResponse.json(
      {
        error: 'Persona detection failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/persona/detect
 *
 * Return API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/persona/detect',
    method: 'POST',
    description: 'Detect and classify user persona based on conversation, behavior, and context',
    version: '1.0.0',
    parameters: {
      sessionId: 'Optional session ID (will be generated if not provided)',
      conversationHistory: 'Array of conversation messages',
      behavioralSignals: 'Array of behavioral signals',
      contextualInfo: 'Contextual information (referrer, device, etc.)',
      forceReclassify: 'Force re-classification even if confident classification exists',
    },
    response: {
      sessionId: 'Session identifier',
      classification: 'Persona classification result with confidence score',
      profile: 'Complete persona profile',
      isNew: 'Whether this is a new session',
      processingTime: 'Processing time in milliseconds',
      warnings: 'Optional warnings or notes',
    },
    example: {
      request: {
        conversationHistory: [
          {
            role: 'user',
            content: 'I need an affordable solution for my small business',
          },
        ],
        contextualInfo: {
          referrer: 'https://google.com',
          deviceType: 'desktop',
        },
      },
      response: {
        sessionId: 'ps_abc123',
        classification: {
          personaId: 'smb_owner',
          confidence: 85,
          isConfident: true,
          reasoning: 'User mentioned small business and affordability',
        },
        isNew: true,
        processingTime: 156,
      },
    },
  })
}

/**
 * OPTIONS /api/persona/detect
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
