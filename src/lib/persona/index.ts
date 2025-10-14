/**
 * Persona Detection & Classification System
 *
 * Central exports for the persona detection engine.
 */

// Schema exports
export * from './schema'
export type {
  PersonaId,
  SignalType,
  DetectionSignal,
  PersonaClassification,
  PersonaProfile,
  PersonaDetectionRequest,
  PersonaDetectionResponse,
  PersonaUpdateRequest,
  ConfidenceBreakdown,
} from './schema'

export {
  PersonaIdSchema,
  SignalTypeSchema,
  DetectionSignalSchema,
  PersonaClassificationSchema,
  PersonaProfileSchema,
  PersonaDetectionRequestSchema,
  PersonaDetectionResponseSchema,
  PersonaUpdateRequestSchema,
  ConfidenceBreakdownSchema,
  validatePersonaDetectionRequest,
  validatePersonaProfile,
  validatePersonaClassification,
  validateDetectionSignal,
  safeValidatePersonaDetectionRequest,
  isValidPersonaId,
  isValidSignalType,
  PERSONA_SCHEMA_VERSION,
} from './schema'

// Taxonomy exports
export type {
  PersonaIndicators,
  PersonalizationPreferences,
  PersonaDefinition,
} from './taxonomy'

export {
  PERSONA_TAXONOMY,
  getPersonaDefinition,
  getAllPersonaIds,
  getAllPersonaDefinitions,
  getDefaultPersona,
  getPersonasByPriority,
} from './taxonomy'

// Classifier exports
export type { ClassificationMethod } from './classifier'

export {
  classifyPersona,
  quickPersonaCheck,
} from './classifier'

// Confidence exports
export {
  CONFIDENCE_THRESHOLDS,
  calculateConfidence,
  comparePersonas,
  getConfidenceLevel,
  getConfidenceImprovementSuggestions,
  shouldUpdatePersona,
} from './confidence'

// Session exports
export type { SessionManager } from './session'

export {
  BrowserSessionManager,
  ServerSessionManager,
  browserSession,
  serverSession,
  getSessionManager,
  generateSessionId,
  getOrCreateSessionId,
  createInitialProfile,
  updateProfileWithClassification,
  shouldReclassifyProfile,
} from './session'
