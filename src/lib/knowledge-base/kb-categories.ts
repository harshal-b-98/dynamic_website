/**
 * Knowledge Base Categories
 *
 * Defines the three specialized knowledge bases and their configurations
 */

import type { KBCategory, ContentType } from '../vector-db/types'

/**
 * Knowledge base category metadata
 */
export interface KBCategoryInfo {
  id: KBCategory
  name: string
  description: string
  contentTypes: ContentType[]
  defaultTopK: number
  icon: string
}

/**
 * Knowledge base categories with their configurations
 */
export const KB_CATEGORIES: Record<KBCategory, KBCategoryInfo> = {
  guidelines: {
    id: 'guidelines',
    name: 'UI/UX Guidelines',
    description: 'UI component usage, brand voice, design patterns, and layout recommendations',
    contentTypes: ['documentation', 'article'],
    defaultTopK: 3,
    icon: '📐'
  },
  personas: {
    id: 'personas',
    name: 'User Personas',
    description: 'User persona definitions, behavioral characteristics, and content preferences',
    contentTypes: ['documentation'],
    defaultTopK: 2,
    icon: '👤'
  },
  product: {
    id: 'product',
    name: 'Product Knowledge',
    description: 'ConsumerIQ features, capabilities, technical details, and FAQ content',
    contentTypes: ['product', 'faq', 'feature', 'documentation'],
    defaultTopK: 5,
    icon: '🎯'
  }
}

/**
 * Intent-based knowledge base weighting
 * Higher weight means more results retrieved from that KB
 */
export interface IntentKBWeighting {
  guidelines: 'low' | 'medium' | 'high'
  personas: 'low' | 'medium' | 'high'
  product: 'low' | 'medium' | 'high'
}

/**
 * Weight multipliers for each level
 */
const WEIGHT_MULTIPLIERS = {
  low: 0.5,
  medium: 1.0,
  high: 1.5
} as const

/**
 * Intent-to-KB weighting mappings
 */
export const INTENT_KB_WEIGHTS: Record<string, IntentKBWeighting> = {
  product_inquiry: {
    guidelines: 'low',
    personas: 'medium',
    product: 'high'
  },
  pricing_request: {
    guidelines: 'medium',
    personas: 'high',
    product: 'high'
  },
  feature_comparison: {
    guidelines: 'high',
    personas: 'medium',
    product: 'high'
  },
  general_conversation: {
    guidelines: 'low',
    personas: 'low',
    product: 'medium'
  },
  technical_question: {
    guidelines: 'medium',
    personas: 'low',
    product: 'high'
  },
  use_case_inquiry: {
    guidelines: 'medium',
    personas: 'high',
    product: 'high'
  },
  demo_request: {
    guidelines: 'high',
    personas: 'high',
    product: 'medium'
  },
  support_request: {
    guidelines: 'low',
    personas: 'low',
    product: 'high'
  }
}

/**
 * Get default KB weights when intent is unknown
 */
export const DEFAULT_KB_WEIGHTS: IntentKBWeighting = {
  guidelines: 'low',
  personas: 'medium',
  product: 'high'
}

/**
 * Get KB weighting for a specific intent
 */
export function getKBWeightsForIntent(intent: string): IntentKBWeighting {
  return INTENT_KB_WEIGHTS[intent] || DEFAULT_KB_WEIGHTS
}

/**
 * Calculate adjusted topK based on weight
 */
export function getAdjustedTopK(baseTopK: number, weight: 'low' | 'medium' | 'high'): number {
  const multiplier = WEIGHT_MULTIPLIERS[weight]
  return Math.ceil(baseTopK * multiplier)
}

/**
 * Get all KB categories
 */
export function getAllKBCategories(): KBCategory[] {
  return Object.keys(KB_CATEGORIES) as KBCategory[]
}

/**
 * Get KB category information
 */
export function getKBCategoryInfo(category: KBCategory): KBCategoryInfo {
  return KB_CATEGORIES[category]
}

/**
 * Check if a content type belongs to a KB category
 */
export function isContentTypeInKB(contentType: ContentType, kbCategory: KBCategory): boolean {
  return KB_CATEGORIES[kbCategory].contentTypes.includes(contentType)
}
