/**
 * Personalization Analytics
 *
 * Tracks personalization performance, conversion lift, and engagement metrics.
 */

import { v4 as uuidv4 } from 'uuid'
import type { ConversionEvent, ABTestResult, AnalyticsQuery } from './schema'
import type { PersonaId } from '@/lib/persona/schema'

/**
 * Personalization Event
 */
export interface PersonalizationEvent {
  id: string
  type: 'impression' | 'interaction' | 'conversion'
  sessionId: string
  personaId?: PersonaId
  variantId: string
  slotId: string
  testId?: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

/**
 * Aggregated Metrics
 */
export interface PersonalizationMetrics {
  // Overall metrics
  totalImpressions: number
  totalInteractions: number
  totalConversions: number
  overallConversionRate: number

  // Persona-specific metrics
  byPersona: Map<
    PersonaId,
    {
      impressions: number
      interactions: number
      conversions: number
      conversionRate: number
    }
  >

  // Variant-specific metrics
  byVariant: Map<
    string,
    {
      impressions: number
      interactions: number
      conversions: number
      conversionRate: number
    }
  >

  // Slot-specific metrics
  bySlot: Map<
    string,
    {
      impressions: number
      interactions: number
      conversions: number
      conversionRate: number
    }
  >

  // Time-based metrics
  byDate: Map<
    string,
    {
      impressions: number
      interactions: number
      conversions: number
      conversionRate: number
    }
  >
}

/**
 * Conversion Lift Analysis
 */
export interface ConversionLift {
  control: {
    impressions: number
    conversions: number
    conversionRate: number
  }
  personalized: {
    impressions: number
    conversions: number
    conversionRate: number
  }
  lift: {
    absolute: number // difference in conversion rate
    relative: number // percentage lift
    pValue: number // statistical significance
    isSignificant: boolean
  }
}

/**
 * Analytics Tracker
 */
export class AnalyticsTracker {
  private events: PersonalizationEvent[]
  private conversions: ConversionEvent[]

  constructor() {
    this.events = []
    this.conversions = []
  }

  /**
   * Track impression (variant shown)
   */
  trackImpression(
    sessionId: string,
    variantId: string,
    slotId: string,
    options: {
      personaId?: PersonaId
      testId?: string
      metadata?: Record<string, unknown>
    } = {}
  ): void {
    const event: PersonalizationEvent = {
      id: uuidv4(),
      type: 'impression',
      sessionId,
      personaId: options.personaId,
      variantId,
      slotId,
      testId: options.testId,
      timestamp: new Date(),
      metadata: options.metadata,
    }

    this.events.push(event)
  }

  /**
   * Track interaction (user engaged with variant)
   */
  trackInteraction(
    sessionId: string,
    variantId: string,
    slotId: string,
    options: {
      personaId?: PersonaId
      testId?: string
      metadata?: Record<string, unknown>
    } = {}
  ): void {
    const event: PersonalizationEvent = {
      id: uuidv4(),
      type: 'interaction',
      sessionId,
      personaId: options.personaId,
      variantId,
      slotId,
      testId: options.testId,
      timestamp: new Date(),
      metadata: options.metadata,
    }

    this.events.push(event)
  }

  /**
   * Track conversion
   */
  trackConversion(event: ConversionEvent): void {
    this.conversions.push(event)

    // Also track as personalization event
    const personalizationEvent: PersonalizationEvent = {
      id: event.id,
      type: 'conversion',
      sessionId: event.sessionId,
      variantId: event.variantId,
      slotId: event.conversionGoal,
      testId: event.abTestId,
      timestamp: event.timestamp,
      metadata: event.metadata,
    }

    this.events.push(personalizationEvent)
  }

  /**
   * Get all events
   */
  getEvents(query?: AnalyticsQuery): PersonalizationEvent[] {
    let events = [...this.events]

    if (query) {
      if (query.testId) {
        events = events.filter((e) => e.testId === query.testId)
      }

      if (query.variantId) {
        events = events.filter((e) => e.variantId === query.variantId)
      }

      if (query.startDate) {
        events = events.filter((e) => e.timestamp >= query.startDate!)
      }

      if (query.endDate) {
        events = events.filter((e) => e.timestamp <= query.endDate!)
      }
    }

    return events
  }

  /**
   * Get metrics
   */
  getMetrics(query?: AnalyticsQuery): PersonalizationMetrics {
    const events = this.getEvents(query)

    const impressions = events.filter((e) => e.type === 'impression')
    const interactions = events.filter((e) => e.type === 'interaction')
    const conversions = events.filter((e) => e.type === 'conversion')

    const metrics: PersonalizationMetrics = {
      totalImpressions: impressions.length,
      totalInteractions: interactions.length,
      totalConversions: conversions.length,
      overallConversionRate:
        impressions.length > 0 ? conversions.length / impressions.length : 0,
      byPersona: this.aggregateByPersona(events),
      byVariant: this.aggregateByVariant(events),
      bySlot: this.aggregateBySlot(events),
      byDate: this.aggregateByDate(events),
    }

    return metrics
  }

  /**
   * Aggregate by persona
   */
  private aggregateByPersona(
    events: PersonalizationEvent[]
  ): Map<
    PersonaId,
    {
      impressions: number
      interactions: number
      conversions: number
      conversionRate: number
    }
  > {
    const byPersona = new Map<
      PersonaId,
      {
        impressions: number
        interactions: number
        conversions: number
        conversionRate: number
      }
    >()

    for (const event of events) {
      if (!event.personaId) continue

      let stats = byPersona.get(event.personaId)
      if (!stats) {
        stats = { impressions: 0, interactions: 0, conversions: 0, conversionRate: 0 }
        byPersona.set(event.personaId, stats)
      }

      if (event.type === 'impression') stats.impressions++
      if (event.type === 'interaction') stats.interactions++
      if (event.type === 'conversion') stats.conversions++
    }

    // Calculate conversion rates
    for (const stats of byPersona.values()) {
      stats.conversionRate = stats.impressions > 0 ? stats.conversions / stats.impressions : 0
    }

    return byPersona
  }

  /**
   * Aggregate by variant
   */
  private aggregateByVariant(
    events: PersonalizationEvent[]
  ): Map<
    string,
    {
      impressions: number
      interactions: number
      conversions: number
      conversionRate: number
    }
  > {
    const byVariant = new Map<
      string,
      {
        impressions: number
        interactions: number
        conversions: number
        conversionRate: number
      }
    >()

    for (const event of events) {
      let stats = byVariant.get(event.variantId)
      if (!stats) {
        stats = { impressions: 0, interactions: 0, conversions: 0, conversionRate: 0 }
        byVariant.set(event.variantId, stats)
      }

      if (event.type === 'impression') stats.impressions++
      if (event.type === 'interaction') stats.interactions++
      if (event.type === 'conversion') stats.conversions++
    }

    // Calculate conversion rates
    for (const stats of byVariant.values()) {
      stats.conversionRate = stats.impressions > 0 ? stats.conversions / stats.impressions : 0
    }

    return byVariant
  }

  /**
   * Aggregate by slot
   */
  private aggregateBySlot(
    events: PersonalizationEvent[]
  ): Map<
    string,
    {
      impressions: number
      interactions: number
      conversions: number
      conversionRate: number
    }
  > {
    const bySlot = new Map<
      string,
      {
        impressions: number
        interactions: number
        conversions: number
        conversionRate: number
      }
    >()

    for (const event of events) {
      let stats = bySlot.get(event.slotId)
      if (!stats) {
        stats = { impressions: 0, interactions: 0, conversions: 0, conversionRate: 0 }
        bySlot.set(event.slotId, stats)
      }

      if (event.type === 'impression') stats.impressions++
      if (event.type === 'interaction') stats.interactions++
      if (event.type === 'conversion') stats.conversions++
    }

    // Calculate conversion rates
    for (const stats of bySlot.values()) {
      stats.conversionRate = stats.impressions > 0 ? stats.conversions / stats.impressions : 0
    }

    return bySlot
  }

  /**
   * Aggregate by date
   */
  private aggregateByDate(
    events: PersonalizationEvent[]
  ): Map<
    string,
    {
      impressions: number
      interactions: number
      conversions: number
      conversionRate: number
    }
  > {
    const byDate = new Map<
      string,
      {
        impressions: number
        interactions: number
        conversions: number
        conversionRate: number
      }
    >()

    for (const event of events) {
      const dateKey = event.timestamp.toISOString().split('T')[0]

      let stats = byDate.get(dateKey)
      if (!stats) {
        stats = { impressions: 0, interactions: 0, conversions: 0, conversionRate: 0 }
        byDate.set(dateKey, stats)
      }

      if (event.type === 'impression') stats.impressions++
      if (event.type === 'interaction') stats.interactions++
      if (event.type === 'conversion') stats.conversions++
    }

    // Calculate conversion rates
    for (const stats of byDate.values()) {
      stats.conversionRate = stats.impressions > 0 ? stats.conversions / stats.impressions : 0
    }

    return byDate
  }

  /**
   * Calculate conversion lift (personalized vs default/control)
   */
  calculateConversionLift(controlVariantId: string, personalizedVariantIds: string[]): ConversionLift {
    const controlEvents = this.events.filter((e) => e.variantId === controlVariantId)
    const personalizedEvents = this.events.filter((e) =>
      personalizedVariantIds.includes(e.variantId)
    )

    const controlImpressions = controlEvents.filter((e) => e.type === 'impression').length
    const controlConversions = controlEvents.filter((e) => e.type === 'conversion').length
    const controlRate = controlImpressions > 0 ? controlConversions / controlImpressions : 0

    const personalizedImpressions = personalizedEvents.filter(
      (e) => e.type === 'impression'
    ).length
    const personalizedConversions = personalizedEvents.filter(
      (e) => e.type === 'conversion'
    ).length
    const personalizedRate =
      personalizedImpressions > 0 ? personalizedConversions / personalizedImpressions : 0

    const absoluteLift = personalizedRate - controlRate
    const relativeLift = controlRate > 0 ? (absoluteLift / controlRate) * 100 : 0

    // Calculate statistical significance (Z-test)
    const pooledP =
      (controlConversions + personalizedConversions) /
      (controlImpressions + personalizedImpressions)
    const se = Math.sqrt(
      pooledP *
        (1 - pooledP) *
        (1 / controlImpressions + 1 / personalizedImpressions)
    )
    const z = se > 0 ? absoluteLift / se : 0
    const pValue = 2 * (1 - this.normalCDF(Math.abs(z)))

    return {
      control: {
        impressions: controlImpressions,
        conversions: controlConversions,
        conversionRate: controlRate,
      },
      personalized: {
        impressions: personalizedImpressions,
        conversions: personalizedConversions,
        conversionRate: personalizedRate,
      },
      lift: {
        absolute: absoluteLift,
        relative: relativeLift,
        pValue,
        isSignificant: pValue < 0.05,
      },
    }
  }

  /**
   * Normal CDF
   */
  private normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x))
    const d = 0.3989423 * Math.exp((-x * x) / 2)
    const prob =
      d *
      t *
      (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
    return x > 0 ? 1 - prob : prob
  }

  /**
   * Get conversion events
   */
  getConversions(query?: AnalyticsQuery): ConversionEvent[] {
    let conversions = [...this.conversions]

    if (query) {
      if (query.testId) {
        conversions = conversions.filter((c) => c.abTestId === query.testId)
      }

      if (query.variantId) {
        conversions = conversions.filter((c) => c.variantId === query.variantId)
      }

      if (query.startDate) {
        conversions = conversions.filter((c) => c.timestamp >= query.startDate!)
      }

      if (query.endDate) {
        conversions = conversions.filter((c) => c.timestamp <= query.endDate!)
      }
    }

    return conversions
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.events = []
    this.conversions = []
  }
}

/**
 * Global analytics tracker instance
 */
const globalAnalyticsTracker = new AnalyticsTracker()

/**
 * Get global analytics tracker
 */
export function getAnalyticsTracker(): AnalyticsTracker {
  return globalAnalyticsTracker
}

/**
 * Track impression (shorthand)
 */
export function trackImpression(
  sessionId: string,
  variantId: string,
  slotId: string,
  options?: {
    personaId?: PersonaId
    testId?: string
    metadata?: Record<string, unknown>
  }
): void {
  globalAnalyticsTracker.trackImpression(sessionId, variantId, slotId, options)
}

/**
 * Track interaction (shorthand)
 */
export function trackInteraction(
  sessionId: string,
  variantId: string,
  slotId: string,
  options?: {
    personaId?: PersonaId
    testId?: string
    metadata?: Record<string, unknown>
  }
): void {
  globalAnalyticsTracker.trackInteraction(sessionId, variantId, slotId, options)
}

/**
 * Track conversion (shorthand)
 */
export function trackConversion(event: ConversionEvent): void {
  globalAnalyticsTracker.trackConversion(event)
}
