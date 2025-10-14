/**
 * Session Persistence
 *
 * Handles saving and retrieving persona data from cookies and localStorage.
 * Ensures privacy compliance and cross-session continuity.
 */

import type { PersonaProfile, PersonaId } from './schema'
import { v4 as uuidv4 } from 'uuid'

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  SESSION_ID: 'persona_session_id',
  PROFILE: 'persona_profile',
  CONSENT: 'persona_consent',
  LAST_SYNC: 'persona_last_sync',
} as const

/**
 * Cookie configuration
 */
const COOKIE_CONFIG = {
  /** Cookie expiry in days */
  EXPIRY_DAYS: 30,
  /** Cookie name for session ID */
  SESSION_COOKIE_NAME: '__persona_sid',
  /** Cookie name for consent */
  CONSENT_COOKIE_NAME: '__persona_consent',
  /** SameSite policy */
  SAME_SITE: 'Lax' as const,
  /** Secure flag (HTTPS only) */
  SECURE: process.env.NODE_ENV === 'production',
}

/**
 * Session manager interface
 */
export interface SessionManager {
  getSessionId(): string | null
  setSessionId(id: string): void
  getProfile(): PersonaProfile | null
  saveProfile(profile: PersonaProfile): void
  clearSession(): void
  hasConsent(): boolean
  setConsent(consent: boolean): void
  isExpired(): boolean
}

/**
 * Browser-based session manager (client-side)
 */
export class BrowserSessionManager implements SessionManager {
  /**
   * Get session ID from cookie/localStorage
   */
  getSessionId(): string | null {
    if (typeof window === 'undefined') return null

    // Try cookie first (cross-session)
    const cookieId = this.getCookie(COOKIE_CONFIG.SESSION_COOKIE_NAME)
    if (cookieId) return cookieId

    // Fall back to localStorage (same-session)
    const storageId = localStorage.getItem(STORAGE_KEYS.SESSION_ID)
    if (storageId) {
      // Sync to cookie for cross-session persistence
      this.setSessionId(storageId)
      return storageId
    }

    return null
  }

  /**
   * Set session ID in cookie and localStorage
   */
  setSessionId(id: string): void {
    if (typeof window === 'undefined') return

    // Save to cookie (cross-session)
    this.setCookie(COOKIE_CONFIG.SESSION_COOKIE_NAME, id, COOKIE_CONFIG.EXPIRY_DAYS)

    // Save to localStorage (same-session)
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, id)
  }

  /**
   * Get persona profile from localStorage
   */
  getProfile(): PersonaProfile | null {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE)
      if (!stored) return null

      const parsed = JSON.parse(stored)

      // Validate and reconstruct dates
      if (parsed) {
        parsed.sessionStart = new Date(parsed.sessionStart)
        parsed.lastUpdated = new Date(parsed.lastUpdated)

        if (parsed.currentPersona) {
          parsed.currentPersona.classifiedAt = new Date(parsed.currentPersona.classifiedAt)
        }

        if (parsed.classificationHistory) {
          parsed.classificationHistory = parsed.classificationHistory.map((c: any) => ({
            ...c,
            classifiedAt: new Date(c.classifiedAt),
          }))
        }

        if (parsed.signals) {
          parsed.signals = parsed.signals.map((s: any) => ({
            ...s,
            timestamp: new Date(s.timestamp),
          }))
        }
      }

      return parsed as PersonaProfile
    } catch (error) {
      console.error('Error parsing persona profile:', error)
      return null
    }
  }

  /**
   * Save persona profile to localStorage
   */
  saveProfile(profile: PersonaProfile): void {
    if (typeof window === 'undefined') return

    try {
      const serialized = JSON.stringify(profile)
      localStorage.setItem(STORAGE_KEYS.PROFILE, serialized)

      // Update last sync timestamp
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString())
    } catch (error) {
      console.error('Error saving persona profile:', error)
    }
  }

  /**
   * Clear all session data
   */
  clearSession(): void {
    if (typeof window === 'undefined') return

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID)
    localStorage.removeItem(STORAGE_KEYS.PROFILE)
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC)

    // Clear cookies
    this.deleteCookie(COOKIE_CONFIG.SESSION_COOKIE_NAME)
  }

  /**
   * Check if user has granted consent
   */
  hasConsent(): boolean {
    if (typeof window === 'undefined') return false

    // Check cookie consent
    const cookieConsent = this.getCookie(COOKIE_CONFIG.CONSENT_COOKIE_NAME)
    if (cookieConsent === 'true') return true

    // Check localStorage consent
    const storageConsent = localStorage.getItem(STORAGE_KEYS.CONSENT)
    return storageConsent === 'true'
  }

  /**
   * Set user consent
   */
  setConsent(consent: boolean): void {
    if (typeof window === 'undefined') return

    const value = consent ? 'true' : 'false'

    // Save to cookie
    this.setCookie(COOKIE_CONFIG.CONSENT_COOKIE_NAME, value, COOKIE_CONFIG.EXPIRY_DAYS)

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.CONSENT, value)

    // If consent revoked, clear session
    if (!consent) {
      this.clearSession()
    }
  }

  /**
   * Check if session has expired
   */
  isExpired(): boolean {
    if (typeof window === 'undefined') return true

    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
    if (!lastSync) return true

    const lastSyncDate = new Date(lastSync)
    const now = new Date()
    const daysSinceSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60 * 24)

    return daysSinceSync > COOKIE_CONFIG.EXPIRY_DAYS
  }

  /**
   * Helper: Get cookie value
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null

    const matches = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return matches ? decodeURIComponent(matches[1]) : null
  }

  /**
   * Helper: Set cookie
   */
  private setCookie(name: string, value: string, days: number): void {
    if (typeof document === 'undefined') return

    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)

    const secure = COOKIE_CONFIG.SECURE ? '; Secure' : ''
    const sameSite = `; SameSite=${COOKIE_CONFIG.SAME_SITE}`

    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/${secure}${sameSite}`
  }

  /**
   * Helper: Delete cookie
   */
  private deleteCookie(name: string): void {
    if (typeof document === 'undefined') return

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
  }
}

/**
 * Server-side session manager (for API routes)
 */
export class ServerSessionManager implements SessionManager {
  private sessionData: Map<string, PersonaProfile> = new Map()
  private consentData: Map<string, boolean> = new Map()

  /**
   * Get session ID (must be provided by client)
   */
  getSessionId(): string | null {
    // Server-side requires session ID to be passed explicitly
    return null
  }

  /**
   * Set session ID (no-op on server)
   */
  setSessionId(id: string): void {
    // No-op on server side
  }

  /**
   * Get profile by session ID
   */
  getProfile(): PersonaProfile | null {
    // Server-side requires explicit session ID lookup
    return null
  }

  /**
   * Get profile by explicit session ID
   */
  getProfileById(sessionId: string): PersonaProfile | null {
    return this.sessionData.get(sessionId) || null
  }

  /**
   * Save profile with explicit session ID
   */
  saveProfile(profile: PersonaProfile): void {
    this.sessionData.set(profile.sessionId, profile)
  }

  /**
   * Clear session by ID
   */
  clearSessionById(sessionId: string): void {
    this.sessionData.delete(sessionId)
    this.consentData.delete(sessionId)
  }

  /**
   * Clear all session data
   */
  clearSession(): void {
    this.sessionData.clear()
    this.consentData.clear()
  }

  /**
   * Check consent by session ID
   */
  hasConsentById(sessionId: string): boolean {
    return this.consentData.get(sessionId) || false
  }

  /**
   * Check consent (requires explicit session ID)
   */
  hasConsent(): boolean {
    return false
  }

  /**
   * Set consent by session ID
   */
  setConsentById(sessionId: string, consent: boolean): void {
    this.consentData.set(sessionId, consent)

    if (!consent) {
      this.clearSessionById(sessionId)
    }
  }

  /**
   * Set consent (no-op without session ID)
   */
  setConsent(consent: boolean): void {
    // No-op on server side without explicit session ID
  }

  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    // Server-side sessions don't expire by default
    return false
  }
}

/**
 * Session helper functions
 */

/**
 * Generate new session ID
 */
export function generateSessionId(): string {
  return `ps_${uuidv4()}`
}

/**
 * Get or create session ID
 */
export function getOrCreateSessionId(manager: SessionManager): string {
  let sessionId = manager.getSessionId()

  if (!sessionId) {
    sessionId = generateSessionId()
    manager.setSessionId(sessionId)
  }

  return sessionId
}

/**
 * Create initial persona profile
 */
export function createInitialProfile(sessionId: string): PersonaProfile {
  const now = new Date()

  return {
    sessionId,
    currentPersona: {
      personaId: 'unknown',
      confidence: 0,
      isConfident: false,
      signals: [],
      method: 'rule-based',
      classifiedAt: now,
    },
    classificationHistory: [],
    signals: [],
    sessionStart: now,
    lastUpdated: now,
    interactionCount: 0,
    metadata: {},
    consent: {
      tracking: false,
    },
  }
}

/**
 * Update profile with new classification
 */
export function updateProfileWithClassification(
  profile: PersonaProfile,
  classification: any,
  newSignals: any[]
): PersonaProfile {
  return {
    ...profile,
    currentPersona: classification,
    classificationHistory: [...profile.classificationHistory, classification],
    signals: [...profile.signals, ...newSignals],
    lastUpdated: new Date(),
    interactionCount: profile.interactionCount + 1,
  }
}

/**
 * Check if profile needs re-classification
 */
export function shouldReclassifyProfile(profile: PersonaProfile): boolean {
  const now = new Date()
  const minutesSinceUpdate = (now.getTime() - profile.lastUpdated.getTime()) / (1000 * 60)

  // Reclassify if:
  // 1. More than 30 minutes since last update
  if (minutesSinceUpdate > 30) return true

  // 2. Low confidence
  if (profile.currentPersona.confidence < 70) return true

  // 3. Many new interactions without re-classification
  if (profile.interactionCount > 10 && profile.classificationHistory.length < 2) return true

  return false
}

/**
 * Export singleton instance for browser
 */
export const browserSession = new BrowserSessionManager()

/**
 * Export singleton instance for server
 */
export const serverSession = new ServerSessionManager()

/**
 * Get appropriate session manager
 */
export function getSessionManager(): SessionManager {
  return typeof window !== 'undefined' ? browserSession : serverSession
}
