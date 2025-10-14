/**
 * Client-Side Event Tracker
 *
 * Captures user interactions, page views, and behavioral signals on the client side.
 */

import { v4 as uuidv4 } from 'uuid'
import type {
  TrackingEvent,
  EventType,
  EventCategory,
  EventMetadata,
} from './schema'

/**
 * Tracker configuration
 */
export interface TrackerConfig {
  /** Enable/disable tracking */
  enabled: boolean

  /** Track page views automatically */
  trackPageViews: boolean

  /** Track clicks automatically */
  trackClicks: boolean

  /** Track scrolls automatically */
  trackScrolls: boolean

  /** Track form interactions */
  trackForms: boolean

  /** Scroll depth thresholds to track (%) */
  scrollDepthThresholds: number[]

  /** Time on page tracking interval (ms) */
  timeOnPageInterval: number

  /** Debounce delay for rapid events (ms) */
  debounceDelay: number

  /** Session timeout (ms) */
  sessionTimeout: number

  /** Debug mode */
  debug: boolean

  /** Callback for captured events */
  onEvent?: (event: TrackingEvent) => void

  /** Custom event filters */
  eventFilters?: Array<(event: TrackingEvent) => boolean>
}

/**
 * Default tracker configuration
 */
const DEFAULT_CONFIG: TrackerConfig = {
  enabled: true,
  trackPageViews: true,
  trackClicks: true,
  trackScrolls: true,
  trackForms: true,
  scrollDepthThresholds: [25, 50, 75, 90, 100],
  timeOnPageInterval: 15000, // 15 seconds
  debounceDelay: 300,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  debug: false,
}

/**
 * Client-side event tracker
 */
export class ClientTracker {
  private config: TrackerConfig
  private sessionId: string
  private userId?: string
  private pageStartTime: number
  private lastActivityTime: number
  private scrollDepthsTracked: Set<number>
  private timeOnPageInterval?: NodeJS.Timeout
  private debounceTimers: Map<string, NodeJS.Timeout>
  private isInitialized: boolean

  constructor(config: Partial<TrackerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.getOrCreateSessionId()
    this.pageStartTime = Date.now()
    this.lastActivityTime = Date.now()
    this.scrollDepthsTracked = new Set()
    this.debounceTimers = new Map()
    this.isInitialized = false

    if (typeof window !== 'undefined' && this.config.enabled) {
      this.initialize()
    }
  }

  /**
   * Initialize tracker
   */
  private initialize(): void {
    if (this.isInitialized) return

    // Track initial page view
    if (this.config.trackPageViews) {
      this.trackPageView()
    }

    // Set up automatic tracking
    this.setupAutomaticTracking()

    // Start time on page tracking
    this.startTimeOnPageTracking()

    // Track session start
    this.trackEvent({
      type: 'session_start',
      category: 'engagement',
      name: 'Session Started',
      metadata: {
        url: window.location.href,
        referrer: document.referrer,
      },
    })

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.trackPageLeave()
    })

    this.isInitialized = true

    if (this.config.debug) {
      console.log('[Tracker] Initialized', { sessionId: this.sessionId })
    }
  }

  /**
   * Set up automatic event tracking
   */
  private setupAutomaticTracking(): void {
    if (typeof window === 'undefined') return

    // Track clicks
    if (this.config.trackClicks) {
      document.addEventListener('click', (e) => this.handleClick(e), true)
    }

    // Track scrolls
    if (this.config.trackScrolls) {
      window.addEventListener('scroll', () => this.handleScroll(), { passive: true })
    }

    // Track forms
    if (this.config.trackForms) {
      document.addEventListener('submit', (e) => this.handleFormSubmit(e), true)
      document.addEventListener('focusin', (e) => this.handleFormFocus(e), true)
    }

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handlePageHidden()
      } else {
        this.handlePageVisible()
      }
    })
  }

  /**
   * Handle click events
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    if (!target) return

    const metadata: EventMetadata = {
      selector: this.getSelector(target),
      text: target.textContent?.trim().substring(0, 100),
      attributes: this.getElementAttributes(target),
      position: {
        x: event.clientX,
        y: event.clientY,
      },
      url: window.location.href,
    }

    // Determine event type
    let eventType: EventType = 'click'
    let eventName = 'Click'

    if (target.tagName === 'A') {
      eventType = 'navigation'
      eventName = 'Link Click'
    } else if (target.tagName === 'BUTTON' || target.closest('button')) {
      eventType = 'button_click'
      eventName = 'Button Click'
    } else if (target.closest('[data-cta]') || target.closest('[role="button"]')) {
      eventType = 'cta_click'
      eventName = 'CTA Click'
    }

    this.trackEvent({
      type: eventType,
      category: 'interaction',
      name: eventName,
      metadata,
    })
  }

  /**
   * Handle scroll events
   */
  private handleScroll(): void {
    this.debounce('scroll', () => {
      const scrollDepth = this.getScrollDepth()

      // Track scroll depth milestones
      for (const threshold of this.config.scrollDepthThresholds) {
        if (scrollDepth >= threshold && !this.scrollDepthsTracked.has(threshold)) {
          this.scrollDepthsTracked.add(threshold)

          this.trackEvent({
            type: 'scroll',
            category: 'engagement',
            name: `Scroll ${threshold}%`,
            metadata: {
              scrollDepth: threshold,
              url: window.location.href,
            },
          })
        }
      }
    }, this.config.debounceDelay)
  }

  /**
   * Handle form submit
   */
  private handleFormSubmit(event: Event): void {
    const form = event.target as HTMLFormElement
    if (!form) return

    const formId = form.id || form.name || 'unnamed-form'

    this.trackEvent({
      type: 'form_submit',
      category: 'form',
      name: 'Form Submit',
      metadata: {
        formId,
        selector: this.getSelector(form),
        url: window.location.href,
      },
    })
  }

  /**
   * Handle form focus
   */
  private handleFormFocus(event: Event): void {
    const target = event.target as HTMLElement
    if (!target || !this.isFormField(target)) return

    const field = target as HTMLInputElement
    const form = field.form

    const metadata: EventMetadata = {
      formId: form?.id || form?.name,
      fieldName: field.name || field.id,
      selector: this.getSelector(target),
      url: window.location.href,
    }

    this.trackEvent({
      type: 'input_focus',
      category: 'form',
      name: 'Form Field Focus',
      metadata,
    })
  }

  /**
   * Track page view
   */
  trackPageView(): void {
    this.pageStartTime = Date.now()
    this.scrollDepthsTracked.clear()

    this.trackEvent({
      type: 'page_view',
      category: 'navigation',
      name: 'Page View',
      metadata: {
        url: window.location.href,
        referrer: document.referrer,
      },
    })
  }

  /**
   * Track page leave
   */
  private trackPageLeave(): void {
    const duration = Date.now() - this.pageStartTime

    this.trackEvent({
      type: 'page_leave',
      category: 'navigation',
      name: 'Page Leave',
      metadata: {
        url: window.location.href,
        duration,
      },
    })

    // Stop time tracking
    if (this.timeOnPageInterval) {
      clearInterval(this.timeOnPageInterval)
    }
  }

  /**
   * Start time on page tracking
   */
  private startTimeOnPageTracking(): void {
    this.timeOnPageInterval = setInterval(() => {
      const duration = Date.now() - this.pageStartTime

      this.trackEvent({
        type: 'time_on_page',
        category: 'engagement',
        name: 'Time on Page',
        metadata: {
          duration,
          url: window.location.href,
        },
      })
    }, this.config.timeOnPageInterval)
  }

  /**
   * Handle page hidden
   */
  private handlePageHidden(): void {
    const duration = Date.now() - this.pageStartTime

    this.trackEvent({
      type: 'page_leave',
      category: 'navigation',
      name: 'Page Hidden',
      metadata: {
        url: window.location.href,
        duration,
      },
    })
  }

  /**
   * Handle page visible
   */
  private handlePageVisible(): void {
    this.pageStartTime = Date.now()

    this.trackEvent({
      type: 'page_view',
      category: 'navigation',
      name: 'Page Visible',
      metadata: {
        url: window.location.href,
      },
    })
  }

  /**
   * Track custom event
   */
  track(
    type: EventType,
    name: string,
    metadata?: EventMetadata,
    category: EventCategory = 'custom'
  ): void {
    this.trackEvent({
      type,
      category,
      name,
      metadata: metadata || {},
    })
  }

  /**
   * Track event (internal)
   */
  private trackEvent(partial: {
    type: EventType
    category: EventCategory
    name: string
    metadata?: EventMetadata
  }): void {
    if (!this.config.enabled) return

    const event: TrackingEvent = {
      id: uuidv4(),
      type: partial.type,
      category: partial.category,
      name: partial.name,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId,
      pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
      pageTitle: typeof document !== 'undefined' ? document.title : undefined,
      metadata: partial.metadata || {},
      device: this.getDeviceInfo(),
      performance: this.getPerformanceMetrics(),
    }

    // Apply event filters
    if (this.config.eventFilters) {
      for (const filter of this.config.eventFilters) {
        if (!filter(event)) {
          if (this.config.debug) {
            console.log('[Tracker] Event filtered out', event)
          }
          return
        }
      }
    }

    // Update activity time
    this.lastActivityTime = Date.now()

    // Debug log
    if (this.config.debug) {
      console.log('[Tracker] Event tracked', event)
    }

    // Callback
    if (this.config.onEvent) {
      this.config.onEvent(event)
    }
  }

  /**
   * Get or create session ID
   */
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return uuidv4()

    const STORAGE_KEY = 'tracking_session_id'
    const TIMESTAMP_KEY = 'tracking_last_activity'

    const stored = sessionStorage.getItem(STORAGE_KEY)
    const lastActivity = sessionStorage.getItem(TIMESTAMP_KEY)

    // Check if session expired
    if (stored && lastActivity) {
      const timeSinceActivity = Date.now() - parseInt(lastActivity, 10)
      if (timeSinceActivity < this.config.sessionTimeout) {
        return stored
      }
    }

    // Create new session
    const newSessionId = `ts_${uuidv4()}`
    sessionStorage.setItem(STORAGE_KEY, newSessionId)
    sessionStorage.setItem(TIMESTAMP_KEY, Date.now().toString())

    return newSessionId
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    this.userId = userId
  }

  /**
   * Get device information
   */
  private getDeviceInfo() {
    if (typeof window === 'undefined') return undefined

    return {
      type: this.getDeviceType(),
      userAgent: navigator.userAgent,
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }
  }

  /**
   * Get device type
   */
  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop'

    const width = window.innerWidth

    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  /**
   * Get performance metrics
   */
  private getPerformanceMetrics() {
    if (typeof window === 'undefined' || !window.performance) return undefined

    const perf = window.performance
    const timing = perf.timing

    return {
      pageLoadTime: timing.loadEventEnd - timing.navigationStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
      timeToInteractive: timing.domInteractive - timing.navigationStart,
    }
  }

  /**
   * Get scroll depth percentage
   */
  private getScrollDepth(): number {
    if (typeof window === 'undefined') return 0

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    )
    const windowHeight = window.innerHeight

    return Math.round((scrollTop / (docHeight - windowHeight)) * 100)
  }

  /**
   * Get CSS selector for element
   */
  private getSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`
    }

    if (element.className) {
      const classes = Array.from(element.classList).slice(0, 2).join('.')
      return `${element.tagName.toLowerCase()}.${classes}`
    }

    return element.tagName.toLowerCase()
  }

  /**
   * Get element attributes
   */
  private getElementAttributes(element: HTMLElement): Record<string, string> {
    const attrs: Record<string, string> = {}

    // Get common attributes
    const attrNames = ['href', 'data-cta', 'data-track', 'role', 'aria-label']

    for (const name of attrNames) {
      const value = element.getAttribute(name)
      if (value) {
        attrs[name] = value
      }
    }

    return attrs
  }

  /**
   * Check if element is a form field
   */
  private isFormField(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase()
    return ['input', 'textarea', 'select'].includes(tagName)
  }

  /**
   * Debounce helper
   */
  private debounce(key: string, fn: () => void, delay: number): void {
    const existing = this.debounceTimers.get(key)
    if (existing) {
      clearTimeout(existing)
    }

    const timer = setTimeout(() => {
      fn()
      this.debounceTimers.delete(key)
    }, delay)

    this.debounceTimers.set(key, timer)
  }

  /**
   * Enable tracking
   */
  enable(): void {
    this.config.enabled = true
  }

  /**
   * Disable tracking
   */
  disable(): void {
    this.config.enabled = false
  }

  /**
   * Clean up
   */
  destroy(): void {
    if (this.timeOnPageInterval) {
      clearInterval(this.timeOnPageInterval)
    }

    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer)
    }

    this.debounceTimers.clear()
  }
}

/**
 * Create global tracker instance
 */
let globalTracker: ClientTracker | null = null

export function initializeTracker(config?: Partial<TrackerConfig>): ClientTracker {
  if (globalTracker) {
    return globalTracker
  }

  globalTracker = new ClientTracker(config)
  return globalTracker
}

export function getTracker(): ClientTracker | null {
  return globalTracker
}
