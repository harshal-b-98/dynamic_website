/**
 * Intelligent Fallback Handler
 *
 * Determines generation mode based on KB coverage and
 * implements fallback strategies for different scenarios
 */

import type { PageSpecification, PageGenerationRequest } from '../page-generation'
import type { EnhancedRetrievalResult } from '../knowledge-base/multi-kb-retriever'
import type { ContentValidationResult } from './content-validator'

export enum GenerationMode {
  KB_SUPPORTED = 'KB_SUPPORTED',                    // >70% KB coverage, >60% validation
  PARTIAL_KB_COVERAGE = 'PARTIAL_KB_COVERAGE',      // 30-70% KB coverage
  BEYOND_KB_SCOPE = 'BEYOND_KB_SCOPE',              // <30% KB coverage
  KB_ALIGNMENT_LOW = 'KB_ALIGNMENT_LOW',            // Good coverage but low validation
  VALIDATION_FAILED = 'VALIDATION_FAILED'           // Multiple validation failures
}

export interface GenerationModeResult {
  mode: GenerationMode
  reason: string
  promptModifications: string[]
  confidence: number                // 0-100
  expectValidation: boolean
}

/**
 * Determine generation mode based on KB coverage and previous validation
 */
export function determineGenerationMode(
  coverageScore: number,
  previousValidation?: ContentValidationResult,
  attemptCount: number = 1
): GenerationModeResult {
  // Check for validation failure (regeneration scenario)
  if (previousValidation && previousValidation.regenerationNeeded && attemptCount > 1) {
    return {
      mode: GenerationMode.VALIDATION_FAILED,
      reason: `Previous generation failed validation (score: ${previousValidation.validationScore}/100). Regenerating with stricter KB adherence.`,
      promptModifications: [
        '🚨 CRITICAL: Previous generation failed validation.',
        'Ensure ALL factual claims are verified against KB.',
        'Follow brand guidelines EXACTLY as specified.',
        'Match persona tone and CTAs precisely.',
        'Do NOT include information not found in KB context.'
      ],
      confidence: 50,
      expectValidation: true
    }
  }

  // Check for low KB alignment (good coverage but poor validation)
  if (previousValidation && coverageScore > 60 && previousValidation.validationScore < 60) {
    return {
      mode: GenerationMode.KB_ALIGNMENT_LOW,
      reason: `KB coverage is good (${coverageScore}%) but validation failed (${previousValidation.validationScore}/100). Content may not be using KB effectively.`,
      promptModifications: [
        '⚠️ IMPORTANT: KB context is available but was not used effectively in previous generation.',
        'Generate content STRICTLY from the provided KB context.',
        'Paraphrase KB information rather than generating new claims.',
        'Verify each statement against KB before including.',
        'Prioritize KB facts over general knowledge.'
      ],
      confidence: 60,
      expectValidation: true
    }
  }

  // Determine mode based on coverage score
  if (coverageScore < 30) {
    return {
      mode: GenerationMode.BEYOND_KB_SCOPE,
      reason: `Low KB coverage (${coverageScore}%). Query appears to be outside knowledge base scope.`,
      promptModifications: [
        'ℹ️ NOTE: This query has limited KB coverage (beyond KB scope).',
        'Generate using general knowledge and industry best practices.',
        'Be conservative with claims - focus on general principles.',
        'Mark content as "informational" rather than "definitive".',
        'Suggest user contact support for specific details.',
        'Include disclaimer about consulting documentation for specifics.'
      ],
      confidence: 40,
      expectValidation: false
    }
  } else if (coverageScore < 70) {
    return {
      mode: GenerationMode.PARTIAL_KB_COVERAGE,
      reason: `Partial KB coverage (${coverageScore}%). Some aspects covered, others require general knowledge.`,
      promptModifications: [
        '⚠️ IMPORTANT: Partial KB coverage detected.',
        'Prioritize KB information where available.',
        'For aspects not in KB: use general knowledge but be conservative.',
        'Clearly distinguish between KB-supported and general information.',
        'Mark KB-supported claims with confidence.',
        'Be cautious with claims outside KB coverage.'
      ],
      confidence: 70,
      expectValidation: true
    }
  } else {
    return {
      mode: GenerationMode.KB_SUPPORTED,
      reason: `Strong KB coverage (${coverageScore}%). Generate primarily from KB context.`,
      promptModifications: [
        '✅ EXCELLENT: Strong KB coverage available.',
        'Generate content STRICTLY based on provided KB context.',
        'Do NOT include information not found in KB.',
        'Paraphrase and synthesize KB information naturally.',
        'Follow brand guidelines and persona from KB.',
        'High confidence in factual accuracy expected.'
      ],
      confidence: 90,
      expectValidation: true
    }
  }
}

/**
 * Build enhanced system prompt with mode-specific instructions
 */
export function buildModeSpecificPrompt(
  basePrompt: string,
  modeResult: GenerationModeResult,
  kbContext?: string
): string {
  const modeSection = `
## 🎯 Generation Mode: ${modeResult.mode}

**Context**: ${modeResult.reason}

### Mode-Specific Instructions:
${modeResult.promptModifications.map(mod => `- ${mod}`).join('\n')}

**Confidence Level**: ${modeResult.confidence}/100
**Validation Expected**: ${modeResult.expectValidation ? 'Yes - content will be validated against KB' : 'No - beyond KB scope'}
`

  // Insert mode section after the role description
  const roleEndIndex = basePrompt.indexOf('## Your Role')
  if (roleEndIndex !== -1) {
    const nextSectionIndex = basePrompt.indexOf('##', roleEndIndex + 15)
    if (nextSectionIndex !== -1) {
      return basePrompt.slice(0, nextSectionIndex) + modeSection + basePrompt.slice(nextSectionIndex)
    }
  }

  // If can't find insertion point, append to beginning
  return modeSection + '\n\n' + basePrompt
}

/**
 * Add mode-specific metadata to page specification
 */
export function addGenerationMetadata(
  pageSpec: PageSpecification,
  modeResult: GenerationModeResult,
  retrievalMetadata: EnhancedRetrievalResult['metadata'],
  validationResult?: ContentValidationResult
): PageSpecification {
  return {
    ...pageSpec,
    metadata: {
      ...pageSpec.metadata,

      // Generation Mode Info
      generationMode: modeResult.mode,
      generationConfidence: modeResult.confidence,

      // KB Coverage Info
      kbCoverage: retrievalMetadata.coverageScore,
      kbSourcesUsed: retrievalMetadata.topSources.map(s => s.source),
      queryAspects: retrievalMetadata.queryAspects,
      coveredAspects: retrievalMetadata.coveredAspects,
      uncoveredAspects: retrievalMetadata.uncoveredAspects,

      // Validation Info (if available)
      ...(validationResult && {
        validationScore: validationResult.validationScore,
        validationPassed: validationResult.valid,
        factualAccuracyRate: validationResult.checks.factualAccuracy.verifiedClaims /
          (validationResult.checks.factualAccuracy.verifiedClaims +
           validationResult.checks.factualAccuracy.unverifiedClaims) * 100
      }),

      // Relevance Info
      averageRelevance: retrievalMetadata.averageRelevance,
      topRelevanceSource: retrievalMetadata.topSources[0]?.source
    }
  }
}

/**
 * Determine if regeneration is needed
 */
export function shouldRegenerate(
  validationResult: ContentValidationResult,
  attemptCount: number,
  maxAttempts: number = 2
): { shouldRegenerate: boolean; reason?: string } {
  // Don't regenerate if max attempts reached
  if (attemptCount >= maxAttempts) {
    return {
      shouldRegenerate: false,
      reason: `Max regeneration attempts (${maxAttempts}) reached`
    }
  }

  // Regenerate if validation explicitly says so
  if (validationResult.regenerationNeeded) {
    return {
      shouldRegenerate: true,
      reason: `Validation score too low: ${validationResult.validationScore}/100`
    }
  }

  // Regenerate if critical issues detected
  const criticalIssues = validationResult.checks.factualAccuracy.issues.length > 3 ||
                        validationResult.checks.kbCoverage.hallucinations.length > 2

  if (criticalIssues) {
    return {
      shouldRegenerate: true,
      reason: 'Critical validation issues detected'
    }
  }

  return { shouldRegenerate: false }
}

/**
 * Get mode-specific user message additions
 */
export function getModeSpecificUserMessage(modeResult: GenerationModeResult): string {
  const messages: Record<GenerationMode, string> = {
    [GenerationMode.KB_SUPPORTED]: `
**KB Coverage**: Excellent (${Math.round(modeResult.confidence)}%)
**Generation Strategy**: Use KB context strictly. All claims must be verifiable against KB.
`,
    [GenerationMode.PARTIAL_KB_COVERAGE]: `
**KB Coverage**: Partial (${Math.round(modeResult.confidence)}%)
**Generation Strategy**: Prioritize KB where available, supplement with general knowledge where needed.
`,
    [GenerationMode.BEYOND_KB_SCOPE]: `
**KB Coverage**: Limited (${Math.round(modeResult.confidence)}%)
**Generation Strategy**: Use general knowledge and best practices. Include appropriate disclaimers.
`,
    [GenerationMode.KB_ALIGNMENT_LOW]: `
**KB Coverage**: Good, but previous validation failed
**Generation Strategy**: Generate STRICTLY from KB. Previous attempt did not use KB effectively.
`,
    [GenerationMode.VALIDATION_FAILED]: `
**Regeneration Attempt**: Previous validation failed
**Generation Strategy**: Stricter KB adherence. Fix validation issues from previous attempt.
`
  }

  return messages[modeResult.mode] || ''
}

/**
 * Create fallback page for beyond-KB-scope scenarios
 */
export function createFallbackPage(
  request: PageGenerationRequest,
  retrievalMetadata: EnhancedRetrievalResult['metadata']
): PageSpecification {
  return {
    type: 'landing',
    metadata: {
      title: 'Learn More About Your Inquiry',
      description: 'We\'d like to provide you with the most accurate information.',
      keywords: ['information', 'inquiry', 'support'],
      generatedFor: request.query,
      generationMode: GenerationMode.BEYOND_KB_SCOPE,
      kbCoverage: retrievalMetadata.coverageScore,
      beyondKBScope: true
    },
    layout: {
      type: 'single-column',
      spacing: 'spacious',
      components: [
        {
          id: 'hero-1',
          componentType: 'hero-section',
          order: 0,
          props: {
            headline: 'We\'d Like to Help You With That',
            subheading: 'Your inquiry covers areas that may require specific, up-to-date information. Let us connect you with the right resources.',
            ctaText: 'Contact Support',
            secondaryCta: 'Browse Documentation'
          },
          styling: {
            size: 'xl',
            theme: 'brand'
          },
          metadata: {
            purpose: 'Inform user that query is beyond KB scope',
            priority: 'primary'
          }
        },
        {
          id: 'info-1',
          componentType: 'rich-text-content',
          order: 1,
          content: {
            text: `We noticed your question about "${request.query}" may need specialized information. While we can provide general guidance, we recommend reaching out to our team for the most accurate and current details.`
          },
          styling: {
            size: 'lg'
          },
          metadata: {
            purpose: 'Explain why specific assistance is recommended',
            priority: 'secondary'
          }
        },
        {
          id: 'cta-1',
          componentType: 'cta-section',
          order: 2,
          props: {
            headline: 'Get Specific Answers',
            description: 'Our team can provide detailed information tailored to your needs.',
            primaryCta: 'Contact Us',
            secondaryCta: 'View Documentation'
          },
          styling: {
            size: 'lg',
            theme: 'brand'
          },
          metadata: {
            purpose: 'Provide clear next steps',
            priority: 'primary'
          }
        }
      ]
    },
    navigation: {
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Information Request', href: '#' }
      ],
      relatedQueries: [
        'How can I contact support?',
        'Where can I find documentation?',
        'What resources are available?'
      ],
      nextSteps: [
        'Contact our support team',
        'Browse documentation',
        'Schedule a consultation'
      ]
    }
  }
}

/**
 * Calculate quality score for fallback determination
 */
export function calculateQualityScore(
  coverageScore: number,
  validationScore?: number,
  relevanceScore?: number
): number {
  if (!validationScore && !relevanceScore) {
    // Only coverage available
    return coverageScore
  }

  if (!validationScore) {
    // Coverage + relevance
    return Math.round((coverageScore * 0.6) + (relevanceScore! * 100 * 0.4))
  }

  if (!relevanceScore) {
    // Coverage + validation
    return Math.round((coverageScore * 0.5) + (validationScore * 0.5))
  }

  // All metrics available
  return Math.round(
    (coverageScore * 0.4) +
    (validationScore * 0.4) +
    (relevanceScore * 100 * 0.2)
  )
}
