/**
 * Component Registry Module
 *
 * Central exports for component registry functionality
 */

// Schemas and types
export {
  ComponentMetadataSchema,
  ComponentQuerySchema,
  ComponentQueryResultSchema,
  ComponentCategorySchema,
  PropDefinitionSchema,
  ComponentExampleSchema,
  validateComponentMetadata,
  validateComponentQuery,
  safeValidateComponentMetadata,
  type ComponentMetadata,
  type ComponentQuery,
  type ComponentQueryResult,
  type ComponentCategory,
  type PropDefinition,
  type ComponentExample
} from './schema'

// Query functions
export {
  queryComponents,
  getComponentById,
  getComponentsByCategory,
  searchComponentsByTags,
  getComponentsByIntent,
  getAllComponentIds,
  getComponentCount,
  getComponentCountsByCategory,
  getAllCategories,
  getAllTags,
  componentExists,
  getRelatedComponents
} from './query'

// LLM context building
export {
  buildComponentContext,
  buildComponentDetailContext,
  buildMinimalComponentContext,
  buildIntentOptimizedContext,
  type LLMContextOptions
} from './llm-context'
