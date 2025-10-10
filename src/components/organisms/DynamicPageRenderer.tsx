'use client'

/**
 * Dynamic Page Renderer
 *
 * Renders dynamically generated pages from PageSpecification JSON
 * with error handling, loading states, and animations
 */

import { Suspense } from 'react'
import { PageSpecification, ComponentSpec } from '@/lib/page-generation'
import {
  getComponent,
  ComponentLoadingSkeleton,
  ComponentLoadError,
  DynamicComponentProps
} from '@/lib/component-loader'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { InteractionHandlerProps } from '@/lib/interaction-types'

export interface DynamicPageRendererProps {
  pageSpec: PageSpecification
  className?: string
  onInteraction?: (props: InteractionHandlerProps) => void | Promise<void>
  onComponentError?: (componentType: string, error: Error) => void
}

/**
 * Main page renderer component
 */
export function DynamicPageRenderer({
  pageSpec,
  className = '',
  onInteraction,
  onComponentError
}: DynamicPageRendererProps) {
  const { layout, navigation, metadata } = pageSpec

  // Sort components by order
  const sortedComponents = [...layout.components].sort((a, b) => a.order - b.order)

  // Get layout class based on type
  const layoutClass = getLayoutClass(layout.type, layout.spacing)

  return (
    <div className={`dynamic-page-container ${className}`}>
      {/* Page Metadata (for SEO) */}
      <PageMetadata metadata={metadata} />

      {/* Breadcrumbs */}
      {navigation?.breadcrumbs && navigation.breadcrumbs.length > 0 && (
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            {navigation.breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-gray-400">/</span>}
                <a
                  href={crumb.href}
                  className="hover:text-blue-600 transition-colors"
                >
                  {crumb.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Main Layout */}
      <div className={layoutClass}>
        {sortedComponents.map((componentSpec, index) => (
          <DynamicComponent
            key={componentSpec.id}
            spec={componentSpec}
            index={index}
            totalComponents={sortedComponents.length}
            pageSpec={pageSpec}
            onInteraction={onInteraction}
            onError={onComponentError}
          />
        ))}
      </div>

      {/* Related Content */}
      {navigation?.relatedQueries && navigation.relatedQueries.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Related Topics
          </h3>
          <div className="flex flex-wrap gap-3">
            {navigation.relatedQueries.map((query, index) => (
              <button
                key={index}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                onClick={() => {
                  // TODO: Trigger new page generation with this query
                  console.log('Related query clicked:', query)
                }}
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {navigation?.nextSteps && navigation.nextSteps.length > 0 && (
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Next Steps
          </h3>
          <ul className="space-y-2">
            {navigation.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * Individual dynamic component wrapper
 */
function DynamicComponent({
  spec,
  index,
  totalComponents,
  pageSpec,
  onInteraction,
  onError
}: DynamicComponentProps & {
  pageSpec: PageSpecification
  onInteraction?: (props: InteractionHandlerProps) => void | Promise<void>
  onError?: (componentType: string, error: Error) => void
}) {
  const Component = getComponent(spec.componentType)

  if (!Component) {
    const error = new Error(`Component not found: ${spec.componentType}`)
    onError?.(spec.componentType, error)

    return (
      <ComponentLoadError
        componentType={spec.componentType}
        error={error}
      />
    )
  }

  // Get animation delay based on component order
  const animationDelay = Math.min(index * 50, 300) // Max 300ms delay

  return (
    <ComponentErrorBoundary
      componentType={spec.componentType}
      componentId={spec.id}
    >
      <Suspense
        fallback={<ComponentLoadingSkeleton componentType={spec.componentType} />}
      >
        <div
          className="component-wrapper animate-fade-in"
          style={{
            animationDelay: `${animationDelay}ms`,
            animationFillMode: 'both'
          }}
        >
          <Component
            spec={spec}
            index={index}
            totalComponents={totalComponents}
            pageSpec={pageSpec}
            onInteraction={onInteraction}
          />
        </div>
      </Suspense>
    </ComponentErrorBoundary>
  )
}

/**
 * Page metadata component (SEO)
 */
function PageMetadata({ metadata }: { metadata: PageSpecification['metadata'] }) {
  // In a real app, this would use Next.js Metadata API
  // For now, we'll just render hidden meta tags
  return (
    <div className="sr-only" aria-hidden="true">
      <h1>{metadata.title}</h1>
      <p>{metadata.description}</p>
      <div>{metadata.keywords.join(', ')}</div>
    </div>
  )
}

/**
 * Get Tailwind classes for layout type
 */
function getLayoutClass(
  layoutType: string,
  spacing: string = 'spacious'
): string {
  // MUCH MORE generous spacing for professional look - always default to spacious
  const spacingClasses = {
    compact: 'space-y-12',      // 48px - minimum spacing
    normal: 'space-y-16',        // 64px - good spacing
    spacious: 'space-y-20'       // 80px - excellent spacing (default)
  }

  const baseSpacing = spacingClasses[spacing as keyof typeof spacingClasses] || spacingClasses.spacious

  switch (layoutType) {
    case 'single-column':
      // Add generous padding around content
      return `max-w-6xl mx-auto px-6 py-12 ${baseSpacing}`

    case 'two-column':
      return `grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 px-6 py-12 ${baseSpacing}`

    case 'grid':
      return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 px-6 py-12 ${baseSpacing}`

    case 'custom':
      return `px-6 py-12 ${baseSpacing}`

    default:
      // Default to single column with generous spacing
      return `max-w-6xl mx-auto px-6 py-12 ${baseSpacing}`
  }
}

/**
 * Preload components for performance (optional optimization)
 */
export function preloadPageComponents(pageSpec: PageSpecification): void {
  // Trigger lazy loading of components by importing them
  pageSpec.layout.components.forEach(component => {
    const Component = getComponent(component.componentType)
    if (Component) {
      // Trigger the lazy load by accessing the preload method if available
      // This will be handled automatically by React.lazy
    }
  })
}
