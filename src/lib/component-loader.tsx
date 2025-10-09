/**
 * Dynamic Component Loader
 *
 * Maps component registry IDs to actual React components with dynamic imports
 * for code splitting and performance optimization
 */

import { ComponentType, lazy, LazyExoticComponent } from 'react'
import { ComponentSpec } from './page-generation'

// Component import map with lazy loading
export const COMPONENT_IMPORTS: Record<string, LazyExoticComponent<ComponentType<any>>> = {
  // Hero & Headers
  'hero-section': lazy(() => import('@/components/dynamic/HeroSection')),
  'page-header': lazy(() => import('@/components/dynamic/PageHeader')),
  'section-header': lazy(() => import('@/components/dynamic/SectionHeader')),

  // Content & Information
  'rich-text-content': lazy(() => import('@/components/dynamic/RichTextContent')),
  'feature-grid': lazy(() => import('@/components/dynamic/FeatureGrid')),
  'feature-highlight': lazy(() => import('@/components/dynamic/FeatureHighlight')),
  'step-by-step': lazy(() => import('@/components/dynamic/StepByStep')),
  'faq-accordion': lazy(() => import('@/components/dynamic/FaqAccordion')),

  // Comparison & Decision
  'comparison-table': lazy(() => import('@/components/dynamic/ComparisonTable')),
  'pricing-table': lazy(() => import('@/components/dynamic/PricingTable')),
  'pros-cons-list': lazy(() => import('@/components/dynamic/ProsConsList')),

  // Social Proof & Trust
  'testimonial-block': lazy(() => import('@/components/dynamic/TestimonialBlock')),
  'case-study-card': lazy(() => import('@/components/dynamic/CaseStudyCard')),
  'trust-indicators': lazy(() => import('@/components/dynamic/TrustIndicators')),
  'logo-cloud': lazy(() => import('@/components/dynamic/LogoCloud')),

  // Interactive & Engagement
  'cta-section': lazy(() => import('@/components/dynamic/CtaSection')),
  'form-section': lazy(() => import('@/components/dynamic/FormSection')),
  'interactive-demo': lazy(() => import('@/components/dynamic/InteractiveDemo')),

  // Data & Analytics
  'metric-card': lazy(() => import('@/components/dynamic/MetricCard')),
  'stats-display': lazy(() => import('@/components/dynamic/StatsDisplay')),
  'chart-display': lazy(() => import('@/components/dynamic/ChartDisplay')),

  // Technical & Detailed
  'tech-spec-table': lazy(() => import('@/components/dynamic/TechSpecTable')),
  'api-reference': lazy(() => import('@/components/dynamic/ApiReference')),
  'code-snippet': lazy(() => import('@/components/dynamic/CodeSnippet')),

  // Navigation & Guidance
  'breadcrumbs': lazy(() => import('@/components/dynamic/Breadcrumbs')),
  'related-content': lazy(() => import('@/components/dynamic/RelatedContent')),
  'next-steps': lazy(() => import('@/components/dynamic/NextSteps')),

  // Media & Visual
  'image-gallery': lazy(() => import('@/components/dynamic/ImageGallery')),
  'video-embed': lazy(() => import('@/components/dynamic/VideoEmbed')),

  // Alerts & Messaging
  'alert-banner': lazy(() => import('@/components/dynamic/AlertBanner')),
  'announcement-card': lazy(() => import('@/components/dynamic/AnnouncementCard'))
}

/**
 * Get component by registry ID
 */
export function getComponent(componentType: string): LazyExoticComponent<ComponentType<any>> | null {
  return COMPONENT_IMPORTS[componentType] || null
}

/**
 * Check if component exists in loader
 */
export function hasComponent(componentType: string): boolean {
  return componentType in COMPONENT_IMPORTS
}

/**
 * Get all available component types
 */
export function getAvailableComponents(): string[] {
  return Object.keys(COMPONENT_IMPORTS)
}

/**
 * Preload specific components for performance
 */
export async function preloadComponents(componentTypes: string[]): Promise<void> {
  const promises = componentTypes
    .filter(type => hasComponent(type))
    .map(type => {
      const Component = COMPONENT_IMPORTS[type]
      // Trigger lazy loading
      return Component._payload?._result || Promise.resolve()
    })

  await Promise.all(promises)
}

/**
 * Component props interface for type safety
 */
export interface DynamicComponentProps {
  spec: ComponentSpec
  index: number
  totalComponents: number
}

/**
 * Error component for failed component loads
 */
export function ComponentLoadError({
  componentType,
  error
}: {
  componentType: string
  error?: Error
}) {
  return (
    <div className="p-6 border-2 border-red-200 bg-red-50 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-red-800">
            Component Load Error
          </h3>
          <p className="mt-1 text-sm text-red-700">
            Failed to load component: <code className="px-1 py-0.5 bg-red-100 rounded text-xs">{componentType}</code>
          </p>
          {error && (
            <p className="mt-2 text-xs text-red-600 font-mono">
              {error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Loading skeleton for components
 */
export function ComponentLoadingSkeleton({
  componentType
}: {
  componentType: string
}) {
  // Different skeleton styles based on component type
  const isHero = componentType.includes('hero') || componentType.includes('header')
  const isChart = componentType.includes('chart') || componentType.includes('metric')
  const isTable = componentType.includes('table')
  const isForm = componentType.includes('form')

  if (isHero) {
    return (
      <div className="animate-pulse space-y-4 py-12">
        <div className="h-12 bg-gray-200 rounded-lg w-3/4 mx-auto"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
        <div className="h-10 bg-gray-200 rounded w-32 mx-auto mt-8"></div>
      </div>
    )
  }

  if (isChart) {
    return (
      <div className="animate-pulse space-y-4 p-6 border border-gray-200 rounded-lg">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (isTable) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-16 bg-gray-100 rounded"></div>
        <div className="h-16 bg-gray-100 rounded"></div>
        <div className="h-16 bg-gray-100 rounded"></div>
      </div>
    )
  }

  if (isForm) {
    return (
      <div className="animate-pulse space-y-4 p-6 border border-gray-200 rounded-lg">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-100 rounded"></div>
        <div className="h-10 bg-gray-100 rounded"></div>
        <div className="h-10 bg-gray-100 rounded"></div>
        <div className="h-10 bg-blue-200 rounded w-32"></div>
      </div>
    )
  }

  // Default skeleton
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-100 rounded"></div>
      <div className="h-4 bg-gray-100 rounded w-5/6"></div>
      <div className="h-4 bg-gray-100 rounded w-4/6"></div>
    </div>
  )
}
