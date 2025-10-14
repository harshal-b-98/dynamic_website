/**
 * Personalized Component
 *
 * Wrapper component for rendering personalized content variants.
 */

'use client'

import React, { useEffect, useState, useCallback } from 'react'
import type { ContentVariant, VariantType } from '@/lib/personalization/schema'

/**
 * Personalized Component Props
 */
export interface PersonalizedProps {
  /** Content slot ID (used to look up variant group) */
  slotId: string

  /** Children (default content when variant not loaded) */
  children?: React.ReactNode

  /** Fallback content (shown when personalization fails) */
  fallback?: React.ReactNode

  /** Force specific variant ID (for testing) */
  forceVariantId?: string

  /** Track impressions automatically */
  trackImpressions?: boolean

  /** Track interactions automatically */
  trackInteractions?: boolean

  /** Render function for custom variant rendering */
  render?: (variant: ContentVariant) => React.ReactNode

  /** Callback when variant loads */
  onVariantLoad?: (variant: ContentVariant) => void

  /** Callback when personalization fails */
  onError?: (error: Error) => void

  /** Additional CSS classes */
  className?: string

  /** Additional styles */
  style?: React.CSSProperties
}

/**
 * Personalized Component
 *
 * @example
 * ```tsx
 * <Personalized slotId="hero.headline">
 *   <h1>Default Headline</h1>
 * </Personalized>
 * ```
 *
 * @example
 * ```tsx
 * <Personalized
 *   slotId="hero.cta"
 *   render={(variant) => (
 *     <Button href={variant.content.href}>
 *       {variant.content.text}
 *     </Button>
 *   )}
 * />
 * ```
 */
export function Personalized({
  slotId,
  children,
  fallback,
  forceVariantId,
  trackImpressions = true,
  trackInteractions = false,
  render,
  onVariantLoad,
  onError,
  className,
  style,
}: PersonalizedProps) {
  const [variant, setVariant] = useState<ContentVariant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Fetch personalized variant
   */
  const fetchVariant = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get session ID from storage/cookie
      const sessionId = getSessionId()

      // Fetch variant from API
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

      const data = await response.json()
      const loadedVariant = data.variant

      setVariant(loadedVariant)

      // Track impression
      if (trackImpressions) {
        trackImpressionEvent(sessionId, loadedVariant.id, slotId)
      }

      // Callback
      if (onVariantLoad) {
        onVariantLoad(loadedVariant)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)

      if (onError) {
        onError(error)
      }

      console.error('[Personalized] Error fetching variant:', error)
    } finally {
      setLoading(false)
    }
  }, [slotId, forceVariantId, trackImpressions, onVariantLoad, onError])

  /**
   * Load variant on mount
   */
  useEffect(() => {
    fetchVariant()
  }, [fetchVariant])

  /**
   * Track interaction
   */
  const handleInteraction = useCallback(() => {
    if (trackInteractions && variant) {
      const sessionId = getSessionId()
      trackInteractionEvent(sessionId, variant.id, slotId)
    }
  }, [trackInteractions, variant, slotId])

  /**
   * Render content
   */
  if (loading) {
    return <>{children || null}</>
  }

  if (error || !variant) {
    return <>{fallback || children || null}</>
  }

  // Use custom render function if provided
  if (render) {
    return (
      <div
        className={className}
        style={style}
        onClick={handleInteraction}
        onMouseEnter={handleInteraction}
      >
        {render(variant)}
      </div>
    )
  }

  // Default rendering based on variant type
  return (
    <div
      className={className}
      style={style}
      onClick={handleInteraction}
      onMouseEnter={handleInteraction}
    >
      {renderVariantContent(variant)}
    </div>
  )
}

/**
 * Render variant content based on type
 */
function renderVariantContent(variant: ContentVariant): React.ReactNode {
  switch (variant.type) {
    case 'text':
      return <>{variant.content.text as string}</>

    case 'cta':
      return (
        <a
          href={variant.content.href as string}
          className={`btn btn-${variant.content.variant || 'primary'}`}
        >
          {variant.content.text as string}
        </a>
      )

    case 'image':
      return (
        <img
          src={variant.content.src as string}
          alt={variant.content.alt as string}
          width={variant.content.width as number | undefined}
          height={variant.content.height as number | undefined}
        />
      )

    case 'example':
      return (
        <div className="example-card">
          <h3>{variant.content.title as string}</h3>
          <p>{variant.content.description as string}</p>
          {variant.content.metrics ? (
            <div className="metrics">
              {Object.entries(variant.content.metrics as Record<string, string | number>).map(
                ([key, value]) => (
                  <div key={key} className="metric">
                    <span className="metric-label">{key}:</span>
                    <span className="metric-value">{String(value)}</span>
                  </div>
                )
              )}
            </div>
          ) : null}
        </div>
      )

    case 'component':
      // For component type, just render the content as-is
      return <div>{JSON.stringify(variant.content)}</div>

    default:
      return <>{JSON.stringify(variant.content)}</>
  }
}

/**
 * Get session ID
 */
function getSessionId(): string {
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
}

/**
 * Track impression event
 */
function trackImpressionEvent(sessionId: string, variantId: string, slotId: string): void {
  // Send impression to tracking API
  fetch('/api/personalization/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'impression',
      sessionId,
      variantId,
      slotId,
      timestamp: new Date().toISOString(),
    }),
  }).catch((err) => {
    console.error('[Personalized] Error tracking impression:', err)
  })
}

/**
 * Track interaction event
 */
function trackInteractionEvent(sessionId: string, variantId: string, slotId: string): void {
  // Send interaction to tracking API
  fetch('/api/personalization/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'interaction',
      sessionId,
      variantId,
      slotId,
      timestamp: new Date().toISOString(),
    }),
  }).catch((err) => {
    console.error('[Personalized] Error tracking interaction:', err)
  })
}

/**
 * Personalized Text Component (convenience)
 */
export function PersonalizedText({
  slotId,
  defaultText,
  ...props
}: {
  slotId: string
  defaultText: string
} & Omit<PersonalizedProps, 'slotId' | 'children'>) {
  return (
    <Personalized slotId={slotId} {...props}>
      {defaultText}
    </Personalized>
  )
}

/**
 * Personalized CTA Component (convenience)
 */
export function PersonalizedCTA({
  slotId,
  defaultText,
  defaultHref,
  ...props
}: {
  slotId: string
  defaultText: string
  defaultHref: string
} & Omit<PersonalizedProps, 'slotId' | 'children'>) {
  return (
    <Personalized
      slotId={slotId}
      {...props}
      render={(variant) => (
        <a href={(variant.content.href as string) || defaultHref} className="btn btn-primary">
          {(variant.content.text as string) || defaultText}
        </a>
      )}
    >
      <a href={defaultHref} className="btn btn-primary">
        {defaultText}
      </a>
    </Personalized>
  )
}

/**
 * Personalized Image Component (convenience)
 */
export function PersonalizedImage({
  slotId,
  defaultSrc,
  defaultAlt,
  ...props
}: {
  slotId: string
  defaultSrc: string
  defaultAlt: string
} & Omit<PersonalizedProps, 'slotId' | 'children'>) {
  return (
    <Personalized
      slotId={slotId}
      {...props}
      render={(variant) => (
        <img
          src={(variant.content.src as string) || defaultSrc}
          alt={(variant.content.alt as string) || defaultAlt}
          width={variant.content.width as number | undefined}
          height={variant.content.height as number | undefined}
        />
      )}
    >
      <img src={defaultSrc} alt={defaultAlt} />
    </Personalized>
  )
}
