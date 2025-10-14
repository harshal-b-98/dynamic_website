/**
 * Component Registry Schemas
 *
 * Zod schemas for type-safe component metadata and props validation
 */

import { z } from 'zod'

/**
 * Component category enum
 */
export const ComponentCategorySchema = z.enum([
  'hero-headers',
  'content-information',
  'comparison-decision',
  'social-proof-trust',
  'interactive-engagement',
  'data-analytics',
  'technical-detailed',
  'navigation-guidance',
  'media-visual',
  'alerts-messaging'
])

export type ComponentCategory = z.infer<typeof ComponentCategorySchema>

/**
 * Component prop definition schema
 */
export const PropDefinitionSchema = z.object({
  type: z.string(), // e.g., 'string', 'number', 'boolean', 'array', 'object'
  required: z.boolean(),
  default: z.any().optional(),
  description: z.string()
})

export type PropDefinition = z.infer<typeof PropDefinitionSchema>

/**
 * Component example schema
 */
export const ComponentExampleSchema = z.object({
  scenario: z.string(),
  componentType: z.string(),
  props: z.record(z.string(), z.any())
})

export type ComponentExample = z.infer<typeof ComponentExampleSchema>

/**
 * Component registry entry schema
 */
export const ComponentMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: ComponentCategorySchema,
  description: z.string(),
  useCases: z.array(z.string()),
  tags: z.array(z.string()),
  props: z.record(z.string(), PropDefinitionSchema),
  examples: z.array(ComponentExampleSchema).optional(),

  // Additional metadata for advanced features
  version: z.string().optional().default('1.0.0'),
  deprecated: z.boolean().optional().default(false),
  dependencies: z.array(z.string()).optional(),
  priority: z.number().min(0).max(100).optional().default(50)
})

export type ComponentMetadata = z.infer<typeof ComponentMetadataSchema>

/**
 * Component query schema for API requests
 */
export const ComponentQuerySchema = z.object({
  intent: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  category: ComponentCategorySchema.optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(25),
  offset: z.number().min(0).optional().default(0),
  sortBy: z.enum(['priority', 'name', 'category', 'id']).optional().default('priority'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
})

export type ComponentQuery = z.infer<typeof ComponentQuerySchema>

/**
 * Component query result schema
 */
export const ComponentQueryResultSchema = z.object({
  components: z.array(ComponentMetadataSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  hasMore: z.boolean()
})

export type ComponentQueryResult = z.infer<typeof ComponentQueryResultSchema>

/**
 * Validate component metadata
 */
export function validateComponentMetadata(data: unknown): ComponentMetadata {
  return ComponentMetadataSchema.parse(data)
}

/**
 * Validate component query
 */
export function validateComponentQuery(data: unknown): ComponentQuery {
  return ComponentQuerySchema.parse(data)
}

/**
 * Safe validation with error handling
 */
export function safeValidateComponentMetadata(
  data: unknown
): { success: true; data: ComponentMetadata } | { success: false; error: string } {
  const result = ComponentMetadataSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    error: result.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
  }
}
