/**
 * Component Variant System
 *
 * Manages content variants for personalized rendering.
 */

import type { ContentVariant, VariantGroup, VariantType } from './schema'

/**
 * Variant Store
 */
export class VariantStore {
  private groups: Map<string, VariantGroup>
  private variants: Map<string, ContentVariant>

  constructor() {
    this.groups = new Map()
    this.variants = new Map()
  }

  /**
   * Register a variant group
   */
  registerGroup(group: VariantGroup): void {
    this.groups.set(group.id, group)

    // Index variants for quick lookup
    for (const variant of group.variants) {
      this.variants.set(variant.id, variant)
    }
  }

  /**
   * Get variant group by ID
   */
  getGroup(groupId: string): VariantGroup | undefined {
    return this.groups.get(groupId)
  }

  /**
   * Get variant group by slot ID
   */
  getGroupBySlot(slotId: string): VariantGroup | undefined {
    return Array.from(this.groups.values()).find((g) => g.slotId === slotId)
  }

  /**
   * Get variant by ID
   */
  getVariant(variantId: string): ContentVariant | undefined {
    return this.variants.get(variantId)
  }

  /**
   * Get default variant for group
   */
  getDefaultVariant(groupId: string): ContentVariant | undefined {
    const group = this.groups.get(groupId)
    if (!group) return undefined

    return this.variants.get(group.defaultVariantId)
  }

  /**
   * Get all groups
   */
  getAllGroups(): VariantGroup[] {
    return Array.from(this.groups.values())
  }

  /**
   * Get all variants for a group
   */
  getVariantsForGroup(groupId: string): ContentVariant[] {
    const group = this.groups.get(groupId)
    if (!group) return []

    return group.variants
  }

  /**
   * Clear all groups and variants
   */
  clear(): void {
    this.groups.clear()
    this.variants.clear()
  }
}

/**
 * Global variant store instance
 */
const globalVariantStore = new VariantStore()

/**
 * Get global variant store
 */
export function getVariantStore(): VariantStore {
  return globalVariantStore
}

/**
 * Variant Builder for fluent API
 */
export class VariantBuilder {
  private variant: Partial<ContentVariant>

  constructor(id: string, name: string, type: VariantType) {
    this.variant = {
      id,
      name,
      type,
      content: {},
      isDefault: false,
    }
  }

  content(content: Record<string, unknown>): this {
    this.variant.content = content
    return this
  }

  isDefault(isDefault: boolean): this {
    this.variant.isDefault = isDefault
    return this
  }

  targetPersona(personaId: string): this {
    this.variant.metadata = {
      ...this.variant.metadata,
      targetPersona: personaId as any,
    }
    return this
  }

  description(description: string): this {
    this.variant.metadata = {
      ...this.variant.metadata,
      description,
    }
    return this
  }

  tags(tags: string[]): this {
    this.variant.metadata = {
      ...this.variant.metadata,
      tags,
    }
    return this
  }

  build(): ContentVariant {
    return this.variant as ContentVariant
  }
}

/**
 * Variant Group Builder
 */
export class VariantGroupBuilder {
  private group: Partial<VariantGroup>

  constructor(id: string, name: string, slotId: string) {
    this.group = {
      id,
      name,
      slotId,
      variants: [],
    }
  }

  variant(variant: ContentVariant): this {
    this.group.variants = [...(this.group.variants || []), variant]

    // Set as default if it's the only variant or marked as default
    if (!this.group.defaultVariantId || variant.isDefault) {
      this.group.defaultVariantId = variant.id
    }

    return this
  }

  defaultVariant(variantId: string): this {
    this.group.defaultVariantId = variantId
    return this
  }

  description(description: string): this {
    this.group.description = description
    return this
  }

  build(): VariantGroup {
    if (!this.group.defaultVariantId) {
      throw new Error('Variant group must have a default variant')
    }

    if (!this.group.variants || this.group.variants.length === 0) {
      throw new Error('Variant group must have at least one variant')
    }

    return this.group as VariantGroup
  }
}

/**
 * Helper functions for creating common variant types
 */

/**
 * Create text variant
 */
export function createTextVariant(
  id: string,
  name: string,
  text: string,
  options: {
    targetPersona?: string
    isDefault?: boolean
  } = {}
): ContentVariant {
  const builder = new VariantBuilder(id, name, 'text').content({ text })

  if (options.targetPersona) {
    builder.targetPersona(options.targetPersona)
  }

  if (options.isDefault) {
    builder.isDefault(true)
  }

  return builder.build()
}

/**
 * Create CTA variant
 */
export function createCTAVariant(
  id: string,
  name: string,
  cta: {
    text: string
    href: string
    variant?: 'primary' | 'secondary' | 'outline'
  },
  options: {
    targetPersona?: string
    isDefault?: boolean
  } = {}
): ContentVariant {
  const builder = new VariantBuilder(id, name, 'cta').content(cta)

  if (options.targetPersona) {
    builder.targetPersona(options.targetPersona)
  }

  if (options.isDefault) {
    builder.isDefault(true)
  }

  return builder.build()
}

/**
 * Create image variant
 */
export function createImageVariant(
  id: string,
  name: string,
  image: {
    src: string
    alt: string
    width?: number
    height?: number
  },
  options: {
    targetPersona?: string
    isDefault?: boolean
  } = {}
): ContentVariant {
  const builder = new VariantBuilder(id, name, 'image').content(image)

  if (options.targetPersona) {
    builder.targetPersona(options.targetPersona)
  }

  if (options.isDefault) {
    builder.isDefault(true)
  }

  return builder.build()
}

/**
 * Create component variant
 */
export function createComponentVariant(
  id: string,
  name: string,
  component: {
    type: string
    props: Record<string, unknown>
  },
  options: {
    targetPersona?: string
    isDefault?: boolean
  } = {}
): ContentVariant {
  const builder = new VariantBuilder(id, name, 'component').content(component)

  if (options.targetPersona) {
    builder.targetPersona(options.targetPersona)
  }

  if (options.isDefault) {
    builder.isDefault(true)
  }

  return builder.build()
}

/**
 * Create example variant (use case, testimonial, etc.)
 */
export function createExampleVariant(
  id: string,
  name: string,
  example: {
    title: string
    description: string
    industry?: string
    role?: string
    metrics?: Record<string, string | number>
  },
  options: {
    targetPersona?: string
    isDefault?: boolean
  } = {}
): ContentVariant {
  const builder = new VariantBuilder(id, name, 'example').content(example)

  if (options.targetPersona) {
    builder.targetPersona(options.targetPersona)
  }

  if (options.isDefault) {
    builder.isDefault(true)
  }

  return builder.build()
}

/**
 * Variant registry for pre-defined variants
 */
export class VariantRegistry {
  private static instance: VariantRegistry
  private groups: VariantGroup[] = []

  private constructor() {
    this.initializeDefaultVariants()
  }

  static getInstance(): VariantRegistry {
    if (!VariantRegistry.instance) {
      VariantRegistry.instance = new VariantRegistry()
    }
    return VariantRegistry.instance
  }

  /**
   * Initialize default variants
   */
  private initializeDefaultVariants(): void {
    // Hero section headline variants
    this.registerGroup(
      new VariantGroupBuilder('hero-headline', 'Hero Headline', 'hero.headline')
        .variant(
          createTextVariant(
            'hero-headline-default',
            'Default',
            'Transform Your Business with AI-Powered Solutions',
            { isDefault: true }
          )
        )
        .variant(
          createTextVariant(
            'hero-headline-smb',
            'SMB Owner',
            'Affordable AI Solutions for Small Businesses',
            { targetPersona: 'smb_owner' }
          )
        )
        .variant(
          createTextVariant(
            'hero-headline-enterprise',
            'Enterprise',
            'Enterprise-Grade AI Platform for Scale',
            { targetPersona: 'enterprise_buyer' }
          )
        )
        .variant(
          createTextVariant(
            'hero-headline-technical',
            'Technical',
            'Build Powerful AI Applications with Our API',
            { targetPersona: 'technical_evaluator' }
          )
        )
        .build()
    )

    // Hero CTA variants
    this.registerGroup(
      new VariantGroupBuilder('hero-cta', 'Hero CTA', 'hero.cta')
        .variant(
          createCTAVariant(
            'hero-cta-default',
            'Default',
            { text: 'Get Started', href: '/signup', variant: 'primary' },
            { isDefault: true }
          )
        )
        .variant(
          createCTAVariant(
            'hero-cta-smb',
            'SMB Owner',
            { text: 'Start Free Trial', href: '/trial', variant: 'primary' },
            { targetPersona: 'smb_owner' }
          )
        )
        .variant(
          createCTAVariant(
            'hero-cta-enterprise',
            'Enterprise',
            { text: 'Request Demo', href: '/demo', variant: 'primary' },
            { targetPersona: 'enterprise_buyer' }
          )
        )
        .variant(
          createCTAVariant(
            'hero-cta-technical',
            'Technical',
            { text: 'View Documentation', href: '/docs', variant: 'primary' },
            { targetPersona: 'technical_evaluator' }
          )
        )
        .build()
    )

    // Use case examples
    this.registerGroup(
      new VariantGroupBuilder('use-case-example', 'Use Case Example', 'example.useCase')
        .variant(
          createExampleVariant(
            'use-case-default',
            'Default',
            {
              title: 'Automate Customer Support',
              description: 'Reduce response times by 80% with AI-powered support',
              metrics: { responseTime: '< 30s', satisfaction: '95%' },
            },
            { isDefault: true }
          )
        )
        .variant(
          createExampleVariant(
            'use-case-smb',
            'SMB Owner',
            {
              title: 'Save Time & Money',
              description: 'Automate routine tasks and focus on growing your business',
              industry: 'Small Business',
              metrics: { timeSaved: '20 hrs/week', costSavings: '$2,000/mo' },
            },
            { targetPersona: 'smb_owner' }
          )
        )
        .variant(
          createExampleVariant(
            'use-case-enterprise',
            'Enterprise',
            {
              title: 'Scale Operations Globally',
              description: 'Deploy AI across 100+ teams with enterprise controls',
              industry: 'Enterprise',
              metrics: { teams: '500+', languages: '40+' },
            },
            { targetPersona: 'enterprise_buyer' }
          )
        )
        .variant(
          createExampleVariant(
            'use-case-technical',
            'Technical',
            {
              title: 'Build Custom AI Applications',
              description: 'Integrate powerful AI capabilities into your products',
              role: 'Developer',
              metrics: { apiCalls: '1B+/mo', uptime: '99.99%' },
            },
            { targetPersona: 'technical_evaluator' }
          )
        )
        .build()
    )

    // Feature callout variants
    this.registerGroup(
      new VariantGroupBuilder('feature-callout', 'Feature Callout', 'feature.callout')
        .variant(
          createTextVariant(
            'feature-default',
            'Default',
            'Powerful features to transform your workflow',
            { isDefault: true }
          )
        )
        .variant(
          createTextVariant(
            'feature-smb',
            'SMB Owner',
            'Easy-to-use tools that grow with your business',
            { targetPersona: 'smb_owner' }
          )
        )
        .variant(
          createTextVariant(
            'feature-enterprise',
            'Enterprise',
            'Enterprise security, compliance, and control',
            { targetPersona: 'enterprise_buyer' }
          )
        )
        .variant(
          createTextVariant(
            'feature-technical',
            'Technical',
            'Developer-friendly APIs and SDKs',
            { targetPersona: 'technical_evaluator' }
          )
        )
        .build()
    )
  }

  /**
   * Register a variant group
   */
  registerGroup(group: VariantGroup): void {
    // Remove existing group with same ID
    this.groups = this.groups.filter((g) => g.id !== group.id)

    // Add new group
    this.groups.push(group)

    // Register with global store
    globalVariantStore.registerGroup(group)
  }

  /**
   * Get all groups
   */
  getAllGroups(): VariantGroup[] {
    return [...this.groups]
  }

  /**
   * Get group by ID
   */
  getGroup(groupId: string): VariantGroup | undefined {
    return this.groups.find((g) => g.id === groupId)
  }

  /**
   * Get group by slot ID
   */
  getGroupBySlot(slotId: string): VariantGroup | undefined {
    return this.groups.find((g) => g.slotId === slotId)
  }
}

/**
 * Initialize variant registry
 */
export function initializeVariantRegistry(): VariantRegistry {
  return VariantRegistry.getInstance()
}

/**
 * Get variant registry
 */
export function getVariantRegistry(): VariantRegistry {
  return VariantRegistry.getInstance()
}
