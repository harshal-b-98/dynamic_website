/**
 * Page Specification Validation
 *
 * Validates generated page specifications for correctness and completeness
 */

import {
  PageSpecification,
  ComponentSpec,
  PageType,
  LayoutType,
  ComponentSize,
  ComponentTheme
} from './page-generation'
import { validateComponent } from './component-registry'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate a complete page specification
 */
export function validatePageSpecification(pageSpec: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required top-level fields
  if (!pageSpec) {
    errors.push('Page specification is null or undefined')
    return { valid: false, errors, warnings }
  }

  if (!pageSpec.type) {
    errors.push('Missing required field: type')
  } else if (!isValidPageType(pageSpec.type)) {
    errors.push(`Invalid page type: ${pageSpec.type}`)
  }

  if (!pageSpec.metadata) {
    errors.push('Missing required field: metadata')
  } else {
    const metadataErrors = validateMetadata(pageSpec.metadata)
    errors.push(...metadataErrors)
  }

  if (!pageSpec.layout) {
    errors.push('Missing required field: layout')
  } else {
    const layoutErrors = validateLayout(pageSpec.layout)
    errors.push(...layoutErrors)
  }

  // Validate components
  if (pageSpec.layout?.components) {
    const componentCount = pageSpec.layout.components.length

    if (componentCount === 0) {
      errors.push('Layout must contain at least one component')
    }

    if (componentCount > 15) {
      warnings.push(`Large number of components (${componentCount}). Consider simplifying the page.`)
    }

    pageSpec.layout.components.forEach((component: any, index: number) => {
      const componentErrors = validateComponentSpec(component, index)
      errors.push(...componentErrors)
    })
  }

  // Validate navigation (optional)
  if (pageSpec.navigation) {
    const navWarnings = validateNavigation(pageSpec.navigation)
    warnings.push(...navWarnings)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate page metadata
 */
function validateMetadata(metadata: any): string[] {
  const errors: string[] = []

  if (!metadata.title || typeof metadata.title !== 'string') {
    errors.push('Metadata: title is required and must be a string')
  } else if (metadata.title.length > 100) {
    errors.push('Metadata: title is too long (max 100 characters)')
  }

  if (!metadata.description || typeof metadata.description !== 'string') {
    errors.push('Metadata: description is required and must be a string')
  } else if (metadata.description.length > 200) {
    errors.push('Metadata: description is too long (max 200 characters)')
  }

  if (!Array.isArray(metadata.keywords)) {
    errors.push('Metadata: keywords must be an array')
  } else if (metadata.keywords.length === 0) {
    errors.push('Metadata: keywords array is empty')
  }

  if (!metadata.generatedFor || typeof metadata.generatedFor !== 'string') {
    errors.push('Metadata: generatedFor is required and must be a string')
  }

  return errors
}

/**
 * Validate page layout
 */
function validateLayout(layout: any): string[] {
  const errors: string[] = []

  if (!layout.type || !isValidLayoutType(layout.type)) {
    errors.push(`Layout: invalid type "${layout.type}"`)
  }

  if (!Array.isArray(layout.components)) {
    errors.push('Layout: components must be an array')
  }

  return errors
}

/**
 * Validate individual component specification
 */
function validateComponentSpec(component: any, index: number): string[] {
  const errors: string[] = []
  const prefix = `Component[${index}]`

  if (!component.id || typeof component.id !== 'string') {
    errors.push(`${prefix}: id is required and must be a string`)
  }

  if (!component.componentType || typeof component.componentType !== 'string') {
    errors.push(`${prefix}: componentType is required and must be a string`)
  } else if (!validateComponent(component.componentType)) {
    errors.push(`${prefix}: componentType "${component.componentType}" not found in registry`)
  }

  if (typeof component.order !== 'number') {
    errors.push(`${prefix}: order must be a number`)
  } else if (component.order < 0) {
    errors.push(`${prefix}: order must be non-negative`)
  }

  if (!component.props || typeof component.props !== 'object') {
    errors.push(`${prefix}: props is required and must be an object`)
  }

  // Validate styling if present
  if (component.styling) {
    if (component.styling.size && !isValidComponentSize(component.styling.size)) {
      errors.push(`${prefix}: invalid size "${component.styling.size}"`)
    }
    if (component.styling.theme && !isValidComponentTheme(component.styling.theme)) {
      errors.push(`${prefix}: invalid theme "${component.styling.theme}"`)
    }
  }

  return errors
}

/**
 * Validate navigation (returns warnings, not errors)
 */
function validateNavigation(navigation: any): string[] {
  const warnings: string[] = []

  // Validate relatedQueries is array of strings
  if (navigation.relatedQueries) {
    if (!Array.isArray(navigation.relatedQueries)) {
      warnings.push('Navigation: relatedQueries must be an array')
    } else if (navigation.relatedQueries.length > 5) {
      warnings.push('Navigation: More than 5 related queries may overwhelm users')
    } else if (navigation.relatedQueries.some((q: any) => typeof q !== 'string')) {
      warnings.push('Navigation: relatedQueries must be an array of strings, found objects')
    }
  }

  // Validate nextSteps is array of strings
  if (navigation.nextSteps) {
    if (!Array.isArray(navigation.nextSteps)) {
      warnings.push('Navigation: nextSteps must be an array')
    } else if (navigation.nextSteps.length > 5) {
      warnings.push('Navigation: More than 5 next steps may be too many')
    } else if (navigation.nextSteps.some((s: any) => typeof s !== 'string')) {
      warnings.push('Navigation: nextSteps must be an array of strings, found objects')
    }
  }

  return warnings
}

/**
 * Type guards
 */
function isValidPageType(type: string): type is PageType {
  return ['landing', 'feature', 'comparison', 'dashboard', 'custom'].includes(type)
}

function isValidLayoutType(type: string): type is LayoutType {
  return ['single-column', 'two-column', 'grid', 'custom'].includes(type)
}

function isValidComponentSize(size: string): size is ComponentSize {
  return ['sm', 'md', 'lg', 'xl'].includes(size)
}

function isValidComponentTheme(theme: string): theme is ComponentTheme {
  return ['light', 'dark', 'brand'].includes(theme)
}

/**
 * Validate component order sequence
 */
export function validateComponentOrdering(components: ComponentSpec[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for duplicate orders
  const orders = components.map(c => c.order)
  const orderSet = new Set(orders)

  if (orders.length !== orderSet.size) {
    errors.push('Components have duplicate order values')
  }

  // Check for gaps in ordering
  const sortedOrders = [...orderSet].sort((a, b) => a - b)
  for (let i = 0; i < sortedOrders.length - 1; i++) {
    if (sortedOrders[i + 1] - sortedOrders[i] > 1) {
      warnings.push(`Gap in component ordering between ${sortedOrders[i]} and ${sortedOrders[i + 1]}`)
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * Recursively sanitize any value - convert {text, link} objects to just text strings
 */
function sanitizeValue(value: any): any {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return value
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item))
  }

  // Handle objects
  if (typeof value === 'object') {
    // Special case: {text, link} objects should become just text
    if (value.text && typeof value.text === 'string') {
      return value.text
    }

    // Recursively sanitize object properties
    const sanitized: any = {}
    Object.keys(value).forEach(key => {
      sanitized[key] = sanitizeValue(value[key])
    })
    return sanitized
  }

  // Handle strings - remove script tags
  if (typeof value === 'string') {
    return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  }

  // Return primitives as-is
  return value
}

/**
 * Sanitize page specification (remove potentially harmful content)
 */
export function sanitizePageSpecification(pageSpec: PageSpecification): PageSpecification {
  // Deep clone to avoid mutations
  const sanitized = JSON.parse(JSON.stringify(pageSpec))

  // Sanitize component props and content with recursive sanitization
  sanitized.layout.components = sanitized.layout.components.map((component: ComponentSpec) => {
    // Recursively sanitize props
    component.props = sanitizeValue(component.props)

    // Recursively sanitize content
    component.content = sanitizeValue(component.content)

    return component
  })

  // Sanitize navigation - convert objects to strings if needed
  if (sanitized.navigation) {
    // Fix relatedQueries if they're objects
    if (Array.isArray(sanitized.navigation.relatedQueries)) {
      sanitized.navigation.relatedQueries = sanitized.navigation.relatedQueries.map((query: any) => {
        if (typeof query === 'object' && query.text) {
          return query.text // Extract text property
        }
        return typeof query === 'string' ? query : String(query)
      })
    }

    // Fix nextSteps if they're objects
    if (Array.isArray(sanitized.navigation.nextSteps)) {
      sanitized.navigation.nextSteps = sanitized.navigation.nextSteps.map((step: any) => {
        if (typeof step === 'object' && step.text) {
          return step.text // Extract text property
        }
        return typeof step === 'string' ? step : String(step)
      })
    }

    // Fix breadcrumbs if needed
    if (Array.isArray(sanitized.navigation.breadcrumbs)) {
      sanitized.navigation.breadcrumbs = sanitized.navigation.breadcrumbs.map((crumb: any) => {
        if (typeof crumb === 'object') {
          return {
            label: String(crumb.label || ''),
            href: String(crumb.href || '#')
          }
        }
        return crumb
      })
    }
  }

  return sanitized
}
