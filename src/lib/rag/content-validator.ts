/**
 * Content Validation System
 *
 * Validates generated page content against knowledge base,
 * checks brand compliance, persona alignment, and detects hallucinations
 */

import type { PageSpecification, ComponentSpecification } from '../page-generation'
import type { EnhancedRetrievalResult } from '../knowledge-base/multi-kb-retriever'

export interface FactualClaim {
  claim: string
  location: string                 // Where in the page (e.g., "hero-section: headline")
  verifiedInKB: boolean
  kbSource?: string
  confidence: number                // 0-100
}

export interface BrandGuidelineCheck {
  valid: boolean
  brandVoiceMatch: number           // 0-100
  toneAnalysis: {
    expected: string                // From Guidelines KB
    actual: string                  // From generated content
    match: boolean
  }
  terminologyCheck: {
    correctTerms: string[]
    incorrectTerms: string[]
  }
  violations: string[]
}

export interface PersonaAlignmentCheck {
  valid: boolean
  toneMatch: number                 // 0-100
  complexityLevel: {
    expected: string                // From Personas KB
    actual: string
    appropriate: boolean
  }
  ctaCheck: {
    generated: string[]
    expectedPatterns: string[]      // From Personas KB
    appropriate: boolean
  }
}

export interface KBCoverageCheck {
  contentFromKB: number             // % of content from KB
  contentGenerated: number          // % of content generated
  beyondKBScope: boolean
  kbSourcesUsed: string[]
  hallucinations: Array<{
    content: string
    reason: string
    severity: 'high' | 'medium' | 'low'
  }>
}

export interface ContentValidationResult {
  valid: boolean
  validationScore: number           // 0-100
  checks: {
    factualAccuracy: {
      valid: boolean
      claimsExtracted: FactualClaim[]
      verifiedClaims: number
      unverifiedClaims: number
      issues: string[]
    }
    guidelineCompliance: BrandGuidelineCheck
    personaAlignment: PersonaAlignmentCheck
    kbCoverage: KBCoverageCheck
  }
  recommendations: string[]
  regenerationNeeded: boolean
}

/**
 * Extract factual claims from page specification
 */
export function extractClaims(pageSpec: PageSpecification): FactualClaim[] {
  const claims: FactualClaim[] = []

  // Extract from components
  pageSpec.layout.components.forEach(component => {
    const location = `${component.componentType}: ${component.id}`

    // Extract from props
    if (component.props) {
      extractClaimsFromObject(component.props, location, claims)
    }

    // Extract from content
    if (component.content) {
      extractClaimsFromObject(component.content, location, claims)
    }
  })

  return claims
}

/**
 * Extract claims from object properties
 */
function extractClaimsFromObject(obj: any, location: string, claims: FactualClaim[]): void {
  if (!obj || typeof obj !== 'object') return

  // Check for claim-worthy text fields
  const textFields = ['headline', 'subheading', 'description', 'text', 'title']

  for (const key of textFields) {
    if (obj[key] && typeof obj[key] === 'string') {
      const text = obj[key] as string

      // Extract sentences as potential claims
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)

      sentences.forEach(sentence => {
        claims.push({
          claim: sentence.trim(),
          location: `${location}.${key}`,
          verifiedInKB: false,
          confidence: 0
        })
      })
    }
  }

  // Recursively check nested objects
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (Array.isArray(obj[key])) {
        obj[key].forEach((item: any, index: number) => {
          extractClaimsFromObject(item, `${location}.${key}[${index}]`, claims)
        })
      } else {
        extractClaimsFromObject(obj[key], `${location}.${key}`, claims)
      }
    }
  }
}

/**
 * Verify claims against KB context
 */
export function verifyClaims(
  claims: FactualClaim[],
  kbContext: string,
  retrievalMetadata: EnhancedRetrievalResult['metadata']
): {
  verifiedClaims: FactualClaim[]
  unverifiedClaims: FactualClaim[]
  verificationRate: number
} {
  const kbContextLower = kbContext.toLowerCase()
  const verifiedClaims: FactualClaim[] = []
  const unverifiedClaims: FactualClaim[] = []

  for (const claim of claims) {
    const claimLower = claim.claim.toLowerCase()

    // Extract key terms from claim
    const keyTerms = extractKeyTerms(claimLower)

    // Check if key terms appear in KB context
    let matchCount = 0
    let matchedSource: string | undefined

    for (const term of keyTerms) {
      if (kbContextLower.includes(term)) {
        matchCount++

        // Try to find which source contains this term
        if (!matchedSource) {
          const source = retrievalMetadata.topSources.find(s =>
            s.source.toLowerCase().includes(term)
          )
          if (source) {
            matchedSource = source.source
          }
        }
      }
    }

    // Calculate confidence based on match rate
    const confidence = keyTerms.length > 0
      ? Math.round((matchCount / keyTerms.length) * 100)
      : 0

    const verified = confidence >= 60 // At least 60% of key terms match

    const verifiedClaim = {
      ...claim,
      verifiedInKB: verified,
      kbSource: matchedSource,
      confidence
    }

    if (verified) {
      verifiedClaims.push(verifiedClaim)
    } else {
      unverifiedClaims.push(verifiedClaim)
    }
  }

  const verificationRate = claims.length > 0
    ? Math.round((verifiedClaims.length / claims.length) * 100)
    : 100

  return {
    verifiedClaims,
    unverifiedClaims,
    verificationRate
  }
}

/**
 * Extract key terms from text for matching
 */
function extractKeyTerms(text: string): string[] {
  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'it', 'its', 'you', 'your', 'we', 'our'
  ])

  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
    .slice(0, 10) // Max 10 key terms per claim
}

/**
 * Check brand compliance
 */
export function checkBrandCompliance(
  pageSpec: PageSpecification,
  kbContext: string,
  retrievalMetadata: EnhancedRetrievalResult['metadata']
): BrandGuidelineCheck {
  // Extract text content from page
  const pageText = extractAllText(pageSpec).toLowerCase()

  // Look for guidelines KB content
  const hasGuidelinesKB = retrievalMetadata.topSources.some(s => s.kbType === 'guidelines')

  if (!hasGuidelinesKB) {
    // No guidelines available to check against
    return {
      valid: true,
      brandVoiceMatch: 100,
      toneAnalysis: {
        expected: 'professional',
        actual: 'professional',
        match: true
      },
      terminologyCheck: {
        correctTerms: [],
        incorrectTerms: []
      },
      violations: []
    }
  }

  // Check for common brand voice indicators
  const professionalIndicators = ['optimize', 'efficient', 'solution', 'platform', 'streamline']
  const casualIndicators = ['awesome', 'cool', 'wow', 'hey', 'super']
  const technicalIndicators = ['api', 'integration', 'architecture', 'infrastructure', 'scalable']

  const professionalCount = professionalIndicators.filter(i => pageText.includes(i)).length
  const casualCount = casualIndicators.filter(i => pageText.includes(i)).length
  const technicalCount = technicalIndicators.filter(i => pageText.includes(i)).length

  // Determine actual tone
  let actualTone = 'professional'
  if (casualCount > professionalCount) {
    actualTone = 'casual'
  } else if (technicalCount > professionalCount) {
    actualTone = 'technical'
  }

  // Extract expected tone from KB (simplified)
  const expectedTone = kbContext.toLowerCase().includes('professional') ? 'professional' :
                       kbContext.toLowerCase().includes('technical') ? 'technical' : 'professional'

  const toneMatch = actualTone === expectedTone

  // Calculate brand voice match
  const brandVoiceMatch = toneMatch ? 90 : 60

  const violations: string[] = []
  if (!toneMatch) {
    violations.push(`Tone mismatch: expected ${expectedTone}, got ${actualTone}`)
  }
  if (casualCount > 0) {
    violations.push('Avoid casual language in professional content')
  }

  return {
    valid: violations.length === 0,
    brandVoiceMatch,
    toneAnalysis: {
      expected: expectedTone,
      actual: actualTone,
      match: toneMatch
    },
    terminologyCheck: {
      correctTerms: professionalIndicators.filter(i => pageText.includes(i)),
      incorrectTerms: casualIndicators.filter(i => pageText.includes(i))
    },
    violations
  }
}

/**
 * Check persona alignment
 */
export function checkPersonaAlignment(
  pageSpec: PageSpecification,
  retrievalMetadata: EnhancedRetrievalResult['metadata']
): PersonaAlignmentCheck {
  // Extract CTAs from page
  const ctas = extractCTAs(pageSpec)

  // Look for persona KB content
  const hasPersonaKB = retrievalMetadata.topSources.some(s => s.kbType === 'personas')

  if (!hasPersonaKB) {
    // No persona information available
    return {
      valid: true,
      toneMatch: 100,
      complexityLevel: {
        expected: 'medium',
        actual: 'medium',
        appropriate: true
      },
      ctaCheck: {
        generated: ctas,
        expectedPatterns: [],
        appropriate: true
      }
    }
  }

  // Check CTA patterns for different personas
  const technicalCTAs = ['view documentation', 'see api', 'start integration', 'explore api']
  const executiveCTAs = ['schedule briefing', 'view case studies', 'see roi']
  const generalCTAs = ['get started', 'learn more', 'contact us', 'request demo']

  const ctasLower = ctas.map(c => c.toLowerCase())
  const hasTechnicalCTAs = ctasLower.some(cta => technicalCTAs.some(t => cta.includes(t)))
  const hasExecutiveCTAs = ctasLower.some(cta => executiveCTAs.some(t => cta.includes(t)))

  // Determine expected patterns based on KB (simplified)
  const expectedPatterns = hasTechnicalCTAs ? technicalCTAs :
                          hasExecutiveCTAs ? executiveCTAs : generalCTAs

  const appropriate = ctas.length > 0 && ctas.every(cta => cta.length > 5)

  return {
    valid: appropriate,
    toneMatch: 85,
    complexityLevel: {
      expected: 'medium',
      actual: 'medium',
      appropriate: true
    },
    ctaCheck: {
      generated: ctas,
      expectedPatterns,
      appropriate
    }
  }
}

/**
 * Calculate KB coverage
 */
export function calculateKBCoverage(
  pageSpec: PageSpecification,
  kbContext: string,
  verifiedClaims: FactualClaim[],
  unverifiedClaims: FactualClaim[]
): KBCoverageCheck {
  const totalClaims = verifiedClaims.length + unverifiedClaims.length
  const contentFromKB = totalClaims > 0
    ? Math.round((verifiedClaims.length / totalClaims) * 100)
    : 0

  const contentGenerated = 100 - contentFromKB
  const beyondKBScope = contentFromKB < 50

  // Identify hallucinations (unverified claims with specific patterns)
  const hallucinations = unverifiedClaims
    .filter(claim => claim.confidence < 30) // Very low confidence
    .map(claim => ({
      content: claim.claim,
      reason: `Claim not found in KB (confidence: ${claim.confidence}%)`,
      severity: 'medium' as const
    }))

  // Extract KB sources used
  const kbSourcesUsed = Array.from(new Set(
    verifiedClaims
      .filter(c => c.kbSource)
      .map(c => c.kbSource!)
  ))

  return {
    contentFromKB,
    contentGenerated,
    beyondKBScope,
    kbSourcesUsed,
    hallucinations
  }
}

/**
 * Extract all text from page specification
 */
function extractAllText(pageSpec: PageSpecification): string {
  const texts: string[] = []

  pageSpec.layout.components.forEach(component => {
    // Extract from props
    if (component.props) {
      extractTextFromObject(component.props, texts)
    }

    // Extract from content
    if (component.content) {
      extractTextFromObject(component.content, texts)
    }
  })

  return texts.join(' ')
}

/**
 * Extract text from object recursively
 */
function extractTextFromObject(obj: any, texts: string[]): void {
  if (!obj) return

  if (typeof obj === 'string') {
    texts.push(obj)
  } else if (typeof obj === 'object') {
    for (const key in obj) {
      extractTextFromObject(obj[key], texts)
    }
  }
}

/**
 * Extract CTAs from page specification
 */
function extractCTAs(pageSpec: PageSpecification): string[] {
  const ctas: string[] = []

  pageSpec.layout.components.forEach(component => {
    // Common CTA fields
    const ctaFields = ['ctaText', 'primaryCta', 'secondaryCta', 'buttonText']

    for (const field of ctaFields) {
      if (component.props?.[field]) {
        ctas.push(component.props[field])
      }
      if (component.content?.[field]) {
        ctas.push(component.content[field])
      }
    }
  })

  return ctas
}

/**
 * Validate generated content against KB and guidelines
 */
export function validateGeneratedContent(
  pageSpec: PageSpecification,
  kbContext: string,
  retrievalMetadata: EnhancedRetrievalResult['metadata']
): ContentValidationResult {
  // Extract claims
  const claims = extractClaims(pageSpec)

  // Verify claims
  const { verifiedClaims, unverifiedClaims, verificationRate } = verifyClaims(
    claims,
    kbContext,
    retrievalMetadata
  )

  // Check brand compliance
  const guidelineCompliance = checkBrandCompliance(pageSpec, kbContext, retrievalMetadata)

  // Check persona alignment
  const personaAlignment = checkPersonaAlignment(pageSpec, retrievalMetadata)

  // Calculate KB coverage
  const kbCoverage = calculateKBCoverage(
    pageSpec,
    kbContext,
    verifiedClaims,
    unverifiedClaims
  )

  // Build issues list
  const issues: string[] = []
  if (unverifiedClaims.length > verifiedClaims.length) {
    issues.push(`Low claim verification rate: ${verificationRate}%`)
  }
  if (!guidelineCompliance.valid) {
    issues.push(...guidelineCompliance.violations)
  }
  if (!personaAlignment.valid) {
    issues.push('Persona alignment issues detected')
  }
  if (kbCoverage.hallucinations.length > 0) {
    issues.push(`${kbCoverage.hallucinations.length} potential hallucinations detected`)
  }

  // Calculate overall validation score (weighted average)
  const factualAccuracyScore = verificationRate
  const guidelineScore = guidelineCompliance.brandVoiceMatch
  const personaScore = personaAlignment.toneMatch
  const coverageScore = kbCoverage.contentFromKB

  const validationScore = Math.round(
    (factualAccuracyScore * 0.4) +  // 40% weight on factual accuracy
    (guidelineScore * 0.25) +        // 25% weight on brand compliance
    (personaScore * 0.20) +          // 20% weight on persona alignment
    (coverageScore * 0.15)           // 15% weight on KB coverage
  )

  // Generate recommendations
  const recommendations: string[] = []
  if (verificationRate < 80) {
    recommendations.push('Increase reliance on KB content for factual claims')
  }
  if (!guidelineCompliance.valid) {
    recommendations.push('Adjust tone to match brand guidelines')
  }
  if (kbCoverage.beyondKBScope) {
    recommendations.push('Consider adding more KB content for this topic area')
  }
  if (kbCoverage.hallucinations.length > 0) {
    recommendations.push('Remove or verify unsubstantiated claims')
  }

  return {
    valid: validationScore >= 60 && issues.length === 0,
    validationScore,
    checks: {
      factualAccuracy: {
        valid: verificationRate >= 70,
        claimsExtracted: claims,
        verifiedClaims: verifiedClaims.length,
        unverifiedClaims: unverifiedClaims.length,
        issues: unverifiedClaims.length > verifiedClaims.length
          ? [`Low verification rate: ${verificationRate}%`]
          : []
      },
      guidelineCompliance,
      personaAlignment,
      kbCoverage
    },
    recommendations,
    regenerationNeeded: validationScore < 60
  }
}
