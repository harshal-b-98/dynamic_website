/**
 * Persona Context
 *
 * Provides global persona state management using React Context API.
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type {
  PersonaId,
  PersonaProfile,
  PersonaClassification,
  PersonaDetectionRequest,
  PersonaDetectionResponse,
} from '@/lib/persona/schema'
import {
  browserSession,
  getOrCreateSessionId,
  createInitialProfile,
} from '@/lib/persona/session'
import { getPersonaDefinition } from '@/lib/persona/taxonomy'

/**
 * Persona Context State
 */
interface PersonaContextState {
  /** Current session ID */
  sessionId: string | null

  /** Current persona profile */
  profile: PersonaProfile | null

  /** Current persona classification */
  classification: PersonaClassification | null

  /** Loading state */
  isLoading: boolean

  /** Error state */
  error: string | null

  /** Has user consented to tracking? */
  hasConsent: boolean

  /** Detect persona */
  detectPersona: (request: Partial<PersonaDetectionRequest>) => Promise<void>

  /** Get persona data */
  getPersona: () => Promise<void>

  /** Clear persona session */
  clearPersona: () => void

  /** Set consent */
  setConsent: (consent: boolean) => void

  /** Add conversation message for persona detection */
  addConversationMessage: (role: 'user' | 'assistant', content: string) => void

  /** Conversation history buffer */
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>
}

/**
 * Create context
 */
const PersonaContext = createContext<PersonaContextState | undefined>(undefined)

/**
 * Persona Provider Props
 */
interface PersonaProviderProps {
  children: React.ReactNode
  /** Auto-detect persona on mount */
  autoDetect?: boolean
  /** Auto-detect interval in milliseconds (0 = disabled) */
  autoDetectInterval?: number
}

/**
 * Persona Provider Component
 */
export function PersonaProvider({
  children,
  autoDetect = false,
  autoDetectInterval = 0,
}: PersonaProviderProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [profile, setProfile] = useState<PersonaProfile | null>(null)
  const [classification, setClassification] = useState<PersonaClassification | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasConsent, setHasConsent] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>
  >([])

  /**
   * Initialize session on mount
   */
  useEffect(() => {
    // Check consent
    const consent = browserSession.hasConsent()
    setHasConsent(consent)

    if (!consent) {
      return
    }

    // Get or create session ID
    const sid = getOrCreateSessionId(browserSession)
    setSessionId(sid)

    // Load existing profile
    const existingProfile = browserSession.getProfile()
    if (existingProfile) {
      setProfile(existingProfile)
      setClassification(existingProfile.currentPersona)
    }

    // Auto-detect if enabled
    if (autoDetect && !existingProfile) {
      detectPersona({})
    }
  }, [])

  /**
   * Auto-detect interval
   */
  useEffect(() => {
    if (!autoDetectInterval || !hasConsent) return

    const interval = setInterval(() => {
      if (conversationHistory.length > 0) {
        detectPersona({})
      }
    }, autoDetectInterval)

    return () => clearInterval(interval)
  }, [autoDetectInterval, hasConsent, conversationHistory])

  /**
   * Detect persona
   */
  const detectPersona = useCallback(
    async (request: Partial<PersonaDetectionRequest>) => {
      if (!hasConsent) {
        setError('User consent required for persona detection')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Build request
        const detectionRequest: PersonaDetectionRequest = {
          sessionId: sessionId || undefined,
          conversationHistory:
            request.conversationHistory || conversationHistory.length > 0
              ? conversationHistory
              : undefined,
          behavioralSignals: request.behavioralSignals,
          contextualInfo: request.contextualInfo || {
            referrer: typeof document !== 'undefined' ? document.referrer : undefined,
            currentPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
            deviceType:
              typeof window !== 'undefined'
                ? window.innerWidth < 768
                  ? 'mobile'
                  : window.innerWidth < 1024
                    ? 'tablet'
                    : 'desktop'
                : undefined,
          },
          forceReclassify: request.forceReclassify,
        }

        // Call API
        const response = await fetch('/api/persona/detect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(detectionRequest),
        })

        if (!response.ok) {
          throw new Error(`Persona detection failed: ${response.statusText}`)
        }

        const data: PersonaDetectionResponse = await response.json()

        // Update state
        setSessionId(data.sessionId)
        setProfile(data.profile)
        setClassification(data.classification)

        // Save to session storage
        browserSession.setSessionId(data.sessionId)
        browserSession.saveProfile(data.profile)

        console.log('Persona detected:', {
          personaId: data.classification.personaId,
          confidence: data.classification.confidence,
          processingTime: data.processingTime,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Persona detection error:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [sessionId, conversationHistory, hasConsent]
  )

  /**
   * Get persona from API
   */
  const getPersona = useCallback(async () => {
    if (!sessionId || !hasConsent) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/persona/get?sessionId=${sessionId}`)

      if (!response.ok) {
        throw new Error(`Failed to get persona: ${response.statusText}`)
      }

      const data = await response.json()

      // Update classification
      if (data.persona) {
        const personaDef = getPersonaDefinition(data.persona.id)

        setClassification({
          personaId: data.persona.id,
          confidence: data.persona.confidence,
          isConfident: data.persona.isConfident,
          signals: [],
          reasoning: data.persona.reasoning,
          method: 'llm',
          classifiedAt: new Date(data.persona.classifiedAt),
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Get persona error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, hasConsent])

  /**
   * Clear persona session
   */
  const clearPersona = useCallback(() => {
    browserSession.clearSession()
    setSessionId(null)
    setProfile(null)
    setClassification(null)
    setConversationHistory([])
    setError(null)
  }, [])

  /**
   * Set user consent
   */
  const setConsent = useCallback((consent: boolean) => {
    browserSession.setConsent(consent)
    setHasConsent(consent)

    if (!consent) {
      clearPersona()
    }
  }, [])

  /**
   * Add conversation message
   */
  const addConversationMessage = useCallback(
    (role: 'user' | 'assistant', content: string) => {
      setConversationHistory(prev => [
        ...prev,
        {
          role,
          content,
          timestamp: new Date(),
        },
      ])

      // Auto-detect if user message and we have consent
      if (role === 'user' && hasConsent && autoDetect) {
        // Debounce detection
        setTimeout(() => {
          detectPersona({})
        }, 1000)
      }
    },
    [hasConsent, autoDetect]
  )

  const value: PersonaContextState = {
    sessionId,
    profile,
    classification,
    isLoading,
    error,
    hasConsent,
    detectPersona,
    getPersona,
    clearPersona,
    setConsent,
    addConversationMessage,
    conversationHistory,
  }

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>
}

/**
 * Use Persona Hook
 */
export function usePersona(): PersonaContextState {
  const context = useContext(PersonaContext)

  if (!context) {
    throw new Error('usePersona must be used within PersonaProvider')
  }

  return context
}

/**
 * Use Persona ID Hook (convenience)
 */
export function usePersonaId(): PersonaId | null {
  const { classification } = usePersona()
  return classification?.personaId || null
}

/**
 * Use Persona Confidence Hook (convenience)
 */
export function usePersonaConfidence(): number {
  const { classification } = usePersona()
  return classification?.confidence || 0
}

/**
 * Use Is Persona Detected Hook (convenience)
 */
export function useIsPersonaDetected(): boolean {
  const { classification } = usePersona()
  return classification !== null && classification.personaId !== 'unknown'
}
