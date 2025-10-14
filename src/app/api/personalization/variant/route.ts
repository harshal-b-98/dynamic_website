/**
 * Personalization Variant API Endpoint
 *
 * POST /api/personalization/variant
 *
 * Returns the personalized variant for a content slot based on persona and rules.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getVariantStore,
  initializeVariantRegistry,
  RulesEngine,
  createPersonaRule,
} from '@/lib/personalization'
import { serverSession } from '@/lib/persona/session'
import type {
  PersonalizationRequest,
  PersonalizationResponse,
  PersonalizationContext,
} from '@/lib/personalization/schema'
import type { PersonaProfile } from '@/lib/persona/schema'

/**
 * POST /api/personalization/variant
 *
 * Get personalized variant for a content slot
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request body
    const body = await request.json()
    const { slotId, sessionId, forceVariantId } = body

    if (!slotId || !sessionId) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'slotId and sessionId are required',
        },
        { status: 400 }
      )
    }

    // Initialize variant registry (with default variants)
    initializeVariantRegistry()
    const variantStore = getVariantStore()

    // Get variant group for slot
    const variantGroup = variantStore.getGroupBySlot(slotId)

    if (!variantGroup) {
      return NextResponse.json(
        {
          error: 'Slot not found',
          message: `No variant group found for slot: ${slotId}`,
        },
        { status: 404 }
      )
    }

    // Get persona profile
    const profile = serverSession.getProfileById(sessionId)

    // Force specific variant if requested (for testing)
    if (forceVariantId) {
      const variant = variantStore.getVariant(forceVariantId)
      if (variant) {
        const response: PersonalizationResponse = {
          variant,
          isFallback: false,
          isABTest: false,
          metadata: {
            processingTime: Date.now() - startTime,
            rulesEvaluated: 0,
          },
        }

        return NextResponse.json(response, {
          headers: {
            'X-Processing-Time': `${response.metadata?.processingTime}ms`,
          },
        })
      }
    }

    // Build personalization context
    const context = buildPersonalizationContext(sessionId, profile, request)

    // Build rules for persona-based selection
    const rules = buildPersonaRules(variantGroup)

    // Evaluate rules
    const rulesEngine = new RulesEngine(rules, { debug: false })
    const matchedRule = rulesEngine.evaluateRules(context)

    let selectedVariant = variantStore.getDefaultVariant(variantGroup.id)!
    let isFallback = true
    let isABTest = false

    if (matchedRule && matchedRule.matched) {
      const variant = variantStore.getVariant(matchedRule.variantId!)
      if (variant) {
        selectedVariant = variant
        isFallback = false
      }
    }

    // TODO: Check for active A/B tests and assign variant if applicable
    // For now, using rule-based personalization only

    // Build response
    const response: PersonalizationResponse = {
      variant: selectedVariant,
      matchedRule: matchedRule && matchedRule.matched ? rules.find(r => r.id === matchedRule.ruleId) : undefined,
      isFallback,
      isABTest,
      metadata: {
        processingTime: Date.now() - startTime,
        rulesEvaluated: rules.length,
      },
    }

    // Check performance target
    if (response.metadata!.processingTime > 500) {
      console.warn(
        `[Personalization] Slow response: ${response.metadata!.processingTime}ms (target: <500ms)`
      )
    }

    return NextResponse.json(response, {
      headers: {
        'X-Processing-Time': `${response.metadata?.processingTime}ms`,
        'X-Variant-Id': selectedVariant.id,
        'X-Is-Fallback': isFallback ? 'true' : 'false',
      },
    })
  } catch (error) {
    console.error('[Personalization] Error getting variant:', error)

    return NextResponse.json(
      {
        error: 'Variant fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Build personalization context from session and profile
 */
function buildPersonalizationContext(
  sessionId: string,
  profile: PersonaProfile | null | undefined,
  request: NextRequest
): PersonalizationContext {
  // Extract UTM parameters from URL
  const url = new URL(request.url)
  const utmSource = url.searchParams.get('utm_source')
  const utmMedium = url.searchParams.get('utm_medium')
  const utmCampaign = url.searchParams.get('utm_campaign')
  const utmTerm = url.searchParams.get('utm_term')
  const utmContent = url.searchParams.get('utm_content')

  // Get user agent for device detection
  const userAgent = request.headers.get('user-agent') || ''
  const device = detectDevice(userAgent)

  const context: PersonalizationContext = {
    sessionId,
    personaId: profile?.currentPersona?.personaId,
    confidence: profile?.currentPersona?.confidence,
    sessionCount: profile?.interactionCount || 1,
    pageViews: 0, // Would need tracking data
    timeOnSite: 0, // Would need to calculate from tracking data
    referrer: request.headers.get('referer') || undefined,
    utm:
      utmSource || utmMedium || utmCampaign
        ? {
            source: utmSource || undefined,
            medium: utmMedium || undefined,
            campaign: utmCampaign || undefined,
            term: utmTerm || undefined,
            content: utmContent || undefined,
          }
        : undefined,
    device,
    language: request.headers.get('accept-language')?.split(',')[0] || undefined,
  }

  return context
}

/**
 * Detect device type from user agent
 */
function detectDevice(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase()

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }

  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }

  return 'desktop'
}

/**
 * Build persona-based rules for variant selection
 */
function buildPersonaRules(variantGroup: any): any[] {
  const rules = []

  // Create rule for each persona-specific variant
  for (const variant of variantGroup.variants) {
    if (variant.metadata?.targetPersona) {
      rules.push(
        createPersonaRule(variant.metadata.targetPersona, variant.id, 100)
      )
    }
  }

  return rules
}

/**
 * GET /api/personalization/variant
 *
 * Return API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/personalization/variant',
    method: 'POST',
    description: 'Get personalized content variant for a slot',
    version: '1.0.0',
    parameters: {
      slotId: 'Content slot identifier',
      sessionId: 'Session ID for personalization',
      forceVariantId: 'Optional: Force specific variant (for testing)',
    },
    response: {
      variant: 'Selected content variant',
      matchedRule: 'Rule that triggered selection (if any)',
      isFallback: 'Whether default variant was used',
      isABTest: 'Whether from A/B test',
      metadata: {
        processingTime: 'Processing time in milliseconds',
        rulesEvaluated: 'Number of rules evaluated',
      },
    },
    performanceTarget: '< 500ms',
  })
}
