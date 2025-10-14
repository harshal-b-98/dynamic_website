/**
 * UI Quality Validator & Auto-Corrector
 *
 * Ensures all generated pages meet strict UI/UX quality standards
 * inspired by shadcn, Vercel, and Tailwind best practices.
 */

import { PageSpecification, ComponentSpec } from './page-generation'

export interface UIQualityResult {
  valid: boolean
  score: number // 0-100
  issues: UIQualityIssue[]
  corrected: PageSpecification
  autoCorrections: string[]
}

export interface UIQualityIssue {
  severity: 'critical' | 'warning' | 'info'
  category: 'spacing' | 'sizing' | 'content' | 'hierarchy' | 'accessibility'
  message: string
  componentId?: string
  autoFixable: boolean
}

/**
 * Validate and auto-correct UI quality
 */
export function validateAndCorrectUIQuality(
  pageSpec: PageSpecification
): UIQualityResult {
  const issues: UIQualityIssue[] = []
  const autoCorrections: string[] = []
  let corrected = JSON.parse(JSON.stringify(pageSpec)) as PageSpecification

  // Run all quality checks and corrections
  corrected = enforceSpacingStandards(corrected, issues, autoCorrections)
  corrected = enforceComponentSizing(corrected, issues, autoCorrections)
  corrected = enforceComponentLimits(corrected, issues, autoCorrections)
  corrected = enforceContentQuality(corrected, issues, autoCorrections)
  corrected = enforceVisualHierarchy(corrected, issues, autoCorrections)
  corrected = enforceAccessibility(corrected, issues, autoCorrections)

  // Calculate quality score
  const score = calculateQualityScore(issues)

  return {
    valid: issues.filter(i => i.severity === 'critical').length === 0,
    score,
    issues,
    corrected,
    autoCorrections
  }
}

/**
 * 1. Enforce Spacing Standards (Vercel/shadcn-inspired)
 */
function enforceSpacingStandards(
  pageSpec: PageSpecification,
  issues: UIQualityIssue[],
  corrections: string[]
): PageSpecification {
  // CRITICAL: Layout spacing must be "spacious"
  if (pageSpec.layout.spacing !== 'spacious') {
    issues.push({
      severity: 'critical',
      category: 'spacing',
      message: `Layout spacing is "${pageSpec.layout.spacing}" but must be "spacious" for proper visual breathing room`,
      autoFixable: true
    })

    pageSpec.layout.spacing = 'spacious'
    corrections.push('✅ Fixed: Changed layout spacing to "spacious"')
  }

  return pageSpec
}

/**
 * 2. Enforce Component Sizing (shadcn principles)
 */
function enforceComponentSizing(
  pageSpec: PageSpecification,
  issues: UIQualityIssue[],
  corrections: string[]
): PageSpecification {
  pageSpec.layout.components.forEach((component, index) => {
    // Hero sections MUST be xl
    if (component.componentType === 'hero-section') {
      if (component.styling?.size !== 'xl') {
        issues.push({
          severity: 'critical',
          category: 'sizing',
          message: 'Hero section must use size="xl" for maximum impact',
          componentId: component.id,
          autoFixable: true
        })

        if (!component.styling) component.styling = {}
        component.styling.size = 'xl'
        corrections.push(`✅ Fixed: Set Hero section to size="xl"`)
      }
    }

    // All other components should be lg or xl (never sm/md)
    else {
      const currentSize = component.styling?.size
      if (currentSize === 'sm' || currentSize === 'md' || !currentSize) {
        issues.push({
          severity: 'warning',
          category: 'sizing',
          message: `Component "${component.componentType}" using size="${currentSize || 'default'}" should be "lg" or "xl"`,
          componentId: component.id,
          autoFixable: true
        })

        if (!component.styling) component.styling = {}
        component.styling.size = 'lg'
        corrections.push(`✅ Fixed: Set ${component.componentType} to size="lg"`)
      }
    }
  })

  return pageSpec
}

/**
 * 3. Enforce Component Limits (Vercel minimalism)
 */
function enforceComponentLimits(
  pageSpec: PageSpecification,
  issues: UIQualityIssue[],
  corrections: string[]
): PageSpecification {
  const componentCount = pageSpec.layout.components.length

  // CRITICAL: Maximum 5 components per page
  if (componentCount > 5) {
    issues.push({
      severity: 'critical',
      category: 'spacing',
      message: `Page has ${componentCount} components but maximum is 5 for optimal UX`,
      autoFixable: true
    })

    // Keep only the 5 most important components
    // Priority order: hero -> content -> social proof -> CTA
    const prioritized = prioritizeComponents(pageSpec.layout.components)
    pageSpec.layout.components = prioritized.slice(0, 5)
    corrections.push(`✅ Fixed: Reduced from ${componentCount} to 5 components`)
  }

  // Check feature grids specifically
  pageSpec.layout.components.forEach(component => {
    if (component.componentType === 'feature-grid') {
      const features = component.content?.features || []
      if (features.length > 4) {
        issues.push({
          severity: 'critical',
          category: 'content',
          message: `Feature grid has ${features.length} items but maximum is 4 for clean layout`,
          componentId: component.id,
          autoFixable: true
        })

        component.content.features = features.slice(0, 4)
        corrections.push(`✅ Fixed: Reduced feature grid from ${features.length} to 4 items`)
      }

      // Check feature description lengths
      features.forEach((feature: any, idx: number) => {
        if (feature.description && feature.description.length > 100) {
          issues.push({
            severity: 'warning',
            category: 'content',
            message: `Feature ${idx + 1} description is ${feature.description.length} chars (max 100)`,
            componentId: component.id,
            autoFixable: true
          })

          feature.description = feature.description.substring(0, 97) + '...'
          corrections.push(`✅ Fixed: Truncated feature ${idx + 1} description`)
        }
      })
    }
  })

  return pageSpec
}

/**
 * 4. Enforce Content Quality (Tailwind/shadcn readability)
 */
function enforceContentQuality(
  pageSpec: PageSpecification,
  issues: UIQualityIssue[],
  corrections: string[]
): PageSpecification {
  pageSpec.layout.components.forEach(component => {
    // Check headlines aren't too long
    const headline = component.props?.headline || component.content?.headline
    if (headline && headline.length > 80) {
      issues.push({
        severity: 'warning',
        category: 'content',
        message: `Headline too long (${headline.length} chars, max 80)`,
        componentId: component.id,
        autoFixable: false // Manual review needed
      })
    }

    // Check subheadings aren't too long
    const subheading = component.props?.subheading || component.content?.subheading
    if (subheading && subheading.length > 160) {
      issues.push({
        severity: 'warning',
        category: 'content',
        message: `Subheading too long (${subheading.length} chars, max 160)`,
        componentId: component.id,
        autoFixable: true
      })

      // Auto-fix by truncating
      if (component.props?.subheading) {
        component.props.subheading = subheading.substring(0, 157) + '...'
      } else if (component.content?.subheading) {
        component.content.subheading = subheading.substring(0, 157) + '...'
      }
      corrections.push(`✅ Fixed: Truncated subheading in ${component.componentType}`)
    }

    // Check for placeholder content
    const hasPlaceholder = JSON.stringify(component).match(/lorem|ipsum|placeholder|dummy|example/i)
    if (hasPlaceholder) {
      issues.push({
        severity: 'critical',
        category: 'content',
        message: 'Component contains placeholder content',
        componentId: component.id,
        autoFixable: false
      })
    }
  })

  return pageSpec
}

/**
 * 5. Enforce Visual Hierarchy (shadcn patterns)
 */
function enforceVisualHierarchy(
  pageSpec: PageSpecification,
  issues: UIQualityIssue[],
  corrections: string[]
): PageSpecification {
  const components = pageSpec.layout.components

  // CRITICAL: First component must be a hero or page header
  const firstComponent = components[0]
  const validFirstTypes = ['hero-section', 'page-header']

  if (!validFirstTypes.includes(firstComponent.componentType)) {
    issues.push({
      severity: 'critical',
      category: 'hierarchy',
      message: `First component is "${firstComponent.componentType}" but should be hero-section or page-header`,
      componentId: firstComponent.id,
      autoFixable: false // Can't auto-generate a hero
    })
  }

  // Last component should ideally be a CTA
  const lastComponent = components[components.length - 1]
  if (lastComponent.componentType !== 'cta-section' && components.length > 2) {
    issues.push({
      severity: 'info',
      category: 'hierarchy',
      message: 'Consider ending with a CTA section for better conversion',
      componentId: lastComponent.id,
      autoFixable: false
    })
  }

  // Ensure order values are sequential
  components.forEach((component, index) => {
    if (component.order !== index) {
      component.order = index
      if (index === 0) {
        corrections.push(`✅ Fixed: Corrected component order values`)
      }
    }
  })

  return pageSpec
}

/**
 * 6. Enforce Accessibility (WCAG standards)
 */
function enforceAccessibility(
  pageSpec: PageSpecification,
  issues: UIQualityIssue[],
  corrections: string[]
): PageSpecification {
  pageSpec.layout.components.forEach(component => {
    // Check images have alt text
    const imageUrl = component.props?.imageUrl || component.content?.imageUrl
    const imageAlt = component.props?.imageAlt || component.content?.imageAlt

    if (imageUrl && !imageAlt) {
      issues.push({
        severity: 'warning',
        category: 'accessibility',
        message: 'Image missing alt text',
        componentId: component.id,
        autoFixable: true
      })

      // Auto-generate basic alt text
      const altText = `${component.componentType} visual`
      if (component.props?.imageUrl) {
        component.props.imageAlt = altText
      } else if (component.content?.imageUrl) {
        component.content.imageAlt = altText
      }
      corrections.push(`✅ Fixed: Added alt text to image in ${component.componentType}`)
    }

    // Check CTAs have descriptive text
    const ctaText = component.props?.ctaText || component.content?.ctaText
    if (ctaText) {
      const genericCTAs = ['click here', 'click', 'here', 'link', 'button']
      if (genericCTAs.includes(ctaText.toLowerCase())) {
        issues.push({
          severity: 'warning',
          category: 'accessibility',
          message: `CTA text "${ctaText}" is too generic`,
          componentId: component.id,
          autoFixable: false
        })
      }
    }
  })

  return pageSpec
}

/**
 * Helper: Prioritize components by importance
 */
function prioritizeComponents(components: ComponentSpec[]): ComponentSpec[] {
  const priority: Record<string, number> = {
    'hero-section': 100,
    'page-header': 90,
    'feature-grid': 80,
    'stats-display': 75,
    'testimonial-block': 70,
    'comparison-table': 65,
    'pricing-table': 65,
    'case-study-card': 60,
    'rich-text-content': 55,
    'cta-section': 50,
    'form-section': 50,
    'faq-accordion': 40,
    'metric-card': 35,
    'step-by-step': 30,
  }

  return [...components].sort((a, b) => {
    const aPriority = priority[a.componentType] || 0
    const bPriority = priority[b.componentType] || 0
    return bPriority - aPriority
  })
}

/**
 * Calculate overall quality score
 */
function calculateQualityScore(issues: UIQualityIssue[]): number {
  let score = 100

  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical':
        score -= 20
        break
      case 'warning':
        score -= 10
        break
      case 'info':
        score -= 2
        break
    }
  })

  return Math.max(0, Math.min(100, score))
}

/**
 * Quick validation (just critical issues)
 */
export function hasQualityIssues(pageSpec: PageSpecification): boolean {
  const result = validateAndCorrectUIQuality(pageSpec)
  return result.issues.filter(i => i.severity === 'critical').length > 0
}

/**
 * Get quality report
 */
export function getQualityReport(result: UIQualityResult): string {
  let report = `\n📊 UI Quality Report\n`
  report += `Score: ${result.score}/100 ${getScoreEmoji(result.score)}\n`
  report += `Status: ${result.valid ? '✅ PASS' : '❌ FAIL'}\n\n`

  if (result.issues.length > 0) {
    report += `Issues Found:\n`
    result.issues.forEach((issue, idx) => {
      const emoji = issue.severity === 'critical' ? '🚨' :
                    issue.severity === 'warning' ? '⚠️' : 'ℹ️'
      report += `${emoji} [${issue.category}] ${issue.message}\n`
    })
  }

  if (result.autoCorrections.length > 0) {
    report += `\nAuto-Corrections Applied:\n`
    result.autoCorrections.forEach(correction => {
      report += `${correction}\n`
    })
  }

  return report
}

function getScoreEmoji(score: number): string {
  if (score >= 90) return '🌟'
  if (score >= 75) return '👍'
  if (score >= 60) return '⚠️'
  return '❌'
}
