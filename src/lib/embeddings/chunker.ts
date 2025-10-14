/**
 * Content Chunking System
 *
 * Splits content into optimally-sized chunks for embedding generation
 * with configurable overlap to maintain context continuity.
 */

export interface ContentChunk {
  text: string
  metadata: {
    contentId: string
    contentType: string
    chunkIndex: number
    totalChunks: number
    sourceUrl?: string
    title?: string
    characterStart?: number
    characterEnd?: number
  }
}

export interface ChunkerOptions {
  chunkSize?: number          // Target chunk size in characters (default: 1000)
  chunkOverlap?: number        // Overlap between chunks (default: 200)
  separators?: string[]        // Separators for splitting (default: smart separators)
  minChunkSize?: number        // Minimum chunk size (default: 100)
  preserveCodeBlocks?: boolean // Keep code blocks intact (default: true)
}

const DEFAULT_SEPARATORS = [
  '\n\n\n',  // Multiple newlines (major sections)
  '\n\n',    // Double newline (paragraphs)
  '\n',      // Single newline
  '. ',      // Sentence end
  '! ',      // Exclamation
  '? ',      // Question
  '; ',      // Semicolon
  ', ',      // Comma
  ' ',       // Space
  ''         // Character-level split (fallback)
]

/**
 * Chunk content into optimal sizes for embedding generation
 */
export async function chunkContent(
  content: string,
  metadata: Partial<ContentChunk['metadata']>,
  options: ChunkerOptions = {}
): Promise<ContentChunk[]> {
  const {
    chunkSize = 1000,
    chunkOverlap = 200,
    separators = DEFAULT_SEPARATORS,
    minChunkSize = 100,
    preserveCodeBlocks = true
  } = options

  // Handle code blocks if needed
  let processedContent = content
  let codeBlocks: { placeholder: string; content: string; start: number }[] = []

  if (preserveCodeBlocks) {
    const result = extractCodeBlocks(content)
    processedContent = result.content
    codeBlocks = result.blocks
  }

  // Split content using recursive character splitting
  const chunks = await recursiveSplit(
    processedContent,
    chunkSize,
    chunkOverlap,
    separators,
    minChunkSize
  )

  // Restore code blocks
  const restoredChunks = codeBlocks.length > 0
    ? restoreCodeBlocks(chunks, codeBlocks)
    : chunks

  // Create chunk objects with metadata
  return restoredChunks.map((text, index) => ({
    text: text.trim(),
    metadata: {
      contentId: metadata.contentId || 'unknown',
      contentType: metadata.contentType || 'text',
      chunkIndex: index,
      totalChunks: restoredChunks.length,
      sourceUrl: metadata.sourceUrl,
      title: metadata.title,
      characterStart: calculateCharStart(restoredChunks, index),
      characterEnd: calculateCharEnd(restoredChunks, index)
    }
  }))
}

/**
 * Recursive character-level text splitting
 */
async function recursiveSplit(
  text: string,
  chunkSize: number,
  chunkOverlap: number,
  separators: string[],
  minChunkSize: number,
  currentSeparatorIndex = 0
): Promise<string[]> {
  if (text.length <= chunkSize) {
    return [text]
  }

  if (currentSeparatorIndex >= separators.length) {
    // Fallback: force split at chunk size
    return forceSplit(text, chunkSize, chunkOverlap)
  }

  const separator = separators[currentSeparatorIndex]
  const splits = text.split(separator)

  const chunks: string[] = []
  let currentChunk = ''

  for (let i = 0; i < splits.length; i++) {
    const split = splits[i] + (i < splits.length - 1 ? separator : '')

    if (!currentChunk) {
      currentChunk = split
      continue
    }

    if ((currentChunk + split).length <= chunkSize) {
      currentChunk += split
    } else {
      // Current chunk is full
      if (currentChunk.length >= minChunkSize) {
        chunks.push(currentChunk)

        // Add overlap from previous chunk
        const overlapText = getLastNCharacters(currentChunk, chunkOverlap)
        currentChunk = overlapText + split
      } else {
        // Chunk too small, try next separator
        const subChunks = await recursiveSplit(
          currentChunk + split,
          chunkSize,
          chunkOverlap,
          separators,
          minChunkSize,
          currentSeparatorIndex + 1
        )
        chunks.push(...subChunks.slice(0, -1))
        currentChunk = subChunks[subChunks.length - 1] || ''
      }
    }
  }

  if (currentChunk && currentChunk.length >= minChunkSize) {
    chunks.push(currentChunk)
  }

  return chunks
}

/**
 * Force split text at exact character boundaries (fallback)
 */
function forceSplit(text: string, chunkSize: number, chunkOverlap: number): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    start = end - chunkOverlap
  }

  return chunks
}

/**
 * Extract code blocks to preserve them during chunking
 */
function extractCodeBlocks(content: string): {
  content: string
  blocks: { placeholder: string; content: string; start: number }[]
} {
  const codeBlockRegex = /```[\s\S]*?```|`[^`]+`/g
  const blocks: { placeholder: string; content: string; start: number }[] = []
  let match: RegExpExecArray | null
  let processedContent = content

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const placeholder = `__CODE_BLOCK_${blocks.length}__`
    blocks.push({
      placeholder,
      content: match[0],
      start: match.index
    })
  }

  // Replace code blocks with placeholders
  blocks.forEach(block => {
    processedContent = processedContent.replace(block.content, block.placeholder)
  })

  return { content: processedContent, blocks }
}

/**
 * Restore code blocks after chunking
 */
function restoreCodeBlocks(
  chunks: string[],
  blocks: { placeholder: string; content: string }[]
): string[] {
  return chunks.map(chunk => {
    let restoredChunk = chunk
    blocks.forEach(block => {
      restoredChunk = restoredChunk.replace(block.placeholder, block.content)
    })
    return restoredChunk
  })
}

/**
 * Get last N characters from text
 */
function getLastNCharacters(text: string, n: number): string {
  return text.slice(-n)
}

/**
 * Calculate character start position for chunk
 */
function calculateCharStart(chunks: string[], index: number): number {
  return chunks.slice(0, index).reduce((sum, chunk) => sum + chunk.length, 0)
}

/**
 * Calculate character end position for chunk
 */
function calculateCharEnd(chunks: string[], index: number): number {
  return chunks.slice(0, index + 1).reduce((sum, chunk) => sum + chunk.length, 0)
}

/**
 * Estimate token count from character count (rough approximation)
 * Useful for staying within embedding model token limits
 */
export function estimateTokenCount(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4)
}

/**
 * Validate chunk fits within token limits
 */
export function validateChunkSize(chunk: ContentChunk, maxTokens = 8191): boolean {
  const estimatedTokens = estimateTokenCount(chunk.text)
  return estimatedTokens <= maxTokens
}
