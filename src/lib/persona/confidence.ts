/**
 * Confidence Scoring System
 *
 * Calculates confidence scores for persona classifications based on signals,
 * patterns, and contextual information.
 */

import type {
  DetectionSignal,
  SignalType,
  PersonaId,
  ConfidenceBreakdown,
} from './schema'
import { getPersonaDefinition, type PersonaDefinition } from './taxonomy'

/**
 * Signal type weights (how much each signal type contributes to overall confidence)
 */
const SIGNAL_TYPE_WEIGHTS: Record<SignalType, number> = {
  conversation: 0.4, // Highest weight - direct user communication
  behavioral: 0.25, // User actions speak volumes
  contextual: 0.2, // Background context matters
  session: 0.1, // Session history provides continuity
  referrer: 0.05, // Where they came from is least predictive
}

/**
 * Confidence thresholds
 */
export const CONFIDENCE_THRESHOLDS = {
  /** Very high confidence - can act with certainty */
  VERY_HIGH: 85,
  /** High confidence - safe to personalize */
  HIGH: 75,
  /** Medium confidence - some personalization okay */
  MEDIUM: 60,
  /** Low confidence - minimal personalization */
  LOW: 40,
  /** Very low confidence - treat as unknown */
  VERY_LOW: 0,
} as const

/**
 * Calculate confidence score for a persona based on signals
 */
export function calculateConfidence(
  personaId: PersonaId,
  signals: DetectionSignal[]
): {
  score: number
  breakdown: ConfidenceBreakdown
  isConfident: boolean
} {
  if (personaId === 'unknown' || signals.length === 0) {
    return {
      score: 0,
      breakdown: createEmptyBreakdown(),
      isConfident: false,
    }
  }

  const persona = getPersonaDefinition(personaId)

  // Calculate confidence by signal type
  const signalsByType = groupSignalsByType(signals)
  const typeScores: Record<SignalType, number> = {
    conversation: calculateTypeConfidence('conversation', signalsByType.conversation, persona),
    behavioral: calculateTypeConfidence('behavioral', signalsByType.behavioral, persona),
    contextual: calculateTypeConfidence('contextual', signalsByType.contextual, persona),
    session: calculateTypeConfidence('session', signalsByType.session, persona),
    referrer: calculateTypeConfidence('referrer', signalsByType.referrer, persona),
  }

  // Calculate weighted overall score
  const overallScore = Object.entries(typeScores).reduce((total, [type, score]) => {
    const weight = SIGNAL_TYPE_WEIGHTS[type as SignalType]
    return total + score * weight
  }, 0)

  // Cap at 100
  const finalScore = Math.min(100, Math.max(0, overallScore))

  // Check if above threshold
  const isConfident = finalScore >= persona.confidenceThreshold

  // Build detailed breakdown
  const breakdown = buildConfidenceBreakdown(
    finalScore,
    typeScores,
    signals,
    persona
  )

  return {
    score: finalScore,
    breakdown,
    isConfident,
  }
}

/**
 * Group signals by type
 */
function groupSignalsByType(signals: DetectionSignal[]): Record<SignalType, DetectionSignal[]> {
  const grouped: Record<SignalType, DetectionSignal[]> = {
    conversation: [],
    behavioral: [],
    contextual: [],
    session: [],
    referrer: [],
  }

  for (const signal of signals) {
    grouped[signal.type].push(signal)
  }

  return grouped
}

/**
 * Calculate confidence for a specific signal type
 */
function calculateTypeConfidence(
  type: SignalType,
  signals: DetectionSignal[],
  persona: PersonaDefinition
): number {
  if (signals.length === 0) return 0

  // Get matching indicators from persona definition
  const indicators = getIndicatorsForType(type, persona)

  // Calculate match scores for each signal
  const matchScores = signals.map(signal => {
    const matchScore = calculateSignalMatch(signal, indicators)
    const confidenceWeight = signal.confidence / 100
    const signalWeight = signal.weight

    return matchScore * confidenceWeight * signalWeight
  })

  // Average the match scores
  const averageMatch = matchScores.reduce((sum, score) => sum + score, 0) / matchScores.length

  // Boost for multiple matching signals
  const signalCountBoost = Math.min(1.2, 1 + (signals.length - 1) * 0.05)

  return Math.min(100, averageMatch * signalCountBoost)
}

/**
 * Get persona indicators for a specific signal type
 */
function getIndicatorsForType(type: SignalType, persona: PersonaDefinition): string[] {
  const { indicators } = persona

  switch (type) {
    case 'conversation':
      return [...indicators.conversationPatterns, ...indicators.priorityKeywords]
    case 'behavioral':
      return indicators.behavioralSignals
    case 'contextual':
    case 'referrer':
      return indicators.contextualClues
    case 'session':
      // Session signals are more complex, return all for now
      return [
        ...indicators.conversationPatterns,
        ...indicators.behavioralSignals,
        ...indicators.contextualClues,
      ]
    default:
      return []
  }
}

/**
 * Calculate how well a signal matches persona indicators
 */
function calculateSignalMatch(signal: DetectionSignal, indicators: string[]): number {
  const signalValue = signal.value.toLowerCase()

  // Check for exact matches
  const exactMatches = indicators.filter(indicator =>
    signalValue.includes(indicator.toLowerCase())
  )

  if (exactMatches.length > 0) {
    // More matches = higher confidence
    const matchBonus = Math.min(1, exactMatches.length * 0.3)
    return 80 + matchBonus * 20
  }

  // Check for partial matches (fuzzy matching)
  const partialMatches = indicators.filter(indicator => {
    const indicatorWords = indicator.toLowerCase().split(/\s+/)
    return indicatorWords.some(word => signalValue.includes(word))
  })

  if (partialMatches.length > 0) {
    return 50 + Math.min(30, partialMatches.length * 10)
  }

  // No match
  return 0
}

/**
 * Build detailed confidence breakdown
 */
function buildConfidenceBreakdown(
  overallScore: number,
  typeScores: Record<SignalType, number>,
  signals: DetectionSignal[],
  persona: PersonaDefinition
): ConfidenceBreakdown {
  // Calculate contribution of each signal
  const signalContributions = signals.map(signal => {
    const typeWeight = SIGNAL_TYPE_WEIGHTS[signal.type]
    const typeScore = typeScores[signal.type]
    const contribution = (typeScore * typeWeight * signal.weight * signal.confidence) / 10000

    return {
      signal,
      contribution: Math.min(100, contribution),
    }
  })

  // Sort by contribution
  signalContributions.sort((a, b) => b.contribution - a.contribution)

  // Identify positive factors (high-contributing signals)
  const positiveFactors = signalContributions
    .filter(sc => sc.contribution > 5)
    .map(sc => `${sc.signal.type}: ${sc.signal.value} (${sc.contribution.toFixed(1)}%)`)
    .slice(0, 5) // Top 5

  // Identify negative factors (why confidence isn't higher)
  const negativeFactors: string[] = []

  if (signals.length < 3) {
    negativeFactors.push('Limited number of signals (< 3)')
  }

  const missingTypes = (Object.keys(SIGNAL_TYPE_WEIGHTS) as SignalType[]).filter(
    type => typeScores[type] === 0
  )

  if (missingTypes.length > 0) {
    negativeFactors.push(`Missing signal types: ${missingTypes.join(', ')}`)
  }

  if (overallScore < persona.confidenceThreshold) {
    negativeFactors.push(
      `Below persona threshold (${persona.confidenceThreshold}%)`
    )
  }

  return {
    overall: overallScore,
    bySignalType: typeScores,
    bySignal: signalContributions,
    positiveFactors,
    negativeFactors,
  }
}

/**
 * Create empty confidence breakdown
 */
function createEmptyBreakdown(): ConfidenceBreakdown {
  return {
    overall: 0,
    bySignalType: {
      conversation: 0,
      behavioral: 0,
      contextual: 0,
      session: 0,
      referrer: 0,
    },
    bySignal: [],
    positiveFactors: [],
    negativeFactors: ['No signals available'],
  }
}

/**
 * Compare two personas by confidence and return the better match
 */
export function comparePersonas(
  persona1: { id: PersonaId; confidence: number },
  persona2: { id: PersonaId; confidence: number }
): { id: PersonaId; confidence: number } {
  // If confidence is very close (within 5 points), use priority
  if (Math.abs(persona1.confidence - persona2.confidence) < 5) {
    const def1 = getPersonaDefinition(persona1.id)
    const def2 = getPersonaDefinition(persona2.id)

    // Lower priority number = higher priority
    return def1.priority < def2.priority ? persona1 : persona2
  }

  // Otherwise, use confidence
  return persona1.confidence > persona2.confidence ? persona1 : persona2
}

/**
 * Get confidence level description
 */
export function getConfidenceLevel(score: number): {
  level: 'very_high' | 'high' | 'medium' | 'low' | 'very_low'
  description: string
  canPersonalize: boolean
} {
  if (score >= CONFIDENCE_THRESHOLDS.VERY_HIGH) {
    return {
      level: 'very_high',
      description: 'Very high confidence - strong persona match',
      canPersonalize: true,
    }
  }

  if (score >= CONFIDENCE_THRESHOLDS.HIGH) {
    return {
      level: 'high',
      description: 'High confidence - good persona match',
      canPersonalize: true,
    }
  }

  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    return {
      level: 'medium',
      description: 'Medium confidence - probable persona match',
      canPersonalize: true,
    }
  }

  if (score >= CONFIDENCE_THRESHOLDS.LOW) {
    return {
      level: 'low',
      description: 'Low confidence - uncertain persona match',
      canPersonalize: false,
    }
  }

  return {
    level: 'very_low',
    description: 'Very low confidence - insufficient data',
    canPersonalize: false,
  }
}

/**
 * Calculate confidence improvement suggestions
 */
export function getConfidenceImprovementSuggestions(
  breakdown: ConfidenceBreakdown
): string[] {
  const suggestions: string[] = []

  // Check for missing signal types
  const missingTypes = (Object.keys(breakdown.bySignalType) as SignalType[]).filter(
    type => breakdown.bySignalType[type] === 0
  )

  if (missingTypes.includes('conversation')) {
    suggestions.push('Engage in more conversation to capture user intent')
  }

  if (missingTypes.includes('behavioral')) {
    suggestions.push('Track user interactions and behavior patterns')
  }

  if (missingTypes.includes('contextual')) {
    suggestions.push('Collect contextual information (referrer, device, etc.)')
  }

  // Check for low signal count
  if (breakdown.bySignal.length < 5) {
    suggestions.push('Collect more signals for better accuracy')
  }

  // Check for low individual signal confidence
  const lowConfidenceSignals = breakdown.bySignal.filter(
    s => s.signal.confidence < 60
  )

  if (lowConfidenceSignals.length > breakdown.bySignal.length / 2) {
    suggestions.push('Improve signal quality and confidence')
  }

  return suggestions
}

/**
 * Check if persona change is significant enough to trigger update
 */
export function shouldUpdatePersona(
  currentPersona: { id: PersonaId; confidence: number },
  newPersona: { id: PersonaId; confidence: number }
): boolean {
  // Different persona detected
  if (currentPersona.id !== newPersona.id) {
    // Only switch if new persona has significantly higher confidence
    return newPersona.confidence > currentPersona.confidence + 15
  }

  // Same persona, but confidence changed significantly
  const confidenceDelta = Math.abs(newPersona.confidence - currentPersona.confidence)
  return confidenceDelta > 10
}
