/**
 * Knowledge Base Coverage Analyzer
 *
 * Analyzes query coverage by KB, extracts query aspects,
 * identifies gaps, and calculates coverage scores
 */

import { RetrievalResult } from '../knowledge-base/retrieval-types'

export interface QueryAspect {
  aspect: string
  keywords: string[]
  importance: 'high' | 'medium' | 'low'
}

export interface CoverageAnalysis {
  coverageScore: number              // 0-100 (% of query covered by KB)
  queryAspects: string[]             // Detected aspects in query
  coveredAspects: string[]           // Aspects found in KB
  uncoveredAspects: string[]         // Aspects not in KB
  missingTopics: string[]            // Topics needed but not in KB
  lowConfidenceAreas: string[]       // Areas with low relevance scores
}

export interface RelevanceStats {
  averageRelevance: number           // 0-1 (avg of all similarity scores)
  minRelevance: number               // Lowest similarity score
  maxRelevance: number               // Highest similarity score
  highRelevanceCount: number         // Results with >0.8 similarity
  mediumRelevanceCount: number       // Results with 0.6-0.8 similarity
  lowRelevanceCount: number          // Results with <0.6 similarity
}

/**
 * Extract query aspects from user query
 * Identifies key topics, questions, and intents
 */
export function extractQueryAspects(query: string, intent?: string): QueryAspect[] {
  const aspects: QueryAspect[] = []
  const queryLower = query.toLowerCase()

  // Common aspect patterns
  const aspectPatterns = [
    // Product features
    { keywords: ['feature', 'capability', 'function', 'what does', 'what can'], aspect: 'features', importance: 'high' as const },
    { keywords: ['benefit', 'advantage', 'why use', 'value'], aspect: 'benefits', importance: 'high' as const },

    // Pricing
    { keywords: ['price', 'pricing', 'cost', 'how much', 'plans', 'subscription'], aspect: 'pricing', importance: 'high' as const },

    // Technical
    { keywords: ['integrate', 'integration', 'api', 'sdk', 'technical', 'architecture'], aspect: 'integration', importance: 'medium' as const },
    { keywords: ['security', 'compliance', 'gdpr', 'hipaa', 'soc2'], aspect: 'compliance', importance: 'high' as const },

    // Comparison
    { keywords: ['compare', 'comparison', 'vs', 'versus', 'difference', 'alternative'], aspect: 'competitor_comparison', importance: 'medium' as const },

    // Use cases
    { keywords: ['use case', 'example', 'how to use', 'workflow'], aspect: 'use_cases', importance: 'medium' as const },

    // Support
    { keywords: ['support', 'help', 'documentation', 'guide', 'tutorial'], aspect: 'support', importance: 'low' as const },

    // Demo/Trial
    { keywords: ['demo', 'trial', 'try', 'test'], aspect: 'demo_request', importance: 'medium' as const },
  ]

  // Extract aspects based on keywords
  for (const pattern of aspectPatterns) {
    if (pattern.keywords.some(keyword => queryLower.includes(keyword))) {
      aspects.push({
        aspect: pattern.aspect,
        keywords: pattern.keywords.filter(k => queryLower.includes(k)),
        importance: pattern.importance
      })
    }
  }

  // Add intent-based aspects
  if (intent) {
    const intentAspects: Record<string, string> = {
      'product_inquiry': 'product_overview',
      'pricing_inquiry': 'pricing',
      'technical_support': 'technical_documentation',
      'demo_request': 'demo_booking',
      'integration_question': 'integration',
      'competitor_analysis': 'competitor_comparison',
      'compliance_question': 'compliance'
    }

    const intentAspect = intentAspects[intent]
    if (intentAspect && !aspects.some(a => a.aspect === intentAspect)) {
      aspects.push({
        aspect: intentAspect,
        keywords: [intent],
        importance: 'high'
      })
    }
  }

  // If no specific aspects detected, add general query aspect
  if (aspects.length === 0) {
    aspects.push({
      aspect: 'general_information',
      keywords: ['information'],
      importance: 'medium'
    })
  }

  return aspects
}

/**
 * Analyze which query aspects are covered by KB results
 */
export function analyzeCoverage(
  queryAspects: QueryAspect[],
  kbResults: RetrievalResult[],
  query: string
): CoverageAnalysis {
  const coveredAspects: string[] = []
  const uncoveredAspects: string[] = []
  const missingTopics: string[] = []
  const lowConfidenceAreas: string[] = []

  // Check each query aspect
  for (const queryAspect of queryAspects) {
    let isCovered = false
    let maxRelevance = 0

    // Check if any KB result covers this aspect
    for (const result of kbResults) {
      const resultText = `${result.contentTitle} ${result.contentText}`.toLowerCase()

      // Check if aspect keywords appear in KB result
      const keywordMatches = queryAspect.keywords.filter(keyword =>
        resultText.includes(keyword.toLowerCase())
      ).length

      if (keywordMatches > 0 && result.similarity > 0.6) {
        isCovered = true
        maxRelevance = Math.max(maxRelevance, result.similarity)
      }
    }

    if (isCovered) {
      coveredAspects.push(queryAspect.aspect)

      // Check if coverage is low confidence
      if (maxRelevance < 0.7) {
        lowConfidenceAreas.push(queryAspect.aspect)
      }
    } else {
      uncoveredAspects.push(queryAspect.aspect)

      // Add to missing topics if high importance
      if (queryAspect.importance === 'high') {
        missingTopics.push(queryAspect.aspect)
      }
    }
  }

  // Calculate coverage score
  const coverageScore = queryAspects.length > 0
    ? Math.round((coveredAspects.length / queryAspects.length) * 100)
    : 0

  return {
    coverageScore,
    queryAspects: queryAspects.map(a => a.aspect),
    coveredAspects,
    uncoveredAspects,
    missingTopics,
    lowConfidenceAreas
  }
}

/**
 * Calculate relevance statistics from KB results
 */
export function calculateRelevanceStats(kbResults: RetrievalResult[]): RelevanceStats {
  if (kbResults.length === 0) {
    return {
      averageRelevance: 0,
      minRelevance: 0,
      maxRelevance: 0,
      highRelevanceCount: 0,
      mediumRelevanceCount: 0,
      lowRelevanceCount: 0
    }
  }

  const similarities = kbResults.map(r => r.similarity)
  const averageRelevance = similarities.reduce((sum, s) => sum + s, 0) / similarities.length
  const minRelevance = Math.min(...similarities)
  const maxRelevance = Math.max(...similarities)

  const highRelevanceCount = similarities.filter(s => s > 0.8).length
  const mediumRelevanceCount = similarities.filter(s => s >= 0.6 && s <= 0.8).length
  const lowRelevanceCount = similarities.filter(s => s < 0.6).length

  return {
    averageRelevance: Math.round(averageRelevance * 100) / 100,
    minRelevance: Math.round(minRelevance * 100) / 100,
    maxRelevance: Math.round(maxRelevance * 100) / 100,
    highRelevanceCount,
    mediumRelevanceCount,
    lowRelevanceCount
  }
}

/**
 * Identify top KB sources by relevance
 */
export function identifyTopSources(
  guidelinesResults: RetrievalResult[],
  personasResults: RetrievalResult[],
  productResults: RetrievalResult[],
  limit: number = 5
): Array<{ source: string; relevance: number; kbType: 'guidelines' | 'personas' | 'product' }> {
  const allSources: Array<{ source: string; relevance: number; kbType: 'guidelines' | 'personas' | 'product' }> = []

  // Collect from guidelines
  guidelinesResults.forEach(r => {
    allSources.push({
      source: r.contentTitle || r.contentId,
      relevance: r.similarity,
      kbType: 'guidelines'
    })
  })

  // Collect from personas
  personasResults.forEach(r => {
    allSources.push({
      source: r.contentTitle || r.contentId,
      relevance: r.similarity,
      kbType: 'personas'
    })
  })

  // Collect from product
  productResults.forEach(r => {
    allSources.push({
      source: r.contentTitle || r.contentId,
      relevance: r.similarity,
      kbType: 'product'
    })
  })

  // Sort by relevance and return top sources
  return allSources
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit)
}

/**
 * Perform complete coverage analysis
 */
export function performCoverageAnalysis(
  query: string,
  intent: string | undefined,
  guidelinesResults: RetrievalResult[],
  personasResults: RetrievalResult[],
  productResults: RetrievalResult[]
): {
  coverage: CoverageAnalysis
  relevanceStats: RelevanceStats
  topSources: Array<{ source: string; relevance: number; kbType: string }>
  queryAspects: QueryAspect[]
} {
  // Extract query aspects
  const queryAspects = extractQueryAspects(query, intent)

  // Combine all KB results
  const allResults = [...guidelinesResults, ...personasResults, ...productResults]

  // Analyze coverage
  const coverage = analyzeCoverage(queryAspects, allResults, query)

  // Calculate relevance stats
  const relevanceStats = calculateRelevanceStats(allResults)

  // Identify top sources
  const topSources = identifyTopSources(
    guidelinesResults,
    personasResults,
    productResults,
    5
  )

  return {
    coverage,
    relevanceStats,
    topSources,
    queryAspects
  }
}
