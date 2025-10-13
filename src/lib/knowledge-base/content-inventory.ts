/**
 * Content Inventory for Knowledge Base
 *
 * Defines all content sources for initial population
 */

import path from 'path'

export type ContentType =
  | 'faq'
  | 'documentation'
  | 'features'
  | 'brand-guidelines'
  | 'website'
  | 'product'

export interface ContentSource {
  id: string
  name: string
  type: ContentType
  filePath?: string
  url?: string
  priority: 'high' | 'medium' | 'low'
  description: string
  lastUpdated: string
}

/**
 * Initial content sources from KB folder
 */
export const INITIAL_CONTENT_SOURCES: ContentSource[] = [
  {
    id: 'ciq-faq',
    name: 'Consumer IQ FAQ',
    type: 'faq',
    filePath: path.join(process.cwd(), 'KB', 'CIQ - FAQ.pdf'),
    priority: 'high',
    description: 'Frequently asked questions about Consumer IQ platform',
    lastUpdated: '2025-10-06'
  },
  {
    id: 'ciq-website',
    name: 'Consumer IQ Website Content',
    type: 'website',
    filePath: path.join(process.cwd(), 'KB', 'CIQ - Website Document.pdf'),
    priority: 'high',
    description: 'Main website content, messaging, and value propositions',
    lastUpdated: '2025-10-06'
  },
  {
    id: 'ciq-brand',
    name: 'Consumer IQ Brand Guidelines',
    type: 'brand-guidelines',
    filePath: path.join(process.cwd(), 'KB', 'CIQ Brand Guidelines - Final.pdf'),
    priority: 'medium',
    description: 'Brand voice, colors, logos, and design guidelines',
    lastUpdated: '2025-10-06'
  },
  {
    id: 'ciq-features',
    name: 'Consumer IQ Features',
    type: 'features',
    filePath: path.join(process.cwd(), 'KB', 'CIQ Features.docx'),
    priority: 'high',
    description: 'Detailed product features and capabilities',
    lastUpdated: '2025-09-29'
  }
]

/**
 * Get content source by ID
 */
export function getContentSource(id: string): ContentSource | undefined {
  return INITIAL_CONTENT_SOURCES.find(source => source.id === id)
}

/**
 * Get content sources by type
 */
export function getContentSourcesByType(type: ContentType): ContentSource[] {
  return INITIAL_CONTENT_SOURCES.filter(source => source.type === type)
}

/**
 * Get high priority content sources
 */
export function getHighPriorityContent(): ContentSource[] {
  return INITIAL_CONTENT_SOURCES.filter(source => source.priority === 'high')
}

/**
 * Content type to vector DB content type mapping
 */
export function mapToVectorContentType(contentType: ContentType): string {
  const mapping: Record<ContentType, string> = {
    'faq': 'faq',
    'documentation': 'documentation',
    'features': 'product',
    'brand-guidelines': 'documentation',
    'website': 'page',
    'product': 'product'
  }
  return mapping[contentType] || 'documentation'
}
