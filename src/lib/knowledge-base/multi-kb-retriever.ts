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
