/**
 * Personalization Context
 *
 * Provides global personalization state and convenience functions.
 */

'use client'

import React, { createContext, useContext, useCallback, useState } from 'react'
import type { ContentVariant, PersonalizationResponse } from '@/lib/personalization/schema'
import type { PersonaId } from '@/lib/persona/schema'

/**
 * Personalization Context State
 */
interface PersonalizationContextState {
  /** Get personalized variant for a slot */
  getVariant: (slotId: string, forceVariantId?: string) => Promise<PersonalizationResponse>

  /** Track impression */
  trackImpression: (variantId: string, slotId: string, metadata?: Record<string, unknown>) => Promise<void>

  /** Track interaction */
  trackInteraction: (variantId: string, slotId: string, metadata?: Record<string, unknown>) => Promise<void>

  /** Track conversion */
  trackConversion: (
    variantId: string,
    conversionGoal: string,
    testId?: string,
    metadata?: Record<string, unknown>
  ) => Promise<void>

  /** Get session ID */
  getSessionId: () => string

  /** Cached variants (per slot) */
  cachedVariants: Map<string, ContentVariant>
}

/**
 * Create context
 */
const PersonalizationContext = createContext<PersonalizationContextState | undefined>(undefined)

/**
 * Personalization Provider Props
 */
interface PersonalizationProviderProps {
  children: React.ReactNode

  /** Session ID (optional, will be auto-generated if not provided) */
  sessionId?: string

  /** Enable caching */
  enableCaching?: boolean
}

/**
 * Personalization Provider Component
 */
export function PersonalizationProvider({
  children,
  sessionId: providedSessionId,
  enableCaching = true,
}: PersonalizationProviderProps) {
  const [cachedVariants] = useState<Map<string, ContentVariant>>(new Map())

  /**
   * Get session ID
   */
  const getSessionId = useCallback((): string => {
    if (providedSessionId) {
      return providedSessionId
    }

    if (typeof window === 'undefined') {
      return 'server'
    }

    // Try cookie first
    const cookieMatch = document.cookie.match(/persona_session_id=([^;]+)/)
    if (cookieMatch) {
      return cookieMatch[1]
    }

    // Try localStorage
    const storageId = localStorage.getItem('persona_session_id')
    if (storageId) {
      return storageId
    }

    // Generate new session ID
    const newId = `ps_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('persona_session_id', newId)
    document.cookie = `persona_session_id=${newId}; path=/; max-age=2592000` // 30 days

    return newId
  }, [providedSessionId])

  /**
   * Get variant for slot
   */
  const getVariant = useCallback(
    async (slotId: string, forceVariantId?: string): Promise<PersonalizationResponse> => {
      // Check cache first
      if (enableCaching && !forceVariantId && cachedVariants.has(slotId)) {
        const cachedVariant = cachedVariants.get(slotId)!
        return {
          variant: cachedVariant,
          isFallback: false,
          isABTest: false,
        }
      }

      // Fetch from API
      const sessionId = getSessionId()

      const response = await fetch('/api/personalization/variant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId,
          sessionId,
          forceVariantId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch variant: ${response.statusText}`)
      }

      const data: PersonalizationResponse = await response.json()

      // Cache variant
      if (enableCaching) {
        cachedVariants.set(slotId, data.variant)
      }

      return data
    },
    [getSessionId, cachedVariants, enableCaching]
  )

  /**
   * Track impression
   */
  const trackImpression = useCallback(
    async (
      variantId: string,
      slotId: string,
      metadata?: Record<string, unknown>
    ): Promise<void> => {
      const sessionId = getSessionId()

      await fetch('/api/personalization/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'impression',
          sessionId,
          variantId,
          slotId,
          metadata,
        }),
      })
    },
    [getSessionId]
  )

  /**
   * Track interaction
   */
  const trackInteraction = useCallback(
    async (
      variantId: string,
      slotId: string,
      metadata?: Record<string, unknown>
    ): Promise<void> => {
      const sessionId = getSessionId()

      await fetch('/api/personalization/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'interaction',
          sessionId,
          variantId,
          slotId,
          metadata,
        }),
      })
    },
    [getSessionId]
  )

  /**
   * Track conversion
   */
  const trackConversion = useCallback(
    async (
      variantId: string,
      conversionGoal: string,
      testId?: string,
      metadata?: Record<string, unknown>
    ): Promise<void> => {
      const sessionId = getSessionId()

      await fetch('/api/personalization/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'conversion',
          sessionId,
          variantId,
          slotId: conversionGoal,
          conversionGoal,
          testId,
          metadata,
        }),
      })
    },
    [getSessionId]
  )

  const value: PersonalizationContextState = {
    getVariant,
    trackImpression,
    trackInteraction,
    trackConversion,
    getSessionId,
    cachedVariants,
  }

  return <PersonalizationContext.Provider value={value}>{children}</PersonalizationContext.Provider>
}

/**
 * Use Personalization Hook
 */
export function usePersonalization(): PersonalizationContextState {
  const context = useContext(PersonalizationContext)

  if (!context) {
    throw new Error('usePersonalization must be used within PersonalizationProvider')
  }

  return context
}

/**
 * Use Get Variant Hook
 */
export function useGetVariant() {
  const { getVariant } = usePersonalization()
  return getVariant
}

/**
 * Use Track Impression Hook
 */
export function useTrackImpression() {
  const { trackImpression } = usePersonalization()
  return trackImpression
}

/**
 * Use Track Interaction Hook
 */
export function useTrackInteraction() {
  const { trackInteraction } = usePersonalization()
  return trackInteraction
}

/**
 * Use Track Conversion Hook
 */
export function useTrackConversion() {
  const { trackConversion } = usePersonalization()
  return trackConversion
}

/**
 * Use Variant Hook (with automatic fetching)
 */
export function useVariant(slotId: string, forceVariantId?: string) {
  const { getVariant } = usePersonalization()
  const [variant, setVariant] = React.useState<ContentVariant | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    let mounted = true

    const fetchVariant = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await getVariant(slotId, forceVariantId)

        if (mounted) {
          setVariant(response.variant)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchVariant()

    return () => {
      mounted = false
    }
  }, [slotId, forceVariantId, getVariant])

  return { variant, loading, error }
}

/**
 * Use Personalized Text Hook
 */
export function usePersonalizedText(slotId: string, defaultText: string): string {
  const { variant, loading, error } = useVariant(slotId)

  if (loading || error || !variant) {
    return defaultText
  }

  return (variant.content.text as string) || defaultText
}

/**
 * Use Personalized CTA Hook
 */
export function usePersonalizedCTA(
  slotId: string,
  defaultCTA: { text: string; href: string }
): { text: string; href: string } {
  const { variant, loading, error } = useVariant(slotId)

  if (loading || error || !variant) {
    return defaultCTA
  }

  return {
    text: (variant.content.text as string) || defaultCTA.text,
    href: (variant.content.href as string) || defaultCTA.href,
  }
}
