/**
 * Knowledge Base Population CLI
 *
 * Command-line tool to populate the vector database with knowledge base content
 *
 * Usage:
 *   npx tsx src/scripts/populate-kb.ts --all
 *   npx tsx src/scripts/populate-kb.ts --source=ciq-faq
 *   npx tsx src/scripts/populate-kb.ts --priority=high
 */

// IMPORTANT: Load environment variables BEFORE any other imports
require('dotenv').config({ path: require('path').join(process.cwd(), '.env.local') })

import {
  INITIAL_CONTENT_SOURCES,
  getContentSource,
  getHighPriorityContent,
  type ContentSource
} from '../lib/knowledge-base/content-inventory'
import {
  processContentSources,
  generateSummary,
  type ProcessingResult
} from '../lib/knowledge-base/processor'

/**
 * Parse command line arguments
 */
function parseArgs(): {
  all: boolean
  source?: string
  priority?: 'high' | 'medium' | 'low'
} {
  const args = process.argv.slice(2)
  const parsed: any = {}

  for (const arg of args) {
    if (arg === '--all') {
      parsed.all = true
    } else if (arg.startsWith('--source=')) {
      parsed.source = arg.split('=')[1]
    } else if (arg.startsWith('--priority=')) {
      parsed.priority = arg.split('=')[1]
    }
  }

  return parsed
}

/**
 * Select sources based on arguments
 */
function selectSources(args: ReturnType<typeof parseArgs>): ContentSource[] {
  if (args.source) {
    const source = getContentSource(args.source)
    if (!source) {
      console.error(`Error: Source "${args.source}" not found`)
      process.exit(1)
    }
    return [source]
  }

  if (args.priority) {
    return INITIAL_CONTENT_SOURCES.filter(s => s.priority === args.priority)
  }

  if (args.all) {
    return INITIAL_CONTENT_SOURCES
  }

  // Default: high priority only
  return getHighPriorityContent()
}

/**
 * Print banner
 */
function printBanner() {
  console.log('═'.repeat(60))
  console.log('  Knowledge Base Population Tool')
  console.log('  Consumer IQ - Dynamic Website Project')
  console.log('═'.repeat(60))
  console.log()
}

/**
 * Print help
 */
function printHelp() {
  console.log('Usage:')
  console.log('  npx tsx src/scripts/populate-kb.ts [options]')
  console.log()
  console.log('Options:')
  console.log('  --all                 Process all content sources')
  console.log('  --source=<id>         Process specific source by ID')
  console.log('  --priority=<level>    Process sources by priority (high|medium|low)')
  console.log('  --help                Show this help message')
  console.log()
  console.log('Examples:')
  console.log('  npx tsx src/scripts/populate-kb.ts --all')
  console.log('  npx tsx src/scripts/populate-kb.ts --source=ciq-faq')
  console.log('  npx tsx src/scripts/populate-kb.ts --priority=high')
  console.log()
  console.log('Available Sources:')
  INITIAL_CONTENT_SOURCES.forEach(source => {
    console.log(`  - ${source.id.padEnd(20)} [${source.priority}] ${source.name}`)
  })
}

/**
 * Print results table
 */
function printResults(results: ProcessingResult[]) {
  console.log()
  console.log('═'.repeat(60))
  console.log('  Processing Results')
  console.log('═'.repeat(60))
  console.log()

  results.forEach(result => {
    const status = result.success ? '✓' : '✗'
    const color = result.success ? '\x1b[32m' : '\x1b[31m'
    const reset = '\x1b[0m'

    console.log(`${color}${status}${reset} ${result.sourceName}`)
    if (result.success) {
      console.log(`  Chunks: ${result.chunksCreated} | Embeddings: ${result.embeddingsStored}`)
      console.log(`  Tokens: ${result.tokensUsed} | Cost: $${result.cost.toFixed(4)}`)
      console.log(`  Time: ${(result.processingTime / 1000).toFixed(2)}s`)
    } else {
      console.log(`  Error: ${result.error}`)
    }
    console.log()
  })
}

/**
 * Print summary
 */
function printSummary(results: ProcessingResult[]) {
  const summary = generateSummary(results)

  console.log('═'.repeat(60))
  console.log('  Summary')
  console.log('═'.repeat(60))
  console.log()
  console.log(`Total Sources:       ${summary.totalSources}`)
  console.log(`Successful:          ${summary.successfulSources}`)
  console.log(`Failed:              ${summary.failedSources}`)
  console.log()
  console.log(`Total Chunks:        ${summary.totalChunks}`)
  console.log(`Total Embeddings:    ${summary.totalEmbeddings}`)
  console.log(`Total Tokens:        ${summary.totalTokens.toLocaleString()}`)
  console.log(`Total Cost:          $${summary.totalCost.toFixed(4)}`)
  console.log(`Total Time:          ${(summary.totalTime / 1000).toFixed(2)}s`)
  console.log()
  console.log('═'.repeat(60))
}

/**
 * Main function
 */
async function main() {
  const args = parseArgs()

  // Show help if requested
  if (process.argv.includes('--help')) {
    printBanner()
    printHelp()
    return
  }

  printBanner()

  // Select sources to process
  const sources = selectSources(args)

  console.log(`Selected ${sources.length} source(s) for processing:\n`)
  sources.forEach(source => {
    console.log(`  • ${source.name} (${source.type})`)
  })
  console.log()

  // Confirm with user
  console.log('Starting processing in 3 seconds... (Ctrl+C to cancel)')
  await new Promise(resolve => setTimeout(resolve, 3000))
  console.log()

  // Process sources
  const results = await processContentSources(sources, {
    onProgress: (progress) => {
      console.log(`  [${progress.stage}] ${progress.message}`)
    }
  })

  // Print results
  printResults(results)
  printSummary(results)

  // Exit with appropriate code
  const hasFailures = results.some(r => !r.success)
  process.exit(hasFailures ? 1 : 0)
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\nFatal Error:', error)
    process.exit(1)
  })
}
