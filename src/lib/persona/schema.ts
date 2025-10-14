/**
 * Persona Schema Definitions
 *
 * Type-safe Zod schemas for persona data validation and TypeScript type inference.
 */

import { z } from 'zod'

/**
 * Persona ID enum schema
 */
export const PersonaIdSchema = z.enum([
  'smb_owner',
  'enterprise_buyer',
  'technical_evaluator',
  'marketing_manager',
  'product_manager',
  'student_learner',
  'competitor_researcher',
  'returning_customer',
  'unknown',
])

export type PersonaId = z.infer<typeof PersonaIdSchema>

/**
 * Signal type for persona detection
 */
export const SignalTypeSchema = z.enum([
  'conversation',
  'behavioral',
  'contextual',
  'session',
  'referrer',
])

export type SignalType = z.infer<typeof SignalTypeSchema>

/**
 * Detection signal schema
 */
export const DetectionSignalSchema = z.object({
  /** Type of signal */
  type: SignalTypeSchema,

  /** Signal value or description */
  value: z.string(),

  /** Weight/importance of this signal (0-1) */
  weight: z.number().min(0).max(1),

  /** Confidence that this signal is accurate (0-100) */
  confidence: z.number().min(0).max(100),

  /** Timestamp when signal was captured */
  timestamp: z.date(),

  /** Additional metadata */
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type DetectionSignal = z.infer<typeof DetectionSignalSchema>

/**
 * Persona classification result schema
 */
export const PersonaClassificationSchema = z.object({
  /** Detected persona ID */
  personaId: PersonaIdSchema,

  /** Confidence score (0-100) */
  confidence: z.number().min(0).max(100),

  /** Is this classification above the confidence threshold? */
  isConfident: z.boolean(),

  /** Signals that contributed to this classification */
  signals: z.array(DetectionSignalSchema),

  /** Reasoning for the classification (LLM explanation) */
  reasoning: z.string().optional(),

  /** Alternative persona candidates with confidence scores */
  alternatives: z
    .array(
      z.object({
        personaId: PersonaIdSchema,
        confidence: z.number().min(0).max(100),
      })
    )
    .optional(),

  /** Timestamp of classification */
  classifiedAt: z.date(),

  /** Classification method */
  method: z.enum(['llm', 'rule-based', 'hybrid']),
})

export type PersonaClassification = z.infer<typeof PersonaClassificationSchema>

/**
 * Persona profile schema (stored in session/database)
 */
export const PersonaProfileSchema = z.object({
  /** Unique session identifier */
  sessionId: z.string(),

  /** Current persona classification */
  currentPersona: PersonaClassificationSchema,

  /** Classification history (for tracking changes) */
  classificationHistory: z.array(PersonaClassificationSchema),

  /** All signals collected for this session */
  signals: z.array(DetectionSignalSchema),

  /** Session start time */
  sessionStart: z.date(),

  /** Last updated time */
  lastUpdated: z.date(),

  /** Number of interactions in this session */
  interactionCount: z.number().int().min(0),

  /** Session metadata */
  metadata: z
    .object({
      /** User agent string */
      userAgent: z.string().optional(),

      /** Referrer URL */
      referrer: z.string().optional(),

      /** Landing page */
      landingPage: z.string().optional(),

      /** Device type */
      deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional(),

      /** Geographic location (anonymized) */
      location: z
        .object({
          country: z.string().optional(),
          region: z.string().optional(),
        })
        .optional(),
    })
    .optional(),

  /** Privacy consent flags */
  consent: z
    .object({
      /** User consented to tracking */
      tracking: z.boolean(),

      /** Timestamp of consent */
      consentedAt: z.date().optional(),
    })
    .optional(),
})

export type PersonaProfile = z.infer<typeof PersonaProfileSchema>

/**
 * Persona detection request schema (API input)
 */
export const PersonaDetectionRequestSchema = z.object({
  /** Session ID (optional, will be generated if not provided) */
  sessionId: z.string().optional(),

  /** Conversation history for analysis */
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        timestamp: z.date().optional(),
      })
    )
    .optional(),

  /** Behavioral signals */
  behavioralSignals: z
    .array(
      z.object({
        type: z.string(),
        value: z.unknown(),
        timestamp: z.date().optional(),
      })
    )
    .optional(),

  /** Contextual information */
  contextualInfo: z
    .object({
      referrer: z.string().optional(),
      userAgent: z.string().optional(),
      landingPage: z.string().optional(),
      currentPage: z.string().optional(),
      deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional(),
    })
    .optional(),

  /** Force re-classification even if confident classification exists */
  forceReclassify: z.boolean().optional(),
})

export type PersonaDetectionRequest = z.infer<typeof PersonaDetectionRequestSchema>

/**
 * Persona detection response schema (API output)
 */
export const PersonaDetectionResponseSchema = z.object({
  /** Session ID */
  sessionId: z.string(),

  /** Classification result */
  classification: PersonaClassificationSchema,

  /** Complete persona profile */
  profile: PersonaProfileSchema,

  /** Was this a new classification or cached? */
  isNew: z.boolean(),

  /** Processing time in milliseconds */
  processingTime: z.number(),

  /** Any warnings or notes */
  warnings: z.array(z.string()).optional(),
})

export type PersonaDetectionResponse = z.infer<typeof PersonaDetectionResponseSchema>

/**
 * Persona update request schema (for incremental updates)
 */
export const PersonaUpdateRequestSchema = z.object({
  /** Session ID */
  sessionId: z.string(),

  /** New signals to add */
  newSignals: z.array(DetectionSignalSchema).optional(),

  /** New conversation messages */
  newMessages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        timestamp: z.date().optional(),
      })
    )
    .optional(),

  /** Should trigger re-classification? */
  triggerReclassification: z.boolean().optional(),
})

export type PersonaUpdateRequest = z.infer<typeof PersonaUpdateRequestSchema>

/**
 * Confidence score breakdown schema
 */
export const ConfidenceBreakdownSchema = z.object({
  /** Overall confidence score */
  overall: z.number().min(0).max(100),

  /** Breakdown by signal type */
  bySignalType: z.record(SignalTypeSchema, z.number().min(0).max(100)),

  /** Breakdown by individual signals */
  bySignal: z.array(
    z.object({
      signal: DetectionSignalSchema,
      contribution: z.number().min(0).max(100),
    })
  ),

  /** Factors that increased confidence */
  positiveFactors: z.array(z.string()),

  /** Factors that decreased confidence */
  negativeFactors: z.array(z.string()),
})

export type ConfidenceBreakdown = z.infer<typeof ConfidenceBreakdownSchema>

/**
 * Validation helper functions
 */

/**
 * Validate persona detection request
 */
export function validatePersonaDetectionRequest(data: unknown): PersonaDetectionRequest {
  return PersonaDetectionRequestSchema.parse(data)
}

/**
 * Validate persona profile
 */
export function validatePersonaProfile(data: unknown): PersonaProfile {
  return PersonaProfileSchema.parse(data)
}

/**
 * Validate persona classification
 */
export function validatePersonaClassification(data: unknown): PersonaClassification {
  return PersonaClassificationSchema.parse(data)
}

/**
 * Validate detection signal
 */
export function validateDetectionSignal(data: unknown): DetectionSignal {
  return DetectionSignalSchema.parse(data)
}

/**
 * Safe validation with error handling
 */
export function safeValidatePersonaDetectionRequest(
  data: unknown
): { success: true; data: PersonaDetectionRequest } | { success: false; error: string } {
  try {
    const validated = PersonaDetectionRequestSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      }
    }
    return { success: false, error: 'Unknown validation error' }
  }
}

/**
 * Type guards
 */

export function isValidPersonaId(value: unknown): value is PersonaId {
  return PersonaIdSchema.safeParse(value).success
}

export function isValidSignalType(value: unknown): value is SignalType {
  return SignalTypeSchema.safeParse(value).success
}

/**
 * Schema version for API compatibility
 */
export const PERSONA_SCHEMA_VERSION = '1.0.0'
