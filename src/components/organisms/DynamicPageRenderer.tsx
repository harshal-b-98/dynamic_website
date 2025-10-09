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

export interface DynamicPageRendererProps {
  pageSpec: PageSpecification
  className?: string
  onComponentError?: (componentType: string, error: Error) => void
}

/**
 * Main page renderer component
 */
export function DynamicPageRenderer({
  pageSpec,
  className = '',
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
  onError
}: DynamicComponentProps & {
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
  spacing: string = 'normal'
): string {
  const spacingClasses = {
    compact: 'space-y-4',
    normal: 'space-y-8',
    spacious: 'space-y-12'
  }

  const baseSpacing = spacingClasses[spacing as keyof typeof spacingClasses] || spacingClasses.normal

  switch (layoutType) {
    case 'single-column':
      return `max-w-4xl mx-auto ${baseSpacing}`

    case 'two-column':
      return `grid grid-cols-1 lg:grid-cols-3 gap-8 ${baseSpacing}`

    case 'grid':
      return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${baseSpacing}`

    case 'custom':
      return `${baseSpacing}`

    default:
      return `max-w-4xl mx-auto ${baseSpacing}`
  }
}

/**
 * Preload components for performance (optional optimization)
 */
export function preloadPageComponents(pageSpec: PageSpecification): void {
  // Trigger lazy loading of components
  pageSpec.layout.components.forEach(component => {
    const Component = getComponent(component.componentType)
    if (Component) {
      // Access the lazy component to trigger loading
      Component._payload?._result
    }
  })
}
