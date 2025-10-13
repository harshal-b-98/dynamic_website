/**
 * Document Parsers for Knowledge Base
 *
 * Extracts text content from PDF and DOCX files
 */

import fs from 'fs'
import path from 'path'
import mammoth from 'mammoth'

// pdf-parse v1.x is a simple CommonJS module
const pdfParse = require('pdf-parse')

export interface ParsedDocument {
  content: string
  title: string
  fileName: string
  fileType: 'pdf' | 'docx'
  pageCount?: number
  metadata?: Record<string, any>
}

/**
 * Parse PDF file and extract text
 */
export async function parsePDF(filePath: string): Promise<ParsedDocument> {
  const dataBuffer = fs.readFileSync(filePath)
  const data = await pdfParse(dataBuffer)

  const fileName = path.basename(filePath)
  const title = fileName.replace('.pdf', '').replace(/[-_]/g, ' ')

  return {
    content: data.text,
    title,
    fileName,
    fileType: 'pdf',
    pageCount: data.numpages,
    metadata: {
      info: data.info,
      pages: data.numpages
    }
  }
}

/**
 * Parse DOCX file and extract text
 */
export async function parseDOCX(filePath: string): Promise<ParsedDocument> {
  const dataBuffer = fs.readFileSync(filePath)
  const result = await mammoth.extractRawText({ buffer: dataBuffer })

  const fileName = path.basename(filePath)
  const title = fileName.replace('.docx', '').replace(/[-_]/g, ' ')

  return {
    content: result.value,
    title,
    fileName,
    fileType: 'docx',
    metadata: {
      messages: result.messages
    }
  }
}

/**
 * Auto-detect file type and parse
 */
export async function parseDocument(filePath: string): Promise<ParsedDocument> {
  const ext = path.extname(filePath).toLowerCase()

  switch (ext) {
    case '.pdf':
      return parsePDF(filePath)
    case '.docx':
      return parseDOCX(filePath)
    default:
      throw new Error(`Unsupported file type: ${ext}`)
  }
}

/**
 * Parse all documents in a directory
 */
export async function parseDirectory(dirPath: string): Promise<ParsedDocument[]> {
  const files = fs.readdirSync(dirPath)
  const supportedExts = ['.pdf', '.docx']

  const documents: ParsedDocument[] = []

  for (const file of files) {
    const ext = path.extname(file).toLowerCase()
    if (!supportedExts.includes(ext)) {
      continue
    }

    const filePath = path.join(dirPath, file)
    try {
      const parsed = await parseDocument(filePath)
      documents.push(parsed)
      console.log(`✓ Parsed: ${file}`)
    } catch (error) {
      console.error(`✗ Failed to parse ${file}:`, error)
    }
  }

  return documents
}

/**
 * Clean and normalize extracted text
 */
export function cleanText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove page numbers and headers/footers (common patterns)
    .replace(/Page \d+ of \d+/gi, '')
    // Remove form feed characters
    .replace(/\f/g, '\n\n')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    // Remove multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim
    .trim()
}
