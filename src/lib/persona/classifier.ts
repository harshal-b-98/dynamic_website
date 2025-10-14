/**
 * LLM-based Persona Classifier
 *
 * Uses Claude API to analyze conversation history, behavioral signals, and contextual
 * information to classify users into persona categories.
 */

import Anthropic from '@anthropic-ai/sdk'
import type {
  PersonaId,
  DetectionSignal,
  PersonaClassification,
  PersonaDetectionRequest,
} from './schema'
import { getAllPersonaDefinitions, getPersonaDefinition, type PersonaDefinition } from './taxonomy'
import { calculateConfidence } from './confidence'

/**
 * Initialize Anthropic client
 */
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Classification method types
 */
export type ClassificationMethod = 'llm' | 'rule-based' | 'hybrid'

/**
 * Classify persona using LLM
 */
export async function classifyPersona(
  request: PersonaDetectionRequest,
  existingSignals: DetectionSignal[] = []
): Promise<PersonaClassification> {
  const startTime = Date.now()

  try {
    // Extract signals from request
    const newSignals = extractSignalsFromRequest(request)
    const allSignals = [...existingSignals, ...newSignals]

    // Try rule-based classification first (fast path)
    const ruleBasedResult = attemptRuleBasedClassification(allSignals)

    if (ruleBasedResult && ruleBasedResult.confidence >= 85) {
      // High confidence from rules alone
      return ruleBasedResult
    }

    // Fall back to LLM classification for complex cases
    const llmResult = await classifyWithLLM(request, allSignals)

    // Combine rule-based and LLM results for hybrid approach
    if (ruleBasedResult) {
      return combineClassifications(ruleBasedResult, llmResult, allSignals)
    }

    return llmResult
  } catch (error) {
    console.error('Error in persona classification:', error)

    // Fallback to unknown persona
    return {
      personaId: 'unknown',
      confidence: 0,
      isConfident: false,
      signals: [],
      reasoning: 'Classification failed due to error',
      method: 'llm',
      classifiedAt: new Date(),
    }
  }
}

/**
 * Extract signals from detection request
 */
function extractSignalsFromRequest(request: PersonaDetectionRequest): DetectionSignal[] {
  const signals: DetectionSignal[] = []
  const timestamp = new Date()

  // Extract from conversation history
  if (request.conversationHistory) {
    const userMessages = request.conversationHistory.filter(msg => msg.role === 'user')

    for (const message of userMessages) {
      signals.push({
        type: 'conversation',
        value: message.content,
        weight: 1.0,
        confidence: 90,
        timestamp: message.timestamp || timestamp,
      })
    }
  }

  // Extract from behavioral signals
  if (request.behavioralSignals) {
    for (const signal of request.behavioralSignals) {
      signals.push({
        type: 'behavioral',
        value: JSON.stringify(signal),
        weight: 0.8,
        confidence: 75,
        timestamp: signal.timestamp || timestamp,
      })
    }
  }

  // Extract from contextual information
  if (request.contextualInfo) {
    const { referrer, userAgent, landingPage, currentPage, deviceType } = request.contextualInfo

    if (referrer) {
      signals.push({
        type: 'referrer',
        value: referrer,
        weight: 0.6,
        confidence: 80,
        timestamp,
      })
    }

    if (landingPage) {
      signals.push({
        type: 'contextual',
        value: `Landing page: ${landingPage}`,
        weight: 0.7,
        confidence: 85,
        timestamp,
      })
    }

    if (currentPage) {
      signals.push({
        type: 'contextual',
        value: `Current page: ${currentPage}`,
        weight: 0.7,
        confidence: 85,
        timestamp,
      })
    }

    if (deviceType) {
      signals.push({
        type: 'contextual',
        value: `Device: ${deviceType}`,
        weight: 0.5,
        confidence: 70,
        timestamp,
      })
    }
  }

  return signals
}

/**
 * Attempt rule-based classification (fast path)
 */
function attemptRuleBasedClassification(
  signals: DetectionSignal[]
): PersonaClassification | null {
  if (signals.length === 0) return null

  const personas = getAllPersonaDefinitions()
  const scores: Array<{ personaId: PersonaId; confidence: number }> = []

  // Calculate confidence for each persona
  for (const persona of personas) {
    const { score, isConfident } = calculateConfidence(persona.id, signals)

    scores.push({
      personaId: persona.id,
      confidence: score,
    })
  }

  // Sort by confidence
  scores.sort((a, b) => b.confidence - a.confidence)

  const topPersona = scores[0]
  const personaDef = getPersonaDefinition(topPersona.personaId)

  // Only return if confidence is above threshold
  if (topPersona.confidence < personaDef.confidenceThreshold) {
    return null
  }

  return {
    personaId: topPersona.personaId,
    confidence: topPersona.confidence,
    isConfident: true,
    signals,
    reasoning: 'Rule-based classification using signal matching',
    alternatives: scores.slice(1, 4),
    method: 'rule-based',
    classifiedAt: new Date(),
  }
}

/**
 * Classify using LLM (Claude)
 */
async function classifyWithLLM(
  request: PersonaDetectionRequest,
  signals: DetectionSignal[]
): Promise<PersonaClassification> {
  // Build prompt with persona taxonomy and signals
  const prompt = buildClassificationPrompt(request, signals)

  // Call Claude API
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1500,
    temperature: 0.3,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  // Parse response
  const result = parseClassificationResponse(response, signals)

  return result
}

/**
 * System prompt for persona classification
 */
const SYSTEM_PROMPT = `You are an expert user persona classifier. Your role is to analyze user interactions, behaviors, and context to accurately classify users into predefined persona categories.

You must respond with a valid JSON object containing:
- personaId: The detected persona ID
- confidence: Confidence score (0-100)
- reasoning: Explanation of your classification
- alternatives: Alternative persona candidates with confidence scores

Be thorough, accurate, and data-driven in your analysis.`

/**
 * Build classification prompt
 */
function buildClassificationPrompt(
  request: PersonaDetectionRequest,
  signals: DetectionSignal[]
): string {
  const personas = getAllPersonaDefinitions()

  let prompt = `# Persona Classification Task

Analyze the following user data and classify them into one of the predefined personas.

## Available Personas:

`

  // Add persona definitions
  for (const persona of personas) {
    prompt += `
### ${persona.id.toUpperCase()}: ${persona.name}
**Description**: ${persona.description}
**Characteristics**: ${persona.characteristics.join(', ')}
**Goals**: ${persona.goals.join(', ')}
**Pain Points**: ${persona.painPoints.join(', ')}
**Key Indicators**:
- Conversation patterns: ${persona.indicators.conversationPatterns.slice(0, 10).join(', ')}
- Priority keywords: ${persona.indicators.priorityKeywords.slice(0, 10).join(', ')}
`
  }

  prompt += `

## User Data:

`

  // Add conversation history
  if (request.conversationHistory && request.conversationHistory.length > 0) {
    prompt += `### Conversation History:
`
    for (const message of request.conversationHistory) {
      if (message.role === 'user') {
        prompt += `User: "${message.content}"\n`
      }
    }
  }

  // Add behavioral signals
  if (request.behavioralSignals && request.behavioralSignals.length > 0) {
    prompt += `\n### Behavioral Signals:
`
    for (const signal of request.behavioralSignals.slice(0, 10)) {
      prompt += `- ${signal.type}: ${JSON.stringify(signal.value)}\n`
    }
  }

  // Add contextual info
  if (request.contextualInfo) {
    prompt += `\n### Contextual Information:
`
    const ctx = request.contextualInfo
    if (ctx.referrer) prompt += `- Referrer: ${ctx.referrer}\n`
    if (ctx.landingPage) prompt += `- Landing Page: ${ctx.landingPage}\n`
    if (ctx.currentPage) prompt += `- Current Page: ${ctx.currentPage}\n`
    if (ctx.deviceType) prompt += `- Device: ${ctx.deviceType}\n`
  }

  prompt += `

## Task:

Analyze all the provided data and determine the most likely persona. Return your response as a valid JSON object in this exact format:

\`\`\`json
{
  "personaId": "smb_owner",
  "confidence": 85,
  "reasoning": "User mentions 'affordable', 'small business', and 'quick setup', which strongly indicate SMB Owner persona. They are focused on cost and ease of implementation.",
  "alternatives": [
    {"personaId": "student_learner", "confidence": 45},
    {"personaId": "enterprise_buyer", "confidence": 20}
  ]
}
\`\`\`

Provide your analysis now:`

  return prompt
}

/**
 * Parse Claude API response
 */
function parseClassificationResponse(
  response: Anthropic.Messages.Message,
  signals: DetectionSignal[]
): PersonaClassification {
  try {
    const content = response.content[0]

    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Extract JSON from response (handle markdown code blocks)
    const text = content.text
    const jsonMatch = text.match(/```json\n([\s\S]+?)\n```/) || text.match(/{[\s\S]+}/)

    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0]
    const parsed = JSON.parse(jsonStr)

    // Validate persona ID
    const personaId = parsed.personaId as PersonaId
    const personaDef = getPersonaDefinition(personaId)

    // Recalculate confidence using our scoring system
    const { score: recalculatedConfidence, isConfident } = calculateConfidence(personaId, signals)

    // Blend LLM confidence with our calculated confidence
    const blendedConfidence = Math.round((parsed.confidence + recalculatedConfidence) / 2)

    return {
      personaId,
      confidence: blendedConfidence,
      isConfident: blendedConfidence >= personaDef.confidenceThreshold,
      signals,
      reasoning: parsed.reasoning,
      alternatives: parsed.alternatives || [],
      method: 'llm',
      classifiedAt: new Date(),
    }
  } catch (error) {
    console.error('Error parsing classification response:', error)

    // Fallback to rule-based
    const fallback = attemptRuleBasedClassification(signals)

    if (fallback) {
      return fallback
    }

    // Ultimate fallback to unknown
    return {
      personaId: 'unknown',
      confidence: 0,
      isConfident: false,
      signals,
      reasoning: 'Failed to parse LLM response',
      method: 'llm',
      classifiedAt: new Date(),
    }
  }
}

/**
 * Combine rule-based and LLM classifications (hybrid approach)
 */
function combineClassifications(
  ruleBasedResult: PersonaClassification,
  llmResult: PersonaClassification,
  signals: DetectionSignal[]
): PersonaClassification {
  // If both agree, high confidence
  if (ruleBasedResult.personaId === llmResult.personaId) {
    const combinedConfidence = Math.round(
      (ruleBasedResult.confidence * 0.4 + llmResult.confidence * 0.6)
    )

    return {
      ...llmResult,
      confidence: combinedConfidence,
      isConfident: combinedConfidence >= getPersonaDefinition(llmResult.personaId).confidenceThreshold,
      method: 'hybrid',
      reasoning: `Hybrid classification: Both rule-based and LLM agree. ${llmResult.reasoning}`,
    }
  }

  // If they disagree, prefer LLM but reduce confidence
  const reducedConfidence = Math.round(llmResult.confidence * 0.8)

  return {
    ...llmResult,
    confidence: reducedConfidence,
    isConfident: reducedConfidence >= getPersonaDefinition(llmResult.personaId).confidenceThreshold,
    method: 'hybrid',
    reasoning: `Hybrid classification: Rule-based suggested ${ruleBasedResult.personaId} (${ruleBasedResult.confidence}%), but LLM classified as ${llmResult.personaId}. ${llmResult.reasoning}`,
  }
}

/**
 * Quick persona check (for returning users with existing classification)
 */
export function quickPersonaCheck(
  existingPersonaId: PersonaId,
  existingConfidence: number,
  newSignals: DetectionSignal[]
): { shouldReclassify: boolean; reason: string } {
  // If already very confident, don't reclassify often
  if (existingConfidence >= 90 && newSignals.length < 5) {
    return {
      shouldReclassify: false,
      reason: 'Existing classification is very confident',
    }
  }

  // If confidence is low, reclassify more frequently
  if (existingConfidence < 70) {
    return {
      shouldReclassify: true,
      reason: 'Existing confidence is low',
    }
  }

  // If many new signals, consider reclassification
  if (newSignals.length >= 10) {
    return {
      shouldReclassify: true,
      reason: 'Significant new signals available',
    }
  }

  // Check if new signals contradict existing persona
  const contradictionCheck = checkForContradictions(existingPersonaId, newSignals)

  if (contradictionCheck.hasContradictions) {
    return {
      shouldReclassify: true,
      reason: contradictionCheck.reason,
    }
  }

  return {
    shouldReclassify: false,
    reason: 'Existing classification is still valid',
  }
}

/**
 * Check if new signals contradict existing persona
 */
function checkForContradictions(
  personaId: PersonaId,
  newSignals: DetectionSignal[]
): { hasContradictions: boolean; reason: string } {
  const persona = getPersonaDefinition(personaId)
  const negativeIndicators = persona.indicators.negativeIndicators

  // Check for negative indicators in new signals
  for (const signal of newSignals) {
    const signalValue = signal.value.toLowerCase()

    for (const negativeIndicator of negativeIndicators) {
      if (signalValue.includes(negativeIndicator.toLowerCase())) {
        return {
          hasContradictions: true,
          reason: `New signal contradicts ${personaId}: "${negativeIndicator}" detected`,
        }
      }
    }
  }

  return {
    hasContradictions: false,
    reason: 'No contradictions found',
  }
}
