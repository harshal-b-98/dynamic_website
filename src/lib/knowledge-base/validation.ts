/**
 * Knowledge Base Validation Suite
 *
 * Test queries to validate retrieval accuracy and quality
 */

import { RAGRetriever } from '../rag/retriever'
import { ContextBuilder } from '../rag/context-builder'

export interface ValidationQuery {
  id: string
  query: string
  category: 'faq' | 'product' | 'brand' | 'website'
  expectedSources: string[] // Expected content source IDs
  minSimilarity: number // Minimum similarity score expected
}

/**
 * Comprehensive test queries covering all content areas
 */
export const VALIDATION_QUERIES: ValidationQuery[] = [
  // FAQ Queries (5)
  {
    id: 'faq-1',
    query: 'What is Consumer IQ?',
    category: 'faq',
    expectedSources: ['ciq-faq', 'ciq-website'],
    minSimilarity: 0.75
  },
  {
    id: 'faq-2',
    query: 'How does Consumer IQ help with customer insights?',
    category: 'faq',
    expectedSources: ['ciq-faq', 'ciq-features'],
    minSimilarity: 0.70
  },
  {
    id: 'faq-3',
    query: 'What industries can benefit from Consumer IQ?',
    category: 'faq',
    expectedSources: ['ciq-faq', 'ciq-website'],
    minSimilarity: 0.70
  },
  {
    id: 'faq-4',
    query: 'How much does Consumer IQ cost?',
    category: 'faq',
    expectedSources: ['ciq-faq'],
    minSimilarity: 0.75
  },
  {
    id: 'faq-5',
    query: 'How do I get started with Consumer IQ?',
    category: 'faq',
    expectedSources: ['ciq-faq', 'ciq-website'],
    minSimilarity: 0.70
  },

  // Product/Features Queries (7)
  {
    id: 'product-1',
    query: 'Tell me about the analytics dashboard',
    category: 'product',
    expectedSources: ['ciq-features', 'ciq-website'],
    minSimilarity: 0.70
  },
  {
    id: 'product-2',
    query: 'What data visualization options are available?',
    category: 'product',
    expectedSources: ['ciq-features'],
    minSimilarity: 0.65
  },
  {
    id: 'product-3',
    query: 'How does the segmentation feature work?',
    category: 'product',
    expectedSources: ['ciq-features'],
    minSimilarity: 0.70
  },
  {
    id: 'product-4',
    query: 'Can Consumer IQ integrate with my CRM?',
    category: 'product',
    expectedSources: ['ciq-features', 'ciq-faq'],
    minSimilarity: 0.65
  },
  {
    id: 'product-5',
    query: 'What reporting capabilities does the platform have?',
    category: 'product',
    expectedSources: ['ciq-features'],
    minSimilarity: 0.70
  },
  {
    id: 'product-6',
    query: 'How does Consumer IQ handle data privacy?',
    category: 'product',
    expectedSources: ['ciq-features', 'ciq-faq'],
    minSimilarity: 0.65
  },
  {
    id: 'product-7',
    query: 'What are the key features of Consumer IQ?',
    category: 'product',
    expectedSources: ['ciq-features', 'ciq-website'],
    minSimilarity: 0.75
  },

  // Brand Guidelines Queries (4)
  {
    id: 'brand-1',
    query: 'What are the Consumer IQ brand colors?',
    category: 'brand',
    expectedSources: ['ciq-brand'],
    minSimilarity: 0.75
  },
  {
    id: 'brand-2',
    query: 'What is the Consumer IQ brand voice?',
    category: 'brand',
    expectedSources: ['ciq-brand'],
    minSimilarity: 0.70
  },
  {
    id: 'brand-3',
    query: 'How should I use the Consumer IQ logo?',
    category: 'brand',
    expectedSources: ['ciq-brand'],
    minSimilarity: 0.70
  },
  {
    id: 'brand-4',
    query: 'What typography does Consumer IQ use?',
    category: 'brand',
    expectedSources: ['ciq-brand'],
    minSimilarity: 0.70
  },

  // Website/Messaging Queries (6)
  {
    id: 'website-1',
    query: 'What is the main value proposition of Consumer IQ?',
    category: 'website',
    expectedSources: ['ciq-website', 'ciq-faq'],
    minSimilarity: 0.70
  },
  {
    id: 'website-2',
    query: 'Who is Consumer IQ designed for?',
    category: 'website',
    expectedSources: ['ciq-website', 'ciq-faq'],
    minSimilarity: 0.70
  },
  {
    id: 'website-3',
    query: 'What makes Consumer IQ different from competitors?',
    category: 'website',
    expectedSources: ['ciq-website', 'ciq-features'],
    minSimilarity: 0.65
  },
  {
    id: 'website-4',
    query: 'How can Consumer IQ improve customer experience?',
    category: 'website',
    expectedSources: ['ciq-website', 'ciq-features'],
    minSimilarity: 0.65
  },
  {
    id: 'website-5',
    query: 'What problems does Consumer IQ solve?',
    category: 'website',
    expectedSources: ['ciq-website', 'ciq-faq'],
    minSimilarity: 0.70
  },
  {
    id: 'website-6',
    query: 'Tell me about the Consumer IQ platform benefits',
    category: 'website',
    expectedSources: ['ciq-website', 'ciq-features'],
    minSimilarity: 0.70
  }
]

export interface ValidationResult {
  queryId: string
  query: string
  passed: boolean
  topResult: {
    contentId: string
    similarity: number
    snippet: string
  } | null
  retrievedSources: string[]
  expectedSources: string[]
  sourcesMatched: boolean
  similarityThresholdMet: boolean
  error?: string
}

export interface ValidationSummary {
  totalQueries: number
  passedQueries: number
  failedQueries: number
  accuracy: number
  averageSimilarity: number
  sourceMatchRate: number
  details: ValidationResult[]
}

/**
 * Run validation test suite
 */
export async function runValidation(
  options: {
    retriever?: RAGRetriever
    topK?: number
    verbose?: boolean
  } = {}
): Promise<ValidationSummary> {
  const {
    retriever = new RAGRetriever(),
    topK = 5,
    verbose = false
  } = options

  const results: ValidationResult[] = []

  if (verbose) {
    console.log('\n═══════════════════════════════════════════════')
    console.log('  Knowledge Base Validation Test Suite')
    console.log('═══════════════════════════════════════════════\n')
    console.log(`Running ${VALIDATION_QUERIES.length} test queries...\n`)
  }

  for (const testQuery of VALIDATION_QUERIES) {
    try {
      if (verbose) {
        console.log(`Testing: ${testQuery.query}`)
        console.log(`Expected sources: ${testQuery.expectedSources.join(', ')}`)
      }

      // Perform retrieval
      const retrievalResponse = await retriever.retrieve(testQuery.query, {
        topK: topK,
        similarityThreshold: 0.5
      })

      const retrievalResults = retrievalResponse.results

      if (retrievalResults.length === 0) {
        results.push({
          queryId: testQuery.id,
          query: testQuery.query,
          passed: false,
          topResult: null,
          retrievedSources: [],
          expectedSources: testQuery.expectedSources,
          sourcesMatched: false,
          similarityThresholdMet: false,
          error: 'No results returned'
        })

        if (verbose) {
          console.log('  ✗ FAILED: No results returned\n')
        }
        continue
      }

      // Extract unique content IDs from results
      const retrievedSources = [...new Set(
        retrievalResults.map(r => r.metadata.sourceId || r.contentId.split('_')[0])
      )]

      // Check if any expected source was found
      const sourcesMatched = testQuery.expectedSources.some(expectedSource =>
        retrievedSources.includes(expectedSource)
      )

      // Check similarity threshold
      const topSimilarity = retrievalResults[0].similarity
      const similarityThresholdMet = topSimilarity >= testQuery.minSimilarity

      const passed = sourcesMatched && similarityThresholdMet

      results.push({
        queryId: testQuery.id,
        query: testQuery.query,
        passed,
        topResult: {
          contentId: retrievalResults[0].contentId,
          similarity: topSimilarity,
          snippet: retrievalResults[0].contentText.substring(0, 100) + '...'
        },
        retrievedSources,
        expectedSources: testQuery.expectedSources,
        sourcesMatched,
        similarityThresholdMet
      })

      if (verbose) {
        if (passed) {
          console.log(`  ✓ PASSED`)
        } else {
          console.log(`  ✗ FAILED`)
          if (!sourcesMatched) {
            console.log(`    - Expected sources not found in top results`)
          }
          if (!similarityThresholdMet) {
            console.log(`    - Similarity ${topSimilarity.toFixed(3)} < ${testQuery.minSimilarity}`)
          }
        }
        console.log(`  Top similarity: ${topSimilarity.toFixed(3)}`)
        console.log(`  Retrieved sources: ${retrievedSources.join(', ')}\n`)
      }

    } catch (error) {
      results.push({
        queryId: testQuery.id,
        query: testQuery.query,
        passed: false,
        topResult: null,
        retrievedSources: [],
        expectedSources: testQuery.expectedSources,
        sourcesMatched: false,
        similarityThresholdMet: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      if (verbose) {
        console.log(`  ✗ ERROR: ${error}\n`)
      }
    }
  }

  // Calculate summary statistics
  const passedQueries = results.filter(r => r.passed).length
  const failedQueries = results.length - passedQueries
  const accuracy = (passedQueries / results.length) * 100

  const validSimilarities = results
    .filter(r => r.topResult !== null)
    .map(r => r.topResult!.similarity)
  const averageSimilarity = validSimilarities.length > 0
    ? validSimilarities.reduce((sum, s) => sum + s, 0) / validSimilarities.length
    : 0

  const sourceMatchCount = results.filter(r => r.sourcesMatched).length
  const sourceMatchRate = (sourceMatchCount / results.length) * 100

  if (verbose) {
    console.log('═══════════════════════════════════════════════')
    console.log('  Validation Summary')
    console.log('═══════════════════════════════════════════════\n')
    console.log(`Total Queries:       ${results.length}`)
    console.log(`Passed:              ${passedQueries} (${accuracy.toFixed(1)}%)`)
    console.log(`Failed:              ${failedQueries}`)
    console.log(`Average Similarity:  ${averageSimilarity.toFixed(3)}`)
    console.log(`Source Match Rate:   ${sourceMatchRate.toFixed(1)}%`)
    console.log()

    if (accuracy >= 95) {
      console.log('✓ Validation PASSED - Accuracy meets 95% threshold')
    } else {
      console.log('✗ Validation FAILED - Accuracy below 95% threshold')
    }
    console.log('═══════════════════════════════════════════════\n')
  }

  return {
    totalQueries: results.length,
    passedQueries,
    failedQueries,
    accuracy,
    averageSimilarity,
    sourceMatchRate,
    details: results
  }
}

/**
 * Run validation by category
 */
export async function runValidationByCategory(
  category: ValidationQuery['category'],
  options: Parameters<typeof runValidation>[0] = {}
): Promise<ValidationSummary> {
  const categoryQueries = VALIDATION_QUERIES.filter(q => q.category === category)

  // Temporarily replace global queries for this test
  const originalQueries = [...VALIDATION_QUERIES]
  VALIDATION_QUERIES.length = 0
  VALIDATION_QUERIES.push(...categoryQueries)

  try {
    const result = await runValidation(options)
    return result
  } finally {
    // Restore original queries
    VALIDATION_QUERIES.length = 0
    VALIDATION_QUERIES.push(...originalQueries)
  }
}

/**
 * Quick validation check (non-verbose)
 */
export async function quickValidation(): Promise<boolean> {
  const summary = await runValidation({ verbose: false })
  return summary.accuracy >= 95
}
