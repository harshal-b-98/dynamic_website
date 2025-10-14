/**
 * Component Registry Query API
 *
 * Functions for querying and filtering components from the registry
 */

import { COMPONENT_REGISTRY } from '../component-registry'
import type { ComponentMetadata, ComponentQuery, ComponentQueryResult } from './schema'

/**
 * Query components with advanced filtering
 */
export function queryComponents(query: ComponentQuery): ComponentQueryResult {
  let results = Object.values(COMPONENT_REGISTRY)

  // Filter by category
  if (query.category) {
    results = results.filter(c => c.category === query.category)
  }

  // Filter by tags (any tag match)
  if (query.tags && query.tags.length > 0) {
    const queryTags = query.tags.map(t => t.toLowerCase())
    results = results.filter(c =>
      c.tags.some(tag => queryTags.includes(tag.toLowerCase()))
    )
  }

  // Filter by keywords (searches in tags and use cases)
  if (query.keywords && query.keywords.length > 0) {
    const keywords = query.keywords.map(k => k.toLowerCase())
    results = results.filter(c => {
      const searchableText = [
        ...c.tags,
        ...c.useCases,
        c.name,
        c.description
      ]
        .join(' ')
        .toLowerCase()

      return keywords.some(kw => searchableText.includes(kw))
    })
  }

  // Full-text search across all fields
  if (query.search) {
    const searchTerm = query.search.toLowerCase()
    results = results.filter(c => {
      const searchableText = [
        c.id,
        c.name,
        c.description,
        ...c.tags,
        ...c.useCases,
        c.category
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(searchTerm)
    })
  }

  // Filter by intent (matches against use cases)
  if (query.intent) {
    const intentLower = query.intent.toLowerCase()
    results = results.filter(c =>
      c.useCases.some(useCase =>
        useCase.toLowerCase().includes(intentLower)
      ) ||
      c.tags.some(tag => tag.toLowerCase().includes(intentLower)) ||
      c.description.toLowerCase().includes(intentLower)
    )
  }

  // Sort results
  const sortBy = query.sortBy || 'priority'
  const sortOrder = query.sortOrder || 'desc'

  results.sort((a, b) => {
    let compareA: any
    let compareB: any

    switch (sortBy) {
      case 'priority':
        compareA = (a as any).priority || 50
        compareB = (b as any).priority || 50
        break
      case 'name':
        compareA = a.name.toLowerCase()
        compareB = b.name.toLowerCase()
        break
      case 'category':
        compareA = a.category
        compareB = b.category
        break
      case 'id':
        compareA = a.id
        compareB = b.id
        break
      default:
        compareA = a.id
        compareB = b.id
    }

    if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1
    if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const total = results.length
  const offset = query.offset || 0
  const limit = query.limit || 25
  const paginatedResults = results.slice(offset, offset + limit)

  return {
    components: paginatedResults as ComponentMetadata[],
    total,
    limit,
    offset,
    hasMore: offset + limit < total
  }
}

/**
 * Get component by ID
 */
export function getComponentById(id: string): ComponentMetadata | null {
  const component = COMPONENT_REGISTRY[id]
  return component ? (component as ComponentMetadata) : null
}

/**
 * Get all components in a category
 */
export function getComponentsByCategory(category: string): ComponentMetadata[] {
  return Object.values(COMPONENT_REGISTRY)
    .filter(c => c.category === category)
    .map(c => c as ComponentMetadata)
}

/**
 * Search components by tags (fuzzy match)
 */
export function searchComponentsByTags(tags: string[]): ComponentMetadata[] {
  const tagSet = new Set(tags.map(t => t.toLowerCase()))

  return Object.values(COMPONENT_REGISTRY)
    .filter(component =>
      component.tags.some(tag => tagSet.has(tag.toLowerCase()))
    )
    .map(c => c as ComponentMetadata)
}

/**
 * Get components by intent (matches use cases)
 */
export function getComponentsByIntent(intent: string): ComponentMetadata[] {
  const intentLower = intent.toLowerCase()

  return Object.values(COMPONENT_REGISTRY)
    .filter(component =>
      component.useCases.some(useCase =>
        useCase.toLowerCase().includes(intentLower)
      )
    )
    .map(c => c as ComponentMetadata)
}

/**
 * Get all component IDs
 */
export function getAllComponentIds(): string[] {
  return Object.keys(COMPONENT_REGISTRY)
}

/**
 * Get component count
 */
export function getComponentCount(): number {
  return Object.keys(COMPONENT_REGISTRY).length
}

/**
 * Get component count by category
 */
export function getComponentCountsByCategory(): Record<string, number> {
  const counts: Record<string, number> = {}

  Object.values(COMPONENT_REGISTRY).forEach(component => {
    counts[component.category] = (counts[component.category] || 0) + 1
  })

  return counts
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  const categories = new Set<string>()

  Object.values(COMPONENT_REGISTRY).forEach(component => {
    categories.add(component.category)
  })

  return Array.from(categories).sort()
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const tags = new Set<string>()

  Object.values(COMPONENT_REGISTRY).forEach(component => {
    component.tags.forEach(tag => tags.add(tag))
  })

  return Array.from(tags).sort()
}

/**
 * Validate component exists
 */
export function componentExists(id: string): boolean {
  return id in COMPONENT_REGISTRY
}

/**
 * Get related components (by shared tags)
 */
export function getRelatedComponents(
  componentId: string,
  limit: number = 5
): ComponentMetadata[] {
  const component = getComponentById(componentId)
  if (!component) return []

  const componentTags = new Set(component.tags)

  // Find components with overlapping tags
  const related = Object.values(COMPONENT_REGISTRY)
    .filter(c => c.id !== componentId)
    .map(c => ({
      component: c as ComponentMetadata,
      sharedTags: c.tags.filter(tag => componentTags.has(tag)).length
    }))
    .filter(item => item.sharedTags > 0)
    .sort((a, b) => b.sharedTags - a.sharedTags)
    .slice(0, limit)
    .map(item => item.component)

  return related
}
