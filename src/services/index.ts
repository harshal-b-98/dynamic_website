/**
 * Service Layer Index
 *
 * Central export for all application services
 */

export * from './types'
export * from './IntentClassificationService'
export * from './PageGenerationService'

// Re-export ContextManager as ContextService for consistency
export { ContextManager as ContextService } from '@/lib/context-manager'
