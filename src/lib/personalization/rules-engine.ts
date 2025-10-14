/**
 * Personalization Rules Engine
 *
 * Evaluates personalization rules and conditions to determine which content variant to show.
 */

import type {
  PersonalizationRule,
  PersonalizationCondition,
  PersonalizationContext,
  RuleEvaluationResult,
  ConditionOperator,
} from './schema'

/**
 * Rule evaluation options
 */
export interface RuleEvaluationOptions {
  /** Enable debug logging */
  debug?: boolean

  /** Include evaluation details in results */
  includeDetails?: boolean

  /** Stop at first match */
  stopAtFirstMatch?: boolean
}

/**
 * Rules Engine
 */
export class RulesEngine {
  private rules: PersonalizationRule[]
  private options: RuleEvaluationOptions

  constructor(rules: PersonalizationRule[], options: RuleEvaluationOptions = {}) {
    // Sort rules by priority (highest first)
    this.rules = [...rules].sort((a, b) => b.priority - a.priority)
    this.options = options
  }

  /**
   * Evaluate all rules and return the first match
   */
  evaluateRules(context: PersonalizationContext): RuleEvaluationResult | null {
    if (this.options.debug) {
      console.log('[RulesEngine] Evaluating rules', {
        ruleCount: this.rules.length,
        context,
      })
    }

    for (const rule of this.rules) {
      // Skip disabled rules
      if (!rule.enabled) {
        continue
      }

      const result = this.evaluateRule(rule, context)

      if (result.matched) {
        if (this.options.debug) {
          console.log('[RulesEngine] Rule matched', {
            ruleId: rule.id,
            ruleName: rule.name,
            variantId: result.variantId,
          })
        }

        return result
      }
    }

    if (this.options.debug) {
      console.log('[RulesEngine] No rules matched')
    }

    return null
  }

  /**
   * Evaluate all rules and return all matches (for analytics)
   */
  evaluateAllRules(context: PersonalizationContext): RuleEvaluationResult[] {
    const results: RuleEvaluationResult[] = []

    for (const rule of this.rules) {
      if (!rule.enabled) {
        continue
      }

      const result = this.evaluateRule(rule, context)
      results.push(result)
    }

    return results
  }

  /**
   * Evaluate a single rule
   */
  evaluateRule(rule: PersonalizationRule, context: PersonalizationContext): RuleEvaluationResult {
    const startTime = Date.now()

    // Evaluate all conditions
    const conditionResults = rule.conditions.map((condition) =>
      this.evaluateCondition(condition, context)
    )

    // Apply logic (all/any/none)
    let matched = false
    let reason = ''

    switch (rule.logic) {
      case 'all':
        matched = conditionResults.every((r) => r)
        reason = matched
          ? 'All conditions matched'
          : `Some conditions failed: ${conditionResults.filter((r) => !r).length}/${conditionResults.length}`
        break

      case 'any':
        matched = conditionResults.some((r) => r)
        reason = matched
          ? `At least one condition matched: ${conditionResults.filter((r) => r).length}/${conditionResults.length}`
          : 'No conditions matched'
        break

      case 'none':
        matched = !conditionResults.some((r) => r)
        reason = matched ? 'No conditions matched (as expected)' : 'Some conditions matched (unexpected)'
        break
    }

    const result: RuleEvaluationResult = {
      ruleId: rule.id,
      matched,
      variantId: matched ? rule.variantId : undefined,
      reason,
      evaluatedAt: new Date(),
    }

    if (this.options.debug) {
      console.log('[RulesEngine] Rule evaluated', {
        ruleId: rule.id,
        matched,
        conditionResults,
        processingTime: Date.now() - startTime,
      })
    }

    return result
  }

  /**
   * Evaluate a single condition
   */
  evaluateCondition(condition: PersonalizationCondition, context: PersonalizationContext): boolean {
    // Get field value from context
    const fieldValue = this.getFieldValue(condition.field, context, condition.customAttributeKey)

    // Apply operator
    return this.applyOperator(fieldValue, condition.operator, condition.value)
  }

  /**
   * Get field value from context
   */
  private getFieldValue(
    field: string,
    context: PersonalizationContext,
    customAttributeKey?: string
  ): unknown {
    switch (field) {
      case 'persona':
        return context.personaId

      case 'confidence':
        return context.confidence

      case 'sessionCount':
        return context.sessionCount

      case 'pageViews':
        return context.pageViews

      case 'timeOnSite':
        return context.timeOnSite

      case 'referrer':
        return context.referrer

      case 'utmSource':
        return context.utm?.source

      case 'utmMedium':
        return context.utm?.medium

      case 'utmCampaign':
        return context.utm?.campaign

      case 'device':
        return context.device

      case 'location':
        return context.location?.country // Can be extended for region/city

      case 'language':
        return context.language

      case 'customAttribute':
        return customAttributeKey ? context.customAttributes?.[customAttributeKey] : undefined

      default:
        return undefined
    }
  }

  /**
   * Apply comparison operator
   */
  private applyOperator(
    fieldValue: unknown,
    operator: ConditionOperator,
    targetValue: unknown
  ): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === targetValue

      case 'notEquals':
        return fieldValue !== targetValue

      case 'contains':
        if (typeof fieldValue === 'string' && typeof targetValue === 'string') {
          return fieldValue.toLowerCase().includes(targetValue.toLowerCase())
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(targetValue)
        }
        return false

      case 'notContains':
        if (typeof fieldValue === 'string' && typeof targetValue === 'string') {
          return !fieldValue.toLowerCase().includes(targetValue.toLowerCase())
        }
        if (Array.isArray(fieldValue)) {
          return !fieldValue.includes(targetValue)
        }
        return true

      case 'greaterThan':
        if (typeof fieldValue === 'number' && typeof targetValue === 'number') {
          return fieldValue > targetValue
        }
        return false

      case 'lessThan':
        if (typeof fieldValue === 'number' && typeof targetValue === 'number') {
          return fieldValue < targetValue
        }
        return false

      case 'greaterThanOrEqual':
        if (typeof fieldValue === 'number' && typeof targetValue === 'number') {
          return fieldValue >= targetValue
        }
        return false

      case 'lessThanOrEqual':
        if (typeof fieldValue === 'number' && typeof targetValue === 'number') {
          return fieldValue <= targetValue
        }
        return false

      case 'in':
        if (Array.isArray(targetValue)) {
          return targetValue.includes(fieldValue)
        }
        return false

      case 'notIn':
        if (Array.isArray(targetValue)) {
          return !targetValue.includes(fieldValue)
        }
        return true

      case 'matches':
        if (typeof fieldValue === 'string' && typeof targetValue === 'string') {
          try {
            const regex = new RegExp(targetValue, 'i')
            return regex.test(fieldValue)
          } catch {
            return false
          }
        }
        return false

      case 'exists':
        return fieldValue !== undefined && fieldValue !== null

      case 'notExists':
        return fieldValue === undefined || fieldValue === null

      default:
        return false
    }
  }

  /**
   * Add rule
   */
  addRule(rule: PersonalizationRule): void {
    this.rules.push(rule)
    // Re-sort by priority
    this.rules.sort((a, b) => b.priority - a.priority)
  }

  /**
   * Remove rule
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter((r) => r.id !== ruleId)
  }

  /**
   * Update rule
   */
  updateRule(ruleId: string, updates: Partial<PersonalizationRule>): void {
    const index = this.rules.findIndex((r) => r.id === ruleId)
    if (index >= 0) {
      this.rules[index] = { ...this.rules[index], ...updates }
      // Re-sort by priority if priority changed
      if (updates.priority !== undefined) {
        this.rules.sort((a, b) => b.priority - a.priority)
      }
    }
  }

  /**
   * Get all rules
   */
  getRules(): PersonalizationRule[] {
    return [...this.rules]
  }

  /**
   * Get rule by ID
   */
  getRuleById(ruleId: string): PersonalizationRule | undefined {
    return this.rules.find((r) => r.id === ruleId)
  }

  /**
   * Enable/disable rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.find((r) => r.id === ruleId)
    if (rule) {
      rule.enabled = enabled
    }
  }
}

/**
 * Create rule builder for fluent API
 */
export class RuleBuilder {
  private rule: Partial<PersonalizationRule>

  constructor(id: string, name: string) {
    this.rule = {
      id,
      name,
      conditions: [],
      logic: 'all',
      priority: 0,
      enabled: true,
    }
  }

  description(description: string): this {
    this.rule.description = description
    return this
  }

  condition(condition: PersonalizationCondition): this {
    this.rule.conditions = [...(this.rule.conditions || []), condition]
    return this
  }

  logic(logic: 'all' | 'any' | 'none'): this {
    this.rule.logic = logic
    return this
  }

  variantId(variantId: string): this {
    this.rule.variantId = variantId
    return this
  }

  priority(priority: number): this {
    this.rule.priority = priority
    return this
  }

  enabled(enabled: boolean): this {
    this.rule.enabled = enabled
    return this
  }

  tags(tags: string[]): this {
    this.rule.tags = tags
    return this
  }

  build(): PersonalizationRule {
    if (!this.rule.variantId) {
      throw new Error('Rule must have a variantId')
    }

    return {
      ...this.rule,
      conditions: this.rule.conditions || [],
      logic: this.rule.logic || 'all',
      variantId: this.rule.variantId,
      priority: this.rule.priority || 0,
      enabled: this.rule.enabled ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PersonalizationRule
  }
}

/**
 * Condition builder for fluent API
 */
export class ConditionBuilder {
  private condition: Partial<PersonalizationCondition> = {}

  static field(field: string): ConditionBuilder {
    const builder = new ConditionBuilder()
    builder.condition.field = field as any
    return builder
  }

  equals(value: string | number | boolean): PersonalizationCondition {
    return {
      ...this.condition,
      operator: 'equals',
      value,
    } as PersonalizationCondition
  }

  notEquals(value: string | number | boolean): PersonalizationCondition {
    return {
      ...this.condition,
      operator: 'notEquals',
      value,
    } as PersonalizationCondition
  }

  contains(value: string): PersonalizationCondition {
    return {
      ...this.condition,
      operator: 'contains',
      value,
    } as PersonalizationCondition
  }

  greaterThan(value: number): PersonalizationCondition {
    return {
      ...this.condition,
      operator: 'greaterThan',
      value,
    } as PersonalizationCondition
  }

  lessThan(value: number): PersonalizationCondition {
    return {
      ...this.condition,
      operator: 'lessThan',
      value,
    } as PersonalizationCondition
  }

  in(values: (string | number)[]): PersonalizationCondition {
    return {
      ...this.condition,
      operator: 'in',
      value: values,
    } as PersonalizationCondition
  }

  matches(regex: string): PersonalizationCondition {
    return {
      ...this.condition,
      operator: 'matches',
      value: regex,
    } as PersonalizationCondition
  }

  exists(): PersonalizationCondition {
    return {
      ...this.condition,
      operator: 'exists',
      value: true,
    } as PersonalizationCondition
  }
}

/**
 * Helper functions
 */

/**
 * Create a simple persona rule
 */
export function createPersonaRule(
  personaId: string,
  variantId: string,
  priority: number = 0
): PersonalizationRule {
  return new RuleBuilder(`persona-${personaId}`, `Persona: ${personaId}`)
    .description(`Show variant for ${personaId} persona`)
    .condition({
      field: 'persona',
      operator: 'equals',
      value: personaId,
    })
    .variantId(variantId)
    .priority(priority)
    .build()
}

/**
 * Create a confidence threshold rule
 */
export function createConfidenceRule(
  minConfidence: number,
  variantId: string,
  priority: number = 0
): PersonalizationRule {
  return new RuleBuilder(
    `confidence-${minConfidence}`,
    `Confidence >= ${minConfidence}`
  )
    .description(`Show variant when confidence is >= ${minConfidence}`)
    .condition({
      field: 'confidence',
      operator: 'greaterThanOrEqual',
      value: minConfidence,
    })
    .variantId(variantId)
    .priority(priority)
    .build()
}

/**
 * Create a device rule
 */
export function createDeviceRule(
  device: 'mobile' | 'tablet' | 'desktop',
  variantId: string,
  priority: number = 0
): PersonalizationRule {
  return new RuleBuilder(`device-${device}`, `Device: ${device}`)
    .description(`Show variant for ${device} devices`)
    .condition({
      field: 'device',
      operator: 'equals',
      value: device,
    })
    .variantId(variantId)
    .priority(priority)
    .build()
}

/**
 * Create a UTM campaign rule
 */
export function createUTMRule(
  utmSource: string,
  variantId: string,
  priority: number = 0
): PersonalizationRule {
  return new RuleBuilder(`utm-${utmSource}`, `UTM Source: ${utmSource}`)
    .description(`Show variant for UTM source ${utmSource}`)
    .condition({
      field: 'utmSource',
      operator: 'equals',
      value: utmSource,
    })
    .variantId(variantId)
    .priority(priority)
    .build()
}
