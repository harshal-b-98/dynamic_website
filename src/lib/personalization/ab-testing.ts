/**
 * A/B Testing Framework
 *
 * Manages A/B tests, variant assignments, and conversion tracking.
 */

import { v4 as uuidv4 } from 'uuid'
import type { ABTestConfig, ABTestVariant, ABTestResult, ConversionEvent } from './schema'

/**
 * Variant Assignment
 */
export interface VariantAssignment {
  testId: string
  variantId: string
  assignedAt: Date
}

/**
 * A/B Test Manager
 */
export class ABTestManager {
  private tests: Map<string, ABTestConfig>
  private assignments: Map<string, Map<string, string>> // sessionId -> testId -> variantId
  private results: Map<string, Map<string, ABTestResult>> // testId -> variantId -> result
  private conversions: ConversionEvent[]

  constructor() {
    this.tests = new Map()
    this.assignments = new Map()
    this.results = new Map()
    this.conversions = []
  }

  /**
   * Register an A/B test
   */
  registerTest(test: ABTestConfig): void {
    // Validate traffic allocation sums to 100
    const totalAllocation = test.variants.reduce((sum, v) => sum + v.trafficAllocation, 0)
    if (Math.abs(totalAllocation - 100) > 0.01) {
      throw new Error(`Traffic allocation must sum to 100, got ${totalAllocation}`)
    }

    this.tests.set(test.id, test)

    // Initialize results for each variant
    const variantResults = new Map<string, ABTestResult>()
    for (const variant of test.variants) {
      variantResults.set(variant.variantId, {
        testId: test.id,
        variantId: variant.variantId,
        impressions: 0,
        conversions: 0,
        conversionRate: 0,
        isWinner: false,
      })
    }
    this.results.set(test.id, variantResults)
  }

  /**
   * Get test by ID
   */
  getTest(testId: string): ABTestConfig | undefined {
    return this.tests.get(testId)
  }

  /**
   * Get all active tests
   */
  getActiveTests(): ABTestConfig[] {
    const now = new Date()
    return Array.from(this.tests.values()).filter(
      (test) =>
        test.status === 'running' &&
        test.startDate <= now &&
        (!test.endDate || test.endDate >= now)
    )
  }

  /**
   * Assign variant to session
   */
  assignVariant(testId: string, sessionId: string, forceVariantId?: string): string | null {
    const test = this.tests.get(testId)
    if (!test) {
      console.error(`Test ${testId} not found`)
      return null
    }

    // Check if test is active
    if (test.status !== 'running') {
      console.warn(`Test ${testId} is not running`)
      return null
    }

    // Check if already assigned
    const sessionAssignments = this.assignments.get(sessionId)
    if (sessionAssignments?.has(testId)) {
      return sessionAssignments.get(testId) || null
    }

    // Use forced variant if provided
    if (forceVariantId) {
      const variant = test.variants.find((v) => v.variantId === forceVariantId)
      if (variant) {
        this.setAssignment(sessionId, testId, forceVariantId)
        return forceVariantId
      }
    }

    // Randomly assign based on traffic allocation
    const variantId = this.selectVariantByTraffic(test.variants)
    this.setAssignment(sessionId, testId, variantId)

    return variantId
  }

  /**
   * Select variant based on traffic allocation
   */
  private selectVariantByTraffic(variants: ABTestVariant[]): string {
    const random = Math.random() * 100
    let cumulative = 0

    for (const variant of variants) {
      cumulative += variant.trafficAllocation
      if (random <= cumulative) {
        return variant.variantId
      }
    }

    // Fallback to first variant (should never happen if allocation = 100)
    return variants[0].variantId
  }

  /**
   * Set assignment
   */
  private setAssignment(sessionId: string, testId: string, variantId: string): void {
    let sessionAssignments = this.assignments.get(sessionId)
    if (!sessionAssignments) {
      sessionAssignments = new Map()
      this.assignments.set(sessionId, sessionAssignments)
    }
    sessionAssignments.set(testId, variantId)
  }

  /**
   * Get assignment for session
   */
  getAssignment(testId: string, sessionId: string): string | null {
    return this.assignments.get(sessionId)?.get(testId) || null
  }

  /**
   * Get all assignments for session
   */
  getSessionAssignments(sessionId: string): Map<string, string> {
    return this.assignments.get(sessionId) || new Map()
  }

  /**
   * Record impression (variant shown)
   */
  recordImpression(testId: string, variantId: string): void {
    const testResults = this.results.get(testId)
    if (!testResults) {
      console.error(`Test ${testId} not found`)
      return
    }

    const variantResult = testResults.get(variantId)
    if (!variantResult) {
      console.error(`Variant ${variantId} not found in test ${testId}`)
      return
    }

    variantResult.impressions++
    this.updateConversionRate(variantResult)
  }

  /**
   * Record conversion
   */
  recordConversion(event: ConversionEvent): void {
    this.conversions.push(event)

    if (!event.abTestId) {
      return
    }

    const testResults = this.results.get(event.abTestId)
    if (!testResults) {
      console.error(`Test ${event.abTestId} not found`)
      return
    }

    const variantResult = testResults.get(event.variantId)
    if (!variantResult) {
      console.error(`Variant ${event.variantId} not found in test ${event.abTestId}`)
      return
    }

    variantResult.conversions++
    this.updateConversionRate(variantResult)
  }

  /**
   * Update conversion rate
   */
  private updateConversionRate(result: ABTestResult): void {
    if (result.impressions > 0) {
      result.conversionRate = result.conversions / result.impressions
    }
  }

  /**
   * Get test results
   */
  getResults(testId: string): ABTestResult[] {
    const testResults = this.results.get(testId)
    if (!testResults) {
      return []
    }

    return Array.from(testResults.values())
  }

  /**
   * Get result for variant
   */
  getVariantResult(testId: string, variantId: string): ABTestResult | undefined {
    return this.results.get(testId)?.get(variantId)
  }

  /**
   * Calculate statistical significance
   */
  calculateSignificance(testId: string): void {
    const test = this.tests.get(testId)
    if (!test) return

    const results = this.getResults(testId)
    const controlVariant = test.variants.find((v) => v.isControl)
    if (!controlVariant) return

    const controlResult = results.find((r) => r.variantId === controlVariant.variantId)
    if (!controlResult) return

    // Calculate for each variant vs control
    for (const result of results) {
      if (result.variantId === controlVariant.variantId) continue

      const significance = this.calculateZTest(
        controlResult.conversions,
        controlResult.impressions,
        result.conversions,
        result.impressions
      )

      result.pValue = significance.pValue
      result.confidenceInterval = significance.confidenceInterval
      result.liftVsControl = this.calculateLift(controlResult.conversionRate, result.conversionRate)

      // Determine winner if statistically significant
      if (significance.pValue < 1 - test.significanceThreshold) {
        result.isWinner = result.conversionRate > controlResult.conversionRate
      }
    }
  }

  /**
   * Calculate Z-test for two proportions
   */
  private calculateZTest(
    conversionsA: number,
    impressionsA: number,
    conversionsB: number,
    impressionsB: number
  ): {
    pValue: number
    confidenceInterval: [number, number]
  } {
    // Calculate conversion rates
    const pA = impressionsA > 0 ? conversionsA / impressionsA : 0
    const pB = impressionsB > 0 ? conversionsB / impressionsB : 0

    // Calculate pooled proportion
    const pooledP = (conversionsA + conversionsB) / (impressionsA + impressionsB)

    // Calculate standard error
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / impressionsA + 1 / impressionsB))

    // Calculate z-score
    const z = se > 0 ? (pB - pA) / se : 0

    // Calculate p-value (two-tailed test)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(z)))

    // Calculate confidence interval (95%)
    const marginOfError = 1.96 * Math.sqrt((pB * (1 - pB)) / impressionsB)
    const confidenceInterval: [number, number] = [
      Math.max(0, pB - marginOfError),
      Math.min(1, pB + marginOfError),
    ]

    return { pValue, confidenceInterval }
  }

  /**
   * Normal CDF (cumulative distribution function)
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
   * Calculate lift percentage
   */
  private calculateLift(control: number, variant: number): number {
    if (control === 0) return 0
    return ((variant - control) / control) * 100
  }

  /**
   * Get winning variant
   */
  getWinner(testId: string): ABTestResult | null {
    const results = this.getResults(testId)
    const winner = results.find((r) => r.isWinner)
    return winner || null
  }

  /**
   * Update test status
   */
  updateTestStatus(testId: string, status: 'draft' | 'running' | 'paused' | 'completed' | 'archived'): void {
    const test = this.tests.get(testId)
    if (test) {
      test.status = status
      test.updatedAt = new Date()
    }
  }

  /**
   * Get conversion events
   */
  getConversionEvents(testId?: string): ConversionEvent[] {
    if (testId) {
      return this.conversions.filter((e) => e.abTestId === testId)
    }
    return [...this.conversions]
  }

  /**
   * Clear assignments (for testing)
   */
  clearAssignments(): void {
    this.assignments.clear()
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.tests.clear()
    this.assignments.clear()
    this.results.clear()
    this.conversions = []
  }
}

/**
 * Global A/B test manager instance
 */
const globalABTestManager = new ABTestManager()

/**
 * Get global A/B test manager
 */
export function getABTestManager(): ABTestManager {
  return globalABTestManager
}

/**
 * A/B Test Builder
 */
export class ABTestBuilder {
  private test: Partial<ABTestConfig>

  constructor(id: string, name: string, variantGroupId: string) {
    this.test = {
      id,
      name,
      variantGroupId,
      variants: [],
      status: 'draft',
      startDate: new Date(),
      significanceThreshold: 0.95,
    }
  }

  description(description: string): this {
    this.test.description = description
    return this
  }

  variant(variantId: string, name: string, trafficAllocation: number, isControl = false): this {
    this.test.variants = [
      ...(this.test.variants || []),
      {
        variantId,
        name,
        trafficAllocation,
        isControl,
      },
    ]
    return this
  }

  status(status: 'draft' | 'running' | 'paused' | 'completed' | 'archived'): this {
    this.test.status = status
    return this
  }

  startDate(date: Date): this {
    this.test.startDate = date
    return this
  }

  endDate(date: Date): this {
    this.test.endDate = date
    return this
  }

  conversionGoal(goal: string): this {
    this.test.conversionGoal = goal
    return this
  }

  targetSampleSize(size: number): this {
    this.test.targetSampleSize = size
    return this
  }

  significanceThreshold(threshold: number): this {
    this.test.significanceThreshold = threshold
    return this
  }

  build(): ABTestConfig {
    if (!this.test.variants || this.test.variants.length < 2) {
      throw new Error('A/B test must have at least 2 variants')
    }

    if (!this.test.conversionGoal) {
      throw new Error('A/B test must have a conversion goal')
    }

    // Ensure one variant is control
    const hasControl = this.test.variants.some((v) => v.isControl)
    if (!hasControl) {
      this.test.variants[0].isControl = true
    }

    return {
      ...this.test,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ABTestConfig
  }
}

/**
 * Helper functions
 */

/**
 * Create A/B test with 50/50 split
 */
export function createSimpleABTest(
  id: string,
  name: string,
  variantGroupId: string,
  controlVariantId: string,
  treatmentVariantId: string,
  conversionGoal: string
): ABTestConfig {
  return new ABTestBuilder(id, name, variantGroupId)
    .variant(controlVariantId, 'Control', 50, true)
    .variant(treatmentVariantId, 'Treatment', 50, false)
    .conversionGoal(conversionGoal)
    .status('running')
    .build()
}

/**
 * Create multi-variant test
 */
export function createMultiVariantTest(
  id: string,
  name: string,
  variantGroupId: string,
  variants: Array<{ id: string; name: string; allocation: number }>,
  conversionGoal: string
): ABTestConfig {
  const builder = new ABTestBuilder(id, name, variantGroupId)

  variants.forEach((variant, index) => {
    builder.variant(variant.id, variant.name, variant.allocation, index === 0)
  })

  return builder.conversionGoal(conversionGoal).status('running').build()
}
