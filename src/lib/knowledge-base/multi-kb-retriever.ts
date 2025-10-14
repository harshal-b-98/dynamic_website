/**
 * Multi-Knowledge Base Retriever
 *
 * Retrieves relevant content from multiple specialized knowledge bases in parallel
 */

import { retrieveRelevantContent, type RetrievalResult } from '../rag'
import type { KBCategory } from '../vector-db/types'
import {
  KB_CATEGORIES,
  getKBWeightsForIntent,
  getAdjustedTopK,
  type IntentKBWeighting
} from './kb-categories'
import {
  performCoverageAnalysis,
  type CoverageAnalysis,
  type RelevanceStats,
  type QueryAspect
} from '../rag/kb-coverage-analyzer'

export interface MultiKBRetrievalOptions {
  // User intent to determine KB weighting
  intent?: string

  // Override default topK per KB
  guidelinesTopK?: number
  personasTopK?: number
  productTopK?: number

  // Global similarity threshold
  threshold?: number

  // Manual weight override (if not using intent-based)
  weights?: IntentKBWeighting
}

export interface MultiKBRetrievalResult {
  guidelines: RetrievalResult[]
  personas: RetrievalResult[]
  product: RetrievalResult[]
  totalResults: number
  processingTime: number
  weights: IntentKBWeighting
}

/**
 * Enhanced retrieval result with coverage analysis and metadata
 */
export interface EnhancedRetrievalResult extends MultiKBRetrievalResult {
  metadata: {
    // Relevance Analysis
    averageRelevance: number           // 0-1 (avg of all similarity scores)
    minRelevance: number               // Lowest similarity score
    maxRelevance: number               // Highest similarity score
    relevanceStats: RelevanceStats     // Detailed relevance breakdown

    // Coverage Analysis
    coverageScore: number              // 0-100 (% of query covered by KB)
    queryAspects: string[]             // Detected aspects in query
    coveredAspects: string[]           // Aspects found in KB
    uncoveredAspects: string[]         // Aspects not in KB

    // Source Tracking
    topSources: Array<{
      source: string
      relevance: number
      kbType: 'guidelines' | 'personas' | 'product'
    }>

    // Gap Analysis
    missingTopics: string[]            // Topics needed but not in KB
    lowConfidenceAreas: string[]       // Areas with low relevance scores

    // Performance
    retrievalTime: number
    tokensRetrieved: number

    // Query Analysis
    extractedAspects: QueryAspect[]    // Full query aspect details
  }
}

/**
 * Retrieve from multiple knowledge bases in parallel
 */
export async function retrieveFromMultipleKBs(
  query: string,
  options: MultiKBRetrievalOptions = {}
): Promise<MultiKBRetrievalResult> {
  const startTime = Date.now()

  // Determine weights based on intent or use provided weights
  const weights = options.weights || (options.intent
    ? getKBWeightsForIntent(options.intent)
    : getKBWeightsForIntent('general_conversation'))

  // Calculate adjusted topK for each KB based on weights
  const guidelinesTopK = options.guidelinesTopK !== undefined
    ? options.guidelinesTopK
    : getAdjustedTopK(KB_CATEGORIES.guidelines.defaultTopK, weights.guidelines)

  const personasTopK = options.personasTopK !== undefined
    ? options.personasTopK
    : getAdjustedTopK(KB_CATEGORIES.personas.defaultTopK, weights.personas)

  const productTopK = options.productTopK !== undefined
    ? options.productTopK
    : getAdjustedTopK(KB_CATEGORIES.product.defaultTopK, weights.product)

  const threshold = options.threshold || 0.7

  // Retrieve from all KBs in parallel
  const [guidelinesResponse, personasResponse, productResponse] = await Promise.all([
    retrieveFromKB(query, 'guidelines', guidelinesTopK, threshold),
    retrieveFromKB(query, 'personas', personasTopK, threshold),
    retrieveFromKB(query, 'product', productTopK, threshold)
  ])

  const processingTime = Date.now() - startTime

  return {
    guidelines: guidelinesResponse,
    personas: personasResponse,
    product: productResponse,
    totalResults: guidelinesResponse.length + personasResponse.length + productResponse.length,
    processingTime,
    weights
  }
}

/**
 * Retrieve from a single knowledge base
 */
async function retrieveFromKB(
  query: string,
  kbCategory: KBCategory,
  topK: number,
  threshold: number
): Promise<RetrievalResult[]> {
  // If topK is 0 or negative (from low weight), skip retrieval
  if (topK <= 0) {
    return []
  }

  try {
    const kbInfo = KB_CATEGORIES[kbCategory]

    // Retrieve with content type filtering
    const response = await retrieveRelevantContent(query, {
      topK,
      similarityThreshold: threshold,
      contentTypes: kbInfo.contentTypes,
      metadata: {
        kb_category: kbCategory
      }
    })

    return response.results
  } catch (error) {
    console.error(`Failed to retrieve from ${kbCategory} KB:`, error)
    // Return empty array on error to avoid breaking the entire request
    return []
  }
}

/**
 * Get retrieval statistics
 */
export function getRetrievalStats(result: MultiKBRetrievalResult) {
  return {
    guidelinesCount: result.guidelines.length,
    personasCount: result.personas.length,
    productCount: result.product.length,
    totalCount: result.totalResults,
    processingTime: result.processingTime,
    averageSimilarity: {
      guidelines: calculateAverageSimilarity(result.guidelines),
      personas: calculateAverageSimilarity(result.personas),
      product: calculateAverageSimilarity(result.product)
    }
  }
}

/**
 * Calculate average similarity score
 */
function calculateAverageSimilarity(results: RetrievalResult[]): number {
  if (results.length === 0) return 0
  const sum = results.reduce((acc, r) => acc + r.similarity, 0)
  return sum / results.length
}

/**
 * Merge results from all KBs into a single sorted array
 */
export function mergeKBResults(result: MultiKBRetrievalResult): RetrievalResult[] {
  const allResults = [
    ...result.guidelines,
    ...result.personas,
    ...result.product
  ]

  // Sort by similarity score descending
  return allResults.sort((a, b) => b.similarity - a.similarity)
}

/**
 * Filter results by minimum similarity threshold
 */
export function filterByThreshold(
  results: RetrievalResult[],
  threshold: number
): RetrievalResult[] {
  return results.filter(r => r.similarity >= threshold)
}

/**
 * Enhanced retrieval with coverage analysis and metadata
 *
 * This function performs the same retrieval as retrieveFromMultipleKBs
 * but adds comprehensive coverage analysis, relevance tracking, and gap detection
 */
export async function retrieveFromMultipleKBsEnhanced(
  query: string,
  options: MultiKBRetrievalOptions = {}
): Promise<EnhancedRetrievalResult> {
  // First, do standard retrieval
  const standardResult = await retrieveFromMultipleKBs(query, options)

  // Perform coverage analysis
  const analysis = performCoverageAnalysis(
    query,
    options.intent,
    standardResult.guidelines,
    standardResult.personas,
    standardResult.product
  )

  // Calculate tokens retrieved (rough estimate based on content length)
  const allResults = [
    ...standardResult.guidelines,
    ...standardResult.personas,
    ...standardResult.product
  ]

  const tokensRetrieved = allResults.reduce((sum, result) => {
    // Rough estimate: ~4 characters per token
    const titleTokens = (result.contentTitle?.length || 0) / 4
    const textTokens = (result.contentText?.length || 0) / 4
    return sum + titleTokens + textTokens
  }, 0)

  // Build enhanced result
  return {
    ...standardResult,
    metadata: {
      // Relevance Analysis
      averageRelevance: analysis.relevanceStats.averageRelevance,
      minRelevance: analysis.relevanceStats.minRelevance,
      maxRelevance: analysis.relevanceStats.maxRelevance,
      relevanceStats: analysis.relevanceStats,

      // Coverage Analysis
      coverageScore: analysis.coverage.coverageScore,
      queryAspects: analysis.coverage.queryAspects,
      coveredAspects: analysis.coverage.coveredAspects,
      uncoveredAspects: analysis.coverage.uncoveredAspects,

      // Source Tracking
      topSources: analysis.topSources,

      // Gap Analysis
      missingTopics: analysis.coverage.missingTopics,
      lowConfidenceAreas: analysis.coverage.lowConfidenceAreas,

      // Performance
      retrievalTime: standardResult.processingTime,
      tokensRetrieved: Math.round(tokensRetrieved),

      // Query Analysis
      extractedAspects: analysis.queryAspects
    }
  }
}
