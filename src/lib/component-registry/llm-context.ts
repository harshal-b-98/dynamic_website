/**
 * LLM Context Builder for Component Selection
 *
 * Generates structured component information for LLM page generation
 */

import type { ComponentMetadata, PropDefinition } from './schema'
import { queryComponents, getComponentById, getAllCategories } from './query'

export interface LLMContextOptions {
  intent?: string
  maxComponents?: number
  includeExamples?: boolean
  includeProps?: boolean
  format?: 'markdown' | 'json'
  categoryLimit?: number
}

/**
 * Build component context for LLM prompt
 */
export function buildComponentContext(options: LLMContextOptions = {}): string {
  const {
    intent,
    maxComponents = 15,
    includeExamples = true,
    includeProps = true,
    format = 'markdown',
    categoryLimit = 3
  } = options

  // Query relevant components
  const queryResult = queryComponents({
    intent,
    limit: maxComponents,
    offset: 0,
    sortBy: 'priority',
    sortOrder: 'desc'
  })

  if (format === 'json') {
    return JSON.stringify(
      {
        components: queryResult.components.map(c => formatComponentForJSON(c, includeProps, includeExamples)),
        total: queryResult.total,
        categories: getAllCategories()
      },
      null,
      2
    )
  }

  // Markdown format
  let context = '# Available Components\n\n'

  // Group by category
  const componentsByCategory = groupByCategory(queryResult.components)

  for (const [category, components] of Object.entries(componentsByCategory)) {
    if (components.length === 0) continue

    const displayComponents = components.slice(0, categoryLimit)

    context += `## ${formatCategoryName(category)}\n\n`

    for (const component of displayComponents) {
      context += formatComponentMarkdown(component, includeProps, includeExamples)
      context += '\n---\n\n'
    }
  }

  return context
}

/**
 * Build context for specific component
 */
export function buildComponentDetailContext(componentId: string): string {
  const component = getComponentById(componentId)

  if (!component) {
    return `Component "${componentId}" not found in registry.`
  }

  return formatComponentMarkdown(component, true, true)
}

/**
 * Build minimal context for LLM (component IDs and names only)
 */
export function buildMinimalComponentContext(intent?: string): string {
  const queryResult = queryComponents({
    intent,
    limit: 30,
    offset: 0,
    sortBy: 'priority',
    sortOrder: 'desc'
  })

  let context = 'Available components:\n\n'

  for (const component of queryResult.components) {
    context += `- **${component.id}**: ${component.name} - ${component.description}\n`
  }

  return context
}

/**
 * Format component for markdown output
 */
function formatComponentMarkdown(
  component: ComponentMetadata,
  includeProps: boolean,
  includeExamples: boolean
): string {
  let md = `### ${component.name} (\`${component.id}\`)\n\n`
  md += `**Category**: ${formatCategoryName(component.category)}\n\n`
  md += `**Description**: ${component.description}\n\n`

  // Use cases
  if (component.useCases && component.useCases.length > 0) {
    md += `**Use Cases**:\n`
    for (const useCase of component.useCases) {
      md += `- ${useCase}\n`
    }
    md += '\n'
  }

  // Tags
  if (component.tags && component.tags.length > 0) {
    md += `**Tags**: ${component.tags.join(', ')}\n\n`
  }

  // Props
  if (includeProps && component.props) {
    md += `**Props**:\n`
    for (const [propName, propDef] of Object.entries(component.props)) {
      const def = propDef as PropDefinition
      const required = def.required ? ' *(required)*' : ' *(optional)*'
      const defaultVal = def.default !== undefined ? ` [default: ${def.default}]` : ''
      md += `- \`${propName}\` (${def.type})${required}${defaultVal}: ${def.description}\n`
    }
    md += '\n'
  }

  // Examples
  if (includeExamples && component.examples && component.examples.length > 0) {
    md += `**Example Usage**:\n\n`
    const example = component.examples[0]
    md += `*Scenario*: ${example.scenario}\n\n`
    md += '```json\n'
    md += JSON.stringify(example.props, null, 2)
    md += '\n```\n\n'
  }

  return md
}

/**
 * Format component for JSON output
 */
function formatComponentForJSON(
  component: ComponentMetadata,
  includeProps: boolean,
  includeExamples: boolean
): any {
  const formatted: any = {
    id: component.id,
    name: component.name,
    category: component.category,
    description: component.description,
    useCases: component.useCases,
    tags: component.tags
  }

  if (includeProps && component.props) {
    formatted.props = component.props
  }

  if (includeExamples && component.examples) {
    formatted.examples = component.examples
  }

  return formatted
}

/**
 * Group components by category
 */
function groupByCategory(components: ComponentMetadata[]): Record<string, ComponentMetadata[]> {
  const grouped: Record<string, ComponentMetadata[]> = {}

  for (const component of components) {
    if (!grouped[component.category]) {
      grouped[component.category] = []
    }
    grouped[component.category].push(component)
  }

  return grouped
}

/**
 * Format category name (convert kebab-case to Title Case)
 */
function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Build intent-optimized context
 * Prioritizes components most relevant to the user's intent
 */
export function buildIntentOptimizedContext(intent: string, maxComponents: number = 10): string {
  const queryResult = queryComponents({
    intent,
    limit: maxComponents * 2, // Query more to ensure we have good matches
    offset: 0,
    sortBy: 'priority',
    sortOrder: 'desc'
  })

  // Score each component by relevance
  const scored = queryResult.components.map(component => {
    let score = (component as any).priority || 50

    // Boost if intent matches use cases
    const intentLower = intent.toLowerCase()
    const matchesUseCase = component.useCases.some(uc =>
      uc.toLowerCase().includes(intentLower)
    )
    if (matchesUseCase) score += 30

    // Boost if intent matches tags
    const matchesTag = component.tags.some(tag =>
      tag.toLowerCase().includes(intentLower)
    )
    if (matchesTag) score += 20

    // Boost if intent matches description
    if (component.description.toLowerCase().includes(intentLower)) {
      score += 15
    }

    return { component, score }
  })

  // Sort by score and take top N
  const topComponents = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxComponents)
    .map(item => item.component)

  // Build markdown context
  let context = `# Components for Intent: "${intent}"\n\n`
  context += `${topComponents.length} most relevant components:\n\n`

  for (const component of topComponents) {
    context += formatComponentMarkdown(component, true, true)
    context += '\n---\n\n'
  }

  return context
}
