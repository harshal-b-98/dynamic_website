/**
 * Validation Reporting System
 *
 * Generates detailed reports and console logs for
 * RAG validation, coverage analysis, and generation quality
 */

import type { EnhancedRetrievalResult } from '../knowledge-base/multi-kb-retriever'
import type { ContentValidationResult } from './content-validator'
import type { GenerationMode, GenerationModeResult } from './fallback-handler'

export interface ValidationReportData {
  retrievalMetadata: EnhancedRetrievalResult['metadata']
  validationResult?: ContentValidationResult
  modeResult: GenerationModeResult
  generationTime: number
  attemptNumber: number
}

/**
 * Generate comprehensive validation report for console
 */
export function generateValidationReport(data: ValidationReportData): string {
  const sections: string[] = []

  // Header
  sections.push('\n' + '='.repeat(80))
  sections.push('📊 RAG CONTENT VALIDATION REPORT')
  sections.push('='.repeat(80))

  // Generation Mode Section
  sections.push('\n🎯 GENERATION MODE')
  sections.push(`Mode: ${getModeEmoji(data.modeResult.mode)} ${data.modeResult.mode}`)
  sections.push(`Confidence: ${data.modeResult.confidence}/100`)
  sections.push(`Reason: ${data.modeResult.reason}`)
  sections.push(`Attempt: #${data.attemptNumber}`)

  // KB Coverage Section
  sections.push('\n📚 KNOWLEDGE BASE COVERAGE')
  sections.push(`Coverage Score: ${data.retrievalMetadata.coverageScore}/100 ${getCoverageEmoji(data.retrievalMetadata.coverageScore)}`)
  sections.push(`Average Relevance: ${(data.retrievalMetadata.averageRelevance * 100).toFixed(1)}%`)
  sections.push(`Relevance Range: ${(data.retrievalMetadata.minRelevance * 100).toFixed(1)}% - ${(data.retrievalMetadata.maxRelevance * 100).toFixed(1)}%`)

  // Query Aspects
  if (data.retrievalMetadata.queryAspects.length > 0) {
    sections.push('\n🔍 Query Aspects:')
    sections.push(`  Total: ${data.retrievalMetadata.queryAspects.length}`)
    sections.push(`  ✅ Covered: ${data.retrievalMetadata.coveredAspects.join(', ') || 'none'}`)
    sections.push(`  ❌ Uncovered: ${data.retrievalMetadata.uncoveredAspects.join(', ') || 'none'}`)
  }

  // Gap Analysis
  if (data.retrievalMetadata.missingTopics.length > 0) {
    sections.push('\n⚠️  GAPS DETECTED')
    sections.push(`Missing Topics: ${data.retrievalMetadata.missingTopics.join(', ')}`)
  }

  if (data.retrievalMetadata.lowConfidenceAreas.length > 0) {
    sections.push(`Low Confidence Areas: ${data.retrievalMetadata.lowConfidenceAreas.join(', ')}`)
  }

  // Top Sources
  if (data.retrievalMetadata.topSources.length > 0) {
    sections.push('\n📖 Top KB Sources Used:')
    data.retrievalMetadata.topSources.slice(0, 3).forEach((source, idx) => {
      sections.push(`  ${idx + 1}. ${source.source} (${(source.relevance * 100).toFixed(1)}% - ${source.kbType})`)
    })
  }

  // Validation Results (if available)
  if (data.validationResult) {
    sections.push('\n✅ CONTENT VALIDATION')
    sections.push(`Overall Score: ${data.validationResult.validationScore}/100 ${getValidationEmoji(data.validationResult.validationScore)}`)
    sections.push(`Status: ${data.validationResult.valid ? '✅ PASSED' : '❌ FAILED'}`)

    // Factual Accuracy
    sections.push('\n  📝 Factual Accuracy:')
    sections.push(`    Claims Verified: ${data.validationResult.checks.factualAccuracy.verifiedClaims}/${data.validationResult.checks.factualAccuracy.verifiedClaims + data.validationResult.checks.factualAccuracy.unverifiedClaims}`)
    const verificationRate = data.validationResult.checks.factualAccuracy.verifiedClaims /
      (data.validationResult.checks.factualAccuracy.verifiedClaims + data.validationResult.checks.factualAccuracy.unverifiedClaims) * 100
    sections.push(`    Verification Rate: ${verificationRate.toFixed(1)}%`)

    // Brand Compliance
    sections.push('\n  🎨 Brand Compliance:')
    sections.push(`    Voice Match: ${data.validationResult.checks.guidelineCompliance.brandVoiceMatch}/100`)
    sections.push(`    Tone: ${data.validationResult.checks.guidelineCompliance.toneAnalysis.actual} (expected: ${data.validationResult.checks.guidelineCompliance.toneAnalysis.expected})`)
    if (data.validationResult.checks.guidelineCompliance.violations.length > 0) {
      sections.push(`    Violations: ${data.validationResult.checks.guidelineCompliance.violations.join('; ')}`)
    }

    // Persona Alignment
    sections.push('\n  👤 Persona Alignment:')
    sections.push(`    Tone Match: ${data.validationResult.checks.personaAlignment.toneMatch}/100`)
    sections.push(`    CTAs: ${data.validationResult.checks.personaAlignment.ctaCheck.generated.join(', ')}`)

    // KB Coverage Check
    sections.push('\n  📊 KB Content Usage:')
    sections.push(`    From KB: ${data.validationResult.checks.kbCoverage.contentFromKB}%`)
    sections.push(`    Generated: ${data.validationResult.checks.kbCoverage.contentGenerated}%`)
    if (data.validationResult.checks.kbCoverage.hallucinations.length > 0) {
      sections.push(`    ⚠️  Potential Hallucinations: ${data.validationResult.checks.kbCoverage.hallucinations.length}`)
    }

    // Recommendations
    if (data.validationResult.recommendations.length > 0) {
      sections.push('\n💡 RECOMMENDATIONS:')
      data.validationResult.recommendations.forEach((rec, idx) => {
        sections.push(`  ${idx + 1}. ${rec}`)
      })
    }

    // Regeneration needed?
    if (data.validationResult.regenerationNeeded) {
      sections.push('\n🔄 REGENERATION REQUIRED')
      sections.push('Validation score below threshold. Will attempt regeneration with stricter guidelines.')
    }
  }

  // Performance Metrics
  sections.push('\n⚡ PERFORMANCE METRICS')
  sections.push(`KB Retrieval Time: ${data.retrievalMetadata.retrievalTime}ms`)
  sections.push(`Tokens Retrieved: ${data.retrievalMetadata.tokensRetrieved}`)
  sections.push(`Total Generation Time: ${data.generationTime}ms`)

  // Footer
  sections.push('\n' + '='.repeat(80) + '\n')

  return sections.join('\n')
}

/**
 * Generate short summary for console logging
 */
export function generateShortSummary(data: ValidationReportData): string {
  const parts: string[] = []

  parts.push(`🎯 Mode: ${data.modeResult.mode}`)
  parts.push(`📚 Coverage: ${data.retrievalMetadata.coverageScore}%`)

  if (data.validationResult) {
    parts.push(`✅ Validation: ${data.validationResult.validationScore}/100`)
  }

  parts.push(`⚡ ${data.generationTime}ms`)

  return parts.join(' | ')
}

/**
 * Log validation report to console
 */
export function logValidationReport(data: ValidationReportData): void {
  const report = generateValidationReport(data)
  console.log(report)
}

/**
 * Log short summary to console
 */
export function logShortSummary(data: ValidationReportData): void {
  const summary = generateShortSummary(data)
  console.log(`\n${summary}\n`)
}

/**
 * Generate coverage summary for quick display
 */
export function generateCoverageSummary(metadata: EnhancedRetrievalResult['metadata']): string {
  const emoji = getCoverageEmoji(metadata.coverageScore)
  return `${emoji} KB Coverage: ${metadata.coverageScore}% | Avg Relevance: ${(metadata.averageRelevance * 100).toFixed(1)}% | Aspects: ${metadata.coveredAspects.length}/${metadata.queryAspects.length}`
}

/**
 * Generate validation summary for quick display
 */
export function generateValidationSummary(validation: ContentValidationResult): string {
  const emoji = getValidationEmoji(validation.validationScore)
  const status = validation.valid ? '✅ PASSED' : '❌ FAILED'
  return `${emoji} Validation Score: ${validation.validationScore}/100 | Status: ${status} | Verified Claims: ${validation.checks.factualAccuracy.verifiedClaims}/${validation.checks.factualAccuracy.verifiedClaims + validation.checks.factualAccuracy.unverifiedClaims}`
}

/**
 * Get emoji for generation mode
 */
function getModeEmoji(mode: GenerationMode): string {
  const emojis: Record<GenerationMode, string> = {
    KB_SUPPORTED: '✅',
    PARTIAL_KB_COVERAGE: '⚠️',
    BEYOND_KB_SCOPE: 'ℹ️',
    KB_ALIGNMENT_LOW: '🔄',
    VALIDATION_FAILED: '🚨'
  }
  return emojis[mode] || '❓'
}

/**
 * Get emoji for coverage score
 */
function getCoverageEmoji(score: number): string {
  if (score >= 80) return '🌟'
  if (score >= 60) return '✅'
  if (score >= 40) return '⚠️'
  return '❌'
}

/**
 * Get emoji for validation score
 */
function getValidationEmoji(score: number): string {
  if (score >= 90) return '🌟'
  if (score >= 75) return '✅'
  if (score >= 60) return '👍'
  if (score >= 40) return '⚠️'
  return '❌'
}

/**
 * Format metrics for storage/logging
 */
export interface ValidationMetrics {
  timestamp: number
  query: string
  intent?: string

  // Coverage Metrics
  coverageScore: number
  averageRelevance: number
  aspectsCovered: number
  aspectsTotal: number

  // Validation Metrics
  validationScore?: number
  validationPassed?: boolean
  claimsVerified?: number
  claimsTotal?: number

  // Generation Metrics
  generationMode: GenerationMode
  generationConfidence: number
  generationTime: number
  attemptNumber: number

  // Performance
  retrievalTime: number
  tokensRetrieved: number
}

/**
 * Extract metrics for tracking
 */
export function extractMetrics(
  query: string,
  intent: string | undefined,
  data: ValidationReportData
): ValidationMetrics {
  return {
    timestamp: Date.now(),
    query,
    intent,

    // Coverage
    coverageScore: data.retrievalMetadata.coverageScore,
    averageRelevance: data.retrievalMetadata.averageRelevance,
    aspectsCovered: data.retrievalMetadata.coveredAspects.length,
    aspectsTotal: data.retrievalMetadata.queryAspects.length,

    // Validation
    validationScore: data.validationResult?.validationScore,
    validationPassed: data.validationResult?.valid,
    claimsVerified: data.validationResult?.checks.factualAccuracy.verifiedClaims,
    claimsTotal: data.validationResult
      ? data.validationResult.checks.factualAccuracy.verifiedClaims +
        data.validationResult.checks.factualAccuracy.unverifiedClaims
      : undefined,

    // Generation
    generationMode: data.modeResult.mode,
    generationConfidence: data.modeResult.confidence,
    generationTime: data.generationTime,
    attemptNumber: data.attemptNumber,

    // Performance
    retrievalTime: data.retrievalMetadata.retrievalTime,
    tokensRetrieved: data.retrievalMetadata.tokensRetrieved
  }
}

/**
 * Log metrics in structured format (JSON)
 */
export function logMetrics(metrics: ValidationMetrics): void {
  console.log('\n📊 VALIDATION METRICS (JSON):')
  console.log(JSON.stringify(metrics, null, 2))
}

/**
 * Generate detailed hallucination report
 */
export function generateHallucinationReport(validation: ContentValidationResult): string {
  if (validation.checks.kbCoverage.hallucinations.length === 0) {
    return '✅ No hallucinations detected'
  }

  const sections: string[] = []
  sections.push('⚠️  POTENTIAL HALLUCINATIONS DETECTED')
  sections.push(`Count: ${validation.checks.kbCoverage.hallucinations.length}\n`)

  validation.checks.kbCoverage.hallucinations.forEach((hall, idx) => {
    sections.push(`${idx + 1}. [${hall.severity.toUpperCase()}] ${hall.content}`)
    sections.push(`   Reason: ${hall.reason}\n`)
  })

  return sections.join('\n')
}

/**
 * Generate recommendation report
 */
export function generateRecommendationReport(
  validation: ContentValidationResult,
  metadata: EnhancedRetrievalResult['metadata']
): string {
  const recommendations: string[] = []

  // Coverage-based recommendations
  if (metadata.coverageScore < 50) {
    recommendations.push('📚 Consider expanding knowledge base for this topic area')
  }

  if (metadata.missingTopics.length > 0) {
    recommendations.push(`📝 Add KB content for: ${metadata.missingTopics.join(', ')}`)
  }

  // Validation-based recommendations
  if (validation) {
    recommendations.push(...validation.recommendations)
  }

  if (recommendations.length === 0) {
    return '✅ No recommendations - excellent quality'
  }

  return '💡 RECOMMENDATIONS:\n' + recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')
}
