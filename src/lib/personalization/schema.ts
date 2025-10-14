/**
 * Personalization Schema
 *
 * Type-safe schemas for personalization rules, variants, and A/B testing.
 */

import { z } from 'zod'
import { PersonaIdSchema } from '@/lib/persona/schema'

/**
 * Condition Operator
 */
export const ConditionOperatorSchema = z.enum([
  'equals',
  'notEquals',
  'contains',
  'notContains',
  'greaterThan',
  'lessThan',
  'greaterThanOrEqual',
  'lessThanOrEqual',
  'in',
  'notIn',
  'matches', // regex
  'exists',
  'notExists',
])

export type ConditionOperator = z.infer<typeof ConditionOperatorSchema>

/**
 * Condition Field Type
 */
export const ConditionFieldSchema = z.enum([
  'persona',
  'confidence',
  'sessionCount',
  'pageViews',
  'timeOnSite',
  'referrer',
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'device',
  'location',
  'language',
  'customAttribute',
])

export type ConditionField = z.infer<typeof ConditionFieldSchema>

/**
 * Personalization Condition
 */
export const PersonalizationConditionSchema = z.object({
  /** Field to evaluate */
  field: ConditionFieldSchema,

  /** Operator for comparison */
  operator: ConditionOperatorSchema,

  /** Value to compare against */
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number()])),
  ]),

  /** Custom attribute key (when field is customAttribute) */
  customAttributeKey: z.string().optional(),
})

export type PersonalizationCondition = z.infer<typeof PersonalizationConditionSchema>

/**
 * Rule Logic Type
 */
export const RuleLogicSchema = z.enum(['all', 'any', 'none'])

export type RuleLogic = z.infer<typeof RuleLogicSchema>

/**
 * Personalization Rule
 */
export const PersonalizationRuleSchema = z.object({
  /** Unique rule ID */
  id: z.string(),

  /** Rule name */
  name: z.string(),

  /** Rule description */
  description: z.string().optional(),

  /** Rule conditions */
  conditions: z.array(PersonalizationConditionSchema),

  /** Logic for combining conditions (all/any/none) */
  logic: RuleLogicSchema,

  /** Variant ID to use when rule matches */
  variantId: z.string(),

  /** Rule priority (higher = evaluated first) */
  priority: z.number().default(0),

  /** Is rule enabled? */
  enabled: z.boolean().default(true),

  /** Tags for organization */
  tags: z.array(z.string()).optional(),

  /** Created timestamp */
  createdAt: z.date().optional(),

  /** Updated timestamp */
  updatedAt: z.date().optional(),
})

export type PersonalizationRule = z.infer<typeof PersonalizationRuleSchema>

/**
 * Content Variant Type
 */
export const VariantTypeSchema = z.enum([
  'text',
  'cta',
  'image',
  'component',
  'layout',
  'example',
])

export type VariantType = z.infer<typeof VariantTypeSchema>

/**
 * Content Variant
 */
export const ContentVariantSchema = z.object({
  /** Unique variant ID */
  id: z.string(),

  /** Variant name */
  name: z.string(),

  /** Variant type */
  type: VariantTypeSchema,

  /** Content payload (type-specific) */
  content: z.record(z.string(), z.unknown()),

  /** Is this the default/control variant? */
  isDefault: z.boolean().default(false),

  /** Metadata */
  metadata: z
    .object({
      /** Target persona (if persona-specific) */
      targetPersona: PersonaIdSchema.optional(),

      /** Description */
      description: z.string().optional(),

      /** Tags */
      tags: z.array(z.string()).optional(),
    })
    .optional(),
})

export type ContentVariant = z.infer<typeof ContentVariantSchema>

/**
 * Variant Group (collection of variants for same content slot)
 */
export const VariantGroupSchema = z.object({
  /** Unique group ID */
  id: z.string(),

  /** Group name */
  name: z.string(),

  /** Content slot identifier */
  slotId: z.string(),

  /** Available variants */
  variants: z.array(ContentVariantSchema),

  /** Default variant ID (fallback) */
  defaultVariantId: z.string(),

  /** Group description */
  description: z.string().optional(),
})

export type VariantGroup = z.infer<typeof VariantGroupSchema>

/**
 * A/B Test Status
 */
export const ABTestStatusSchema = z.enum([
  'draft',
  'running',
  'paused',
  'completed',
  'archived',
])

export type ABTestStatus = z.infer<typeof ABTestStatusSchema>

/**
 * A/B Test Variant Assignment
 */
export const ABTestVariantSchema = z.object({
  /** Variant ID */
  variantId: z.string(),

  /** Variant name */
  name: z.string(),

  /** Traffic allocation (0-100) */
  trafficAllocation: z.number().min(0).max(100),

  /** Is this the control variant? */
  isControl: z.boolean().default(false),
})

export type ABTestVariant = z.infer<typeof ABTestVariantSchema>

/**
 * A/B Test Configuration
 */
export const ABTestConfigSchema = z.object({
  /** Unique test ID */
  id: z.string(),

  /** Test name */
  name: z.string(),

  /** Test description */
  description: z.string().optional(),

  /** Variant group ID being tested */
  variantGroupId: z.string(),

  /** Test variants with traffic allocation */
  variants: z.array(ABTestVariantSchema),

  /** Test status */
  status: ABTestStatusSchema,

  /** Start date */
  startDate: z.date(),

  /** End date */
  endDate: z.date().optional(),

  /** Conversion goal event type */
  conversionGoal: z.string(),

  /** Target sample size */
  targetSampleSize: z.number().optional(),

  /** Statistical significance threshold (0-1) */
  significanceThreshold: z.number().default(0.95),

  /** Created by */
  createdBy: z.string().optional(),

  /** Created timestamp */
  createdAt: z.date().optional(),

  /** Updated timestamp */
  updatedAt: z.date().optional(),
})

export type ABTestConfig = z.infer<typeof ABTestConfigSchema>

/**
 * A/B Test Result
 */
export const ABTestResultSchema = z.object({
  /** Test ID */
  testId: z.string(),

  /** Variant ID */
  variantId: z.string(),

  /** Total impressions */
  impressions: z.number().default(0),

  /** Total conversions */
  conversions: z.number().default(0),

  /** Conversion rate (0-1) */
  conversionRate: z.number().default(0),

  /** Confidence interval [lower, upper] */
  confidenceInterval: z.tuple([z.number(), z.number()]).optional(),

  /** Statistical significance (p-value) */
  pValue: z.number().optional(),

  /** Is this variant the winner? */
  isWinner: z.boolean().default(false),

  /** Lift vs control (percentage) */
  liftVsControl: z.number().optional(),
})

export type ABTestResult = z.infer<typeof ABTestResultSchema>

/**
 * Personalization Context (runtime state)
 */
export const PersonalizationContextSchema = z.object({
  /** Session ID */
  sessionId: z.string(),

  /** Detected persona */
  personaId: PersonaIdSchema.optional(),

  /** Persona confidence */
  confidence: z.number().optional(),

  /** Session count */
  sessionCount: z.number().default(1),

  /** Page views in session */
  pageViews: z.number().default(0),

  /** Time on site (ms) */
  timeOnSite: z.number().default(0),

  /** Referrer */
  referrer: z.string().optional(),

  /** UTM parameters */
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
      term: z.string().optional(),
      content: z.string().optional(),
    })
    .optional(),

  /** Device type */
  device: z.enum(['mobile', 'tablet', 'desktop']).optional(),

  /** Location */
  location: z
    .object({
      country: z.string().optional(),
      region: z.string().optional(),
      city: z.string().optional(),
    })
    .optional(),

  /** Language */
  language: z.string().optional(),

  /** Custom attributes */
  customAttributes: z.record(z.string(), z.unknown()).optional(),

  /** Active A/B test assignments */
  abTestAssignments: z.record(z.string(), z.string()).optional(), // testId -> variantId
})

export type PersonalizationContext = z.infer<typeof PersonalizationContextSchema>

/**
 * Rule Evaluation Result
 */
export const RuleEvaluationResultSchema = z.object({
  /** Rule that was evaluated */
  ruleId: z.string(),

  /** Did rule match? */
  matched: z.boolean(),

  /** Variant ID (if matched) */
  variantId: z.string().optional(),

  /** Evaluation reason */
  reason: z.string().optional(),

  /** Evaluation timestamp */
  evaluatedAt: z.date(),
})

export type RuleEvaluationResult = z.infer<typeof RuleEvaluationResultSchema>

/**
 * Personalization Request
 */
export const PersonalizationRequestSchema = z.object({
  /** Session ID */
  sessionId: z.string(),

  /** Content slot ID to personalize */
  slotId: z.string(),

  /** Current context */
  context: PersonalizationContextSchema,

  /** Force specific variant (for testing) */
  forceVariantId: z.string().optional(),
})

export type PersonalizationRequest = z.infer<typeof PersonalizationRequestSchema>

/**
 * Personalization Response
 */
export const PersonalizationResponseSchema = z.object({
  /** Selected variant */
  variant: ContentVariantSchema,

  /** Rule that triggered selection */
  matchedRule: PersonalizationRuleSchema.optional(),

  /** Is this from A/B test? */
  isABTest: z.boolean().default(false),

  /** A/B test ID (if applicable) */
  abTestId: z.string().optional(),

  /** Fallback used? */
  isFallback: z.boolean().default(false),

  /** Evaluation metadata */
  metadata: z
    .object({
      /** Processing time (ms) */
      processingTime: z.number(),

      /** Rules evaluated */
      rulesEvaluated: z.number(),

      /** Evaluation results */
      evaluationResults: z.array(RuleEvaluationResultSchema).optional(),
    })
    .optional(),
})

export type PersonalizationResponse = z.infer<typeof PersonalizationResponseSchema>

/**
 * Conversion Event
 */
export const ConversionEventSchema = z.object({
  /** Event ID */
  id: z.string(),

  /** Session ID */
  sessionId: z.string(),

  /** A/B test ID (if applicable) */
  abTestId: z.string().optional(),

  /** Variant ID that was shown */
  variantId: z.string(),

  /** Conversion goal achieved */
  conversionGoal: z.string(),

  /** Timestamp */
  timestamp: z.date(),

  /** Additional metadata */
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type ConversionEvent = z.infer<typeof ConversionEventSchema>

/**
 * Analytics Query
 */
export const AnalyticsQuerySchema = z.object({
  /** Test ID filter */
  testId: z.string().optional(),

  /** Variant ID filter */
  variantId: z.string().optional(),

  /** Date range */
  startDate: z.date().optional(),
  endDate: z.date().optional(),

  /** Group by field */
  groupBy: z.enum(['test', 'variant', 'persona', 'device', 'date']).optional(),
})

export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>

/**
 * Schema version
 */
export const PERSONALIZATION_SCHEMA_VERSION = '1.0.0'

/**
 * Validation helpers
 */

export function validatePersonalizationRule(data: unknown): PersonalizationRule {
  return PersonalizationRuleSchema.parse(data)
}

export function validateContentVariant(data: unknown): ContentVariant {
  return ContentVariantSchema.parse(data)
}

export function validateABTestConfig(data: unknown): ABTestConfig {
  return ABTestConfigSchema.parse(data)
}

export function validatePersonalizationContext(data: unknown): PersonalizationContext {
  return PersonalizationContextSchema.parse(data)
}

/**
 * Safe validation (returns success/error)
 */

export function safeValidatePersonalizationRule(data: unknown): {
  success: boolean
  data?: PersonalizationRule
  error?: string
} {
  try {
    const result = PersonalizationRuleSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((i) => i.message).join(', '),
      }
    }
    return { success: false, error: 'Unknown validation error' }
  }
}

export function safeValidatePersonalizationContext(data: unknown): {
  success: boolean
  data?: PersonalizationContext
  error?: string
} {
  try {
    const result = PersonalizationContextSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((i) => i.message).join(', '),
      }
    }
    return { success: false, error: 'Unknown validation error' }
  }
}
