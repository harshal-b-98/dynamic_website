/**
 * Knowledge Base Validation Script
 *
 * Runs validation test suite to verify retrieval accuracy
 *
 * Usage:
 *   npm run kb:validate
 *   npx tsx src/scripts/validate-kb.ts
 */

// IMPORTANT: Load environment variables BEFORE any other imports
require('dotenv').config({ path: require('path').join(process.cwd(), '.env.local') })

import { runValidation, runValidationByCategory } from '../lib/knowledge-base/validation'

/**
 * Print banner
 */
function printBanner() {
  console.log('═'.repeat(60))
  console.log('  Knowledge Base Validation Tool')
  console.log('  Consumer IQ - Dynamic Website Project')
  console.log('═'.repeat(60))
  console.log()
}

/**
 * Parse command line arguments
 */
function parseArgs(): {
  category?: 'faq' | 'product' | 'brand' | 'website'
  topK?: number
} {
  const args = process.argv.slice(2)
  const parsed: any = {}

  for (const arg of args) {
    if (arg.startsWith('--category=')) {
      parsed.category = arg.split('=')[1] as any
    } else if (arg.startsWith('--top-k=')) {
      parsed.topK = parseInt(arg.split('=')[1], 10)
    }
  }

  return parsed
}

/**
 * Main function
 */
async function main() {
  printBanner()

  const args = parseArgs()

  try {
    let summary

    if (args.category) {
      console.log(`Running validation for category: ${args.category}\n`)
      summary = await runValidationByCategory(args.category, {
        verbose: true,
        topK: args.topK
      })
    } else {
      console.log('Running full validation test suite\n')
      summary = await runValidation({
        verbose: true,
        topK: args.topK
      })
    }

    // Print category breakdown
    if (!args.category) {
      console.log('\n═══════════════════════════════════════════════')
      console.log('  Category Breakdown')
      console.log('═══════════════════════════════════════════════\n')

      const categories = {
        faq: summary.details.filter(d => d.queryId.startsWith('faq-')),
        product: summary.details.filter(d => d.queryId.startsWith('product-')),
        brand: summary.details.filter(d => d.queryId.startsWith('brand-')),
        website: summary.details.filter(d => d.queryId.startsWith('website-'))
      }

      for (const [category, results] of Object.entries(categories)) {
        const passed = results.filter(r => r.passed).length
        const total = results.length
        const accuracy = total > 0 ? (passed / total) * 100 : 0

        console.log(`${category.toUpperCase().padEnd(12)} ${passed}/${total} (${accuracy.toFixed(1)}%)`)
      }

      console.log('\n═══════════════════════════════════════════════\n')
    }

    // Print failed queries for debugging
    const failedQueries = summary.details.filter(d => !d.passed)
    if (failedQueries.length > 0) {
      console.log('═══════════════════════════════════════════════')
      console.log('  Failed Queries (Debug Info)')
      console.log('═══════════════════════════════════════════════\n')

      for (const failed of failedQueries) {
        console.log(`Query: ${failed.query}`)
        console.log(`  Expected: ${failed.expectedSources.join(', ')}`)
        console.log(`  Retrieved: ${failed.retrievedSources.join(', ') || 'None'}`)

        if (failed.topResult) {
          console.log(`  Top similarity: ${failed.topResult.similarity.toFixed(3)}`)
          console.log(`  Snippet: ${failed.topResult.snippet}`)
        }

        if (failed.error) {
          console.log(`  Error: ${failed.error}`)
        }

        console.log()
      }
    }

    // Exit with appropriate code
    const meetsThreshold = summary.accuracy >= 95
    process.exit(meetsThreshold ? 0 : 1)

  } catch (error) {
    console.error('\nFatal Error:', error)
    console.error('\nMake sure:')
    console.error('  1. Knowledge base has been populated (run: npm run kb:populate:all)')
    console.error('  2. Vector database is accessible')
    console.error('  3. Environment variables are set correctly')
    console.error()
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}
