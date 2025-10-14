/**
 * Personalization System
 *
 * Central exports for the dynamic content personalization system.
 */

// Schema exports
export * from './schema'
export type {
  PersonalizationRule,
  PersonalizationCondition,
  PersonalizationContext,
  ContentVariant,
  VariantGroup,
  ABTestConfig,
  ABTestVariant,
  ABTestResult,
  ConversionEvent,
  PersonalizationRequest,
  PersonalizationResponse,
  RuleEvaluationResult,
  ConditionOperator,
  ConditionField,
  RuleLogic,
  VariantType,
  ABTestStatus,
  AnalyticsQuery,
} from './schema'

export {
  PersonalizationRuleSchema,
  PersonalizationConditionSchema,
  PersonalizationContextSchema,
  ContentVariantSchema,
  VariantGroupSchema,
  ABTestConfigSchema,
  ABTestVariantSchema,
  ABTestResultSchema,
  ConversionEventSchema,
  PersonalizationRequestSchema,
  PersonalizationResponseSchema,
  RuleEvaluationResultSchema,
  ConditionOperatorSchema,
  ConditionFieldSchema,
  RuleLogicSchema,
  VariantTypeSchema,
  ABTestStatusSchema,
  AnalyticsQuerySchema,
  validatePersonalizationRule,
  validateContentVariant,
  validateABTestConfig,
  validatePersonalizationContext,
  safeValidatePersonalizationRule,
  safeValidatePersonalizationContext,
  PERSONALIZATION_SCHEMA_VERSION,
} from './schema'

// Rules engine exports
export type { RuleEvaluationOptions } from './rules-engine'

export {
  RulesEngine,
  RuleBuilder,
  ConditionBuilder,
  createPersonaRule,
  createConfidenceRule,
  createDeviceRule,
  createUTMRule,
} from './rules-engine'

// Variant system exports
export {
  VariantStore,
  VariantBuilder,
  VariantGroupBuilder,
  VariantRegistry,
  getVariantStore,
  getVariantRegistry,
  initializeVariantRegistry,
  createTextVariant,
  createCTAVariant,
  createImageVariant,
  createComponentVariant,
  createExampleVariant,
} from './variants'

// A/B testing exports
export type { VariantAssignment } from './ab-testing'

export {
  ABTestManager,
  ABTestBuilder,
  getABTestManager,
  createSimpleABTest,
  createMultiVariantTest,
} from './ab-testing'

// Analytics exports
export type {
  PersonalizationEvent,
  PersonalizationMetrics,
  ConversionLift,
} from './analytics'

export {
  AnalyticsTracker,
  getAnalyticsTracker,
  trackImpression,
  trackInteraction,
  trackConversion,
} from './analytics'
