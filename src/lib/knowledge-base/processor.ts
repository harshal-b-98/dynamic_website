/**
 * Knowledge Base Content Processor
 *
 * Processes parsed documents and loads them into vector database
 */

import { parseDocument, cleanText, type ParsedDocument } from './parsers'
import { processContent, type PipelineResult } from '../embeddings'
import { type ContentSource, mapToVectorContentType } from './content-inventory'

export interface ProcessingOptions {
  chunkSize?: number
  chunkOverlap?: number
  onProgress?: (progress: ProcessingProgress) => void
}

export interface ProcessingProgress {
  source: string
  stage: 'parsing' | 'chunking' | 'embedding' | 'storing' | 'complete'
  message: string
}

export interface ProcessingResult {
  sourceId: string
  sourceName: string
  success: boolean
  chunksCreated: number
  embeddingsStored: number
  tokensUsed: number
  cost: number
  processingTime: number
  error?: string
}

/**
 * Process a single content source
 */
export async function processContentSource(
  source: ContentSource,
  options: ProcessingOptions = {}
): Promise<ProcessingResult> {
  const startTime = Date.now()

  try {
    // 1. Parse document
    options.onProgress?.({
      source: source.name,
      stage: 'parsing',
      message: `Parsing ${source.name}...`
    })

    if (!source.filePath) {
      throw new Error('No file path provided for content source')
    }

    const parsed = await parseDocument(source.filePath)
    const cleanedContent = cleanText(parsed.content)

    options.onProgress?.({
      source: source.name,
      stage: 'chunking',
      message: 'Chunking content...'
    })

    // 2. Process through embedding pipeline
    const vectorContentType = mapToVectorContentType(source.type) as any

    const result: PipelineResult = await processContent(
      {
        contentId: source.id,
        contentType: vectorContentType,
        content: cleanedContent,
        title: source.name,
        metadata: {
          sourceType: source.type,
          fileName: parsed.fileName,
          fileType: parsed.fileType,
          priority: source.priority,
          description: source.description,
          lastUpdated: source.lastUpdated,
          pageCount: parsed.pageCount
        }
      },
      {
        chunkSize: options.chunkSize || 1000,
        chunkOverlap: options.chunkOverlap || 200,
        deduplicateExisting: true,
        onProgress: (progress) => {
          const stageMap = {
            'chunking': 'chunking',
            'embedding': 'embedding',
            'storing': 'storing',
            'complete': 'complete'
          } as const

          options.onProgress?.({
            source: source.name,
            stage: stageMap[progress.stage] || 'embedding',
            message: progress.message
          })
        }
      }
    )

    const processingTime = Date.now() - startTime

    return {
      sourceId: source.id,
      sourceName: source.name,
      success: true,
      chunksCreated: result.chunksCreated,
      embeddingsStored: result.embeddingsStored,
      tokensUsed: result.tokensUsed,
      cost: result.cost,
      processingTime
    }
  } catch (error) {
    return {
      sourceId: source.id,
      sourceName: source.name,
      success: false,
      chunksCreated: 0,
      embeddingsStored: 0,
      tokensUsed: 0,
      cost: 0,
      processingTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Process multiple content sources
 */
export async function processContentSources(
  sources: ContentSource[],
  options: ProcessingOptions = {}
): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = []

  for (const source of sources) {
    console.log(`\nProcessing: ${source.name}`)
    console.log(`Type: ${source.type} | Priority: ${source.priority}`)

    const result = await processContentSource(source, options)
    results.push(result)

    if (result.success) {
      console.log(`✓ Success: ${result.embeddingsStored} embeddings created`)
      console.log(`  Tokens: ${result.tokensUsed} | Cost: $${result.cost.toFixed(4)}`)
    } else {
      console.error(`✗ Failed: ${result.error}`)
    }

    // Small delay between sources
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return results
}

/**
 * Generate processing summary
 */
export function generateSummary(results: ProcessingResult[]): {
  totalSources: number
  successfulSources: number
  failedSources: number
  totalChunks: number
  totalEmbeddings: number
  totalTokens: number
  totalCost: number
  totalTime: number
} {
  return {
    totalSources: results.length,
    successfulSources: results.filter(r => r.success).length,
    failedSources: results.filter(r => !r.success).length,
    totalChunks: results.reduce((sum, r) => sum + r.chunksCreated, 0),
    totalEmbeddings: results.reduce((sum, r) => sum + r.embeddingsStored, 0),
    totalTokens: results.reduce((sum, r) => sum + r.tokensUsed, 0),
    totalCost: results.reduce((sum, r) => sum + r.cost, 0),
    totalTime: results.reduce((sum, r) => sum + r.processingTime, 0)
  }
}
