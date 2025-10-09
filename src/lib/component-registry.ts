/**
 * Component Registry for Dynamic Page Generation
 *
 * Complete catalog of available components for LLM page generation.
 * The LLM has full flexibility to select any component in any combination.
 */

import { ComponentRegistryEntry, ComponentCategory } from './page-generation'

/**
 * Complete component registry
 */
export const COMPONENT_REGISTRY: Record<string, ComponentRegistryEntry> = {
  // ============================================
  // CATEGORY: Hero & Headers (Page Anchors)
  // ============================================

  'hero-section': {
    id: 'hero-section',
    name: 'Hero Section',
    category: 'hero-headers',
    description: 'Primary page introduction with headline, subheading, and CTA',
    useCases: [
      'Landing pages for new visitors',
      'Feature introductions',
      'Product overviews',
      'Campaign pages'
    ],
    tags: ['landing', 'introduction', 'cta', 'hero', 'primary'],
    props: {
      headline: { type: 'string', required: true, description: 'Main attention-grabbing headline' },
      subheading: { type: 'string', required: false, description: 'Supporting text' },
      ctaText: { type: 'string', required: false, description: 'Call-to-action button text' },
      ctaLink: { type: 'string', required: false, description: 'CTA destination URL' },
      backgroundImage: { type: 'string', required: false, description: 'Hero background image URL' },
      variant: { type: 'string', required: false, default: 'centered', description: 'Layout variant: centered, split, minimal' }
    },
    examples: [{
      scenario: 'Product landing page',
      componentType: 'hero-section',
      props: {
        headline: 'Transform Your Business with AI-Powered Insights',
        subheading: 'Get actionable intelligence from your data in seconds, not days',
        ctaText: 'Start Free Trial',
        variant: 'centered'
      }
    }]
  },

  'page-header': {
    id: 'page-header',
    name: 'Page Header',
    category: 'hero-headers',
    description: 'Simple page title and breadcrumb navigation',
    useCases: [
      'Internal navigation pages',
      'Documentation pages',
      'Feature detail pages'
    ],
    tags: ['header', 'navigation', 'breadcrumbs', 'title'],
    props: {
      title: { type: 'string', required: true, description: 'Page title' },
      breadcrumbs: { type: 'array', required: false, description: 'Breadcrumb navigation items' },
      description: { type: 'string', required: false, description: 'Page description' }
    }
  },

  // ============================================
  // CATEGORY: Content & Information
  // ============================================

  'feature-grid': {
    id: 'feature-grid',
    name: 'Feature Grid',
    category: 'content-information',
    description: 'Display multiple features in a grid layout',
    useCases: [
      'Product feature overviews',
      'Service offerings',
      'Benefit lists',
      'Capability showcases'
    ],
    tags: ['features', 'grid', 'benefits', 'capabilities'],
    props: {
      features: { type: 'array', required: true, description: 'Array of feature objects with icon, title, description' },
      columns: { type: 'number', required: false, default: 3, description: 'Number of columns: 2, 3, or 4' },
      variant: { type: 'string', required: false, default: 'cards', description: 'Display variant: cards, list, icons' }
    },
    examples: [{
      scenario: 'Platform capabilities showcase',
      componentType: 'feature-grid',
      props: {
        columns: 3,
        variant: 'cards',
        features: [
          { icon: '🚀', title: 'Fast Performance', description: 'Sub-2 second page generation with LLM caching' },
          { icon: '🎨', title: 'Dynamic UI', description: 'Pages generated on-demand based on user queries' },
          { icon: '🧠', title: 'AI-Powered', description: 'Intelligent content and component selection' }
        ]
      }
    }]
  },

  'rich-text-content': {
    id: 'rich-text-content',
    name: 'Rich Text Content',
    category: 'content-information',
    description: 'Display formatted text content with markdown support',
    useCases: [
      'Detailed explanations',
      'Documentation sections',
      'Blog-style content',
      'Long-form answers'
    ],
    tags: ['text', 'content', 'markdown', 'documentation'],
    props: {
      content: { type: 'string', required: true, description: 'Markdown formatted text' },
      maxWidth: { type: 'string', required: false, default: 'md', description: 'Maximum width: sm, md, lg, full' }
    }
  },

  'stats-display': {
    id: 'stats-display',
    name: 'Stats Display',
    category: 'content-information',
    description: 'Highlight key metrics and statistics',
    useCases: [
      'Social proof',
      'Performance metrics',
      'Business achievements',
      'Usage statistics'
    ],
    tags: ['statistics', 'metrics', 'numbers', 'social-proof'],
    props: {
      stats: { type: 'array', required: true, description: 'Array of stat objects with value, label, change, icon' },
      layout: { type: 'string', required: false, default: 'horizontal', description: 'Layout: horizontal or grid' }
    }
  },

  // ============================================
  // CATEGORY: Comparison & Decision
  // ============================================

  'pricing-table': {
    id: 'pricing-table',
    name: 'Pricing Table',
    category: 'comparison-decision',
    description: 'Compare pricing plans side-by-side',
    useCases: [
      'Pricing inquiries',
      'Plan comparisons',
      'Upgrade decisions',
      'Cost evaluations'
    ],
    tags: ['pricing', 'plans', 'comparison', 'costs'],
    props: {
      plans: { type: 'array', required: true, description: 'Array of pricing plan objects' },
      billingPeriod: { type: 'string', required: false, default: 'monthly', description: 'Billing period: monthly, annual, both' },
      highlightPlanIndex: { type: 'number', required: false, description: 'Index of plan to emphasize' }
    }
  },

  'comparison-table': {
    id: 'comparison-table',
    name: 'Comparison Table',
    category: 'comparison-decision',
    description: 'Compare features, products, or options in a table',
    useCases: [
      'Feature comparisons',
      'Product vs. competitor',
      'Plan feature breakdown',
      'Technical specifications'
    ],
    tags: ['comparison', 'table', 'features', 'versus'],
    props: {
      items: { type: 'array', required: true, description: 'Items being compared' },
      attributes: { type: 'array', required: true, description: 'Comparison attributes with values' },
      highlightColumn: { type: 'number', required: false, description: 'Column index to highlight' }
    }
  },

  'pros-cons-list': {
    id: 'pros-cons-list',
    name: 'Pros & Cons List',
    category: 'comparison-decision',
    description: 'Show advantages and disadvantages',
    useCases: [
      'Decision-making support',
      'Balanced evaluations',
      'Honest assessments',
      'Recommendation contexts'
    ],
    tags: ['pros', 'cons', 'advantages', 'disadvantages', 'decision'],
    props: {
      pros: { type: 'array', required: true, description: 'List of advantages' },
      cons: { type: 'array', required: true, description: 'List of disadvantages' },
      title: { type: 'string', required: false, description: 'Section title' }
    }
  },

  // ============================================
  // CATEGORY: Social Proof & Trust
  // ============================================

  'testimonial-block': {
    id: 'testimonial-block',
    name: 'Testimonial Block',
    category: 'social-proof-trust',
    description: 'Display customer testimonials and reviews',
    useCases: [
      'Social proof',
      'Trust building',
      'Customer validation',
      'Case study highlights'
    ],
    tags: ['testimonials', 'reviews', 'customers', 'social-proof'],
    props: {
      testimonials: { type: 'array', required: true, description: 'Array of testimonial objects' },
      layout: { type: 'string', required: false, default: 'grid', description: 'Layout: carousel, grid, single' }
    }
  },

  'logo-cloud': {
    id: 'logo-cloud',
    name: 'Logo Cloud',
    category: 'social-proof-trust',
    description: 'Display logos of customers, partners, or integrations',
    useCases: [
      'Customer logos',
      'Partner showcases',
      'Integration ecosystem',
      'Press mentions'
    ],
    tags: ['logos', 'customers', 'partners', 'integrations'],
    props: {
      logos: { type: 'array', required: true, description: 'Array of logo objects with name, image, link' },
      title: { type: 'string', required: false, description: 'Section title' },
      layout: { type: 'string', required: false, default: 'grid', description: 'Layout: grid or marquee' }
    }
  },

  'case-study-card': {
    id: 'case-study-card',
    name: 'Case Study Card',
    category: 'social-proof-trust',
    description: 'Highlight detailed customer success stories',
    useCases: [
      'Detailed proof points',
      'Industry-specific examples',
      'ROI demonstrations',
      'Success stories'
    ],
    tags: ['case-study', 'success-story', 'customer', 'results'],
    props: {
      title: { type: 'string', required: true, description: 'Case study title' },
      company: { type: 'string', required: true, description: 'Company name' },
      industry: { type: 'string', required: false, description: 'Industry sector' },
      challenge: { type: 'string', required: true, description: 'Customer challenge' },
      solution: { type: 'string', required: true, description: 'Solution provided' },
      results: { type: 'array', required: true, description: 'Array of result statements' },
      link: { type: 'string', required: false, description: 'Link to full case study' }
    }
  },

  // ============================================
  // CATEGORY: Interactive & Engagement
  // ============================================

  'cta-section': {
    id: 'cta-section',
    name: 'CTA Section',
    category: 'interactive-engagement',
    description: 'Call-to-action with clear next steps',
    useCases: [
      'Conversion points',
      'Lead capture',
      'Trial signups',
      'Demo requests',
      'Contact prompts'
    ],
    tags: ['cta', 'call-to-action', 'conversion', 'signup'],
    props: {
      headline: { type: 'string', required: true, description: 'CTA headline' },
      description: { type: 'string', required: false, description: 'Supporting description' },
      primaryCta: { type: 'object', required: true, description: 'Primary CTA button config' },
      secondaryCta: { type: 'object', required: false, description: 'Secondary CTA button config' },
      variant: { type: 'string', required: false, default: 'banner', description: 'Variant: banner, card, inline' }
    }
  },

  'form-section': {
    id: 'form-section',
    name: 'Form Section',
    category: 'interactive-engagement',
    description: 'Capture user information',
    useCases: [
      'Lead capture',
      'Contact forms',
      'Newsletter signups',
      'Demo requests',
      'Custom data collection'
    ],
    tags: ['form', 'input', 'contact', 'lead-capture'],
    props: {
      title: { type: 'string', required: true, description: 'Form title' },
      fields: { type: 'array', required: true, description: 'Array of form field definitions' },
      submitText: { type: 'string', required: false, default: 'Submit', description: 'Submit button text' },
      formType: { type: 'string', required: false, description: 'Form type: contact, lead, newsletter, custom' }
    }
  },

  'quiz-interactive': {
    id: 'quiz-interactive',
    name: 'Interactive Quiz',
    category: 'interactive-engagement',
    description: 'Interactive quiz or assessment',
    useCases: [
      'Product recommendations',
      'Needs assessment',
      'Engagement tools',
      'Qualification flows'
    ],
    tags: ['quiz', 'interactive', 'assessment', 'engagement'],
    props: {
      title: { type: 'string', required: true, description: 'Quiz title' },
      questions: { type: 'array', required: true, description: 'Array of quiz questions' },
      resultCalculator: { type: 'string', required: false, description: 'Result calculation method: score, segment, recommendation' }
    }
  },

  // ============================================
  // CATEGORY: Data & Analytics
  // ============================================

  'chart-display': {
    id: 'chart-display',
    name: 'Chart Display',
    category: 'data-analytics',
    description: 'Visualize data with charts and graphs',
    useCases: [
      'Performance dashboards',
      'Trend visualizations',
      'Data comparisons',
      'Analytics displays'
    ],
    tags: ['chart', 'graph', 'data', 'visualization'],
    props: {
      chartType: { type: 'string', required: true, description: 'Chart type: line, bar, pie, area, radar' },
      data: { type: 'object', required: true, description: 'Chart data object' },
      title: { type: 'string', required: false, description: 'Chart title' },
      description: { type: 'string', required: false, description: 'Chart description' }
    }
  },

  'metric-card': {
    id: 'metric-card',
    name: 'Metric Card',
    category: 'data-analytics',
    description: 'Display a single key metric with context',
    useCases: [
      'Dashboard KPIs',
      'Performance indicators',
      'Business metrics',
      'Progress tracking'
    ],
    tags: ['metric', 'kpi', 'dashboard', 'statistic'],
    props: {
      value: { type: 'string|number', required: true, description: 'Metric value' },
      label: { type: 'string', required: true, description: 'Metric label' },
      change: { type: 'number', required: false, description: 'Percentage change' },
      trend: { type: 'string', required: false, description: 'Trend direction: up, down, neutral' },
      description: { type: 'string', required: false, description: 'Metric description' }
    }
  },

  // ============================================
  // CATEGORY: Technical & Detailed
  // ============================================

  'tech-spec-table': {
    id: 'tech-spec-table',
    name: 'Technical Specifications Table',
    category: 'technical-detailed',
    description: 'Display technical specifications and requirements',
    useCases: [
      'System requirements',
      'API documentation',
      'Product specifications',
      'Technical details'
    ],
    tags: ['technical', 'specs', 'requirements', 'details'],
    props: {
      specs: { type: 'array', required: true, description: 'Array of specification objects' },
      grouped: { type: 'boolean', required: false, default: false, description: 'Group specs by category' }
    }
  },

  'code-snippet': {
    id: 'code-snippet',
    name: 'Code Snippet',
    category: 'technical-detailed',
    description: 'Display code examples with syntax highlighting',
    useCases: [
      'API examples',
      'Integration code',
      'Configuration samples',
      'Technical documentation'
    ],
    tags: ['code', 'snippet', 'example', 'programming'],
    props: {
      code: { type: 'string', required: true, description: 'Code content' },
      language: { type: 'string', required: true, description: 'Programming language' },
      title: { type: 'string', required: false, description: 'Snippet title' },
      showLineNumbers: { type: 'boolean', required: false, default: true, description: 'Show line numbers' }
    }
  },

  'api-reference': {
    id: 'api-reference',
    name: 'API Reference',
    category: 'technical-detailed',
    description: 'Document API endpoints and parameters',
    useCases: [
      'API documentation',
      'Developer resources',
      'Integration guides',
      'Technical references'
    ],
    tags: ['api', 'documentation', 'endpoint', 'reference'],
    props: {
      endpoint: { type: 'string', required: true, description: 'API endpoint path' },
      method: { type: 'string', required: true, description: 'HTTP method: GET, POST, PUT, DELETE, PATCH' },
      description: { type: 'string', required: true, description: 'Endpoint description' },
      parameters: { type: 'array', required: true, description: 'Array of parameter objects' },
      response: { type: 'object', required: true, description: 'Response structure' }
    }
  },

  // ============================================
  // CATEGORY: Navigation & Guidance
  // ============================================

  'faq-accordion': {
    id: 'faq-accordion',
    name: 'FAQ Accordion',
    category: 'navigation-guidance',
    description: 'Collapsible FAQ section',
    useCases: [
      'Common questions',
      'Support documentation',
      'Clarifications',
      'Self-service help'
    ],
    tags: ['faq', 'questions', 'answers', 'help'],
    props: {
      faqs: { type: 'array', required: true, description: 'Array of FAQ objects with question and answer' },
      defaultExpanded: { type: 'array', required: false, description: 'Indices of FAQs to show open by default' }
    }
  },

  'step-by-step': {
    id: 'step-by-step',
    name: 'Step-by-Step Guide',
    category: 'navigation-guidance',
    description: 'Guide users through a process',
    useCases: [
      'Onboarding flows',
      'Setup instructions',
      'Process guides',
      'Tutorial steps'
    ],
    tags: ['steps', 'guide', 'tutorial', 'process'],
    props: {
      steps: { type: 'array', required: true, description: 'Array of step objects with title, description, icon, link' },
      variant: { type: 'string', required: false, default: 'vertical', description: 'Variant: vertical, horizontal, numbered' }
    }
  },

  'related-content': {
    id: 'related-content',
    name: 'Related Content',
    category: 'navigation-guidance',
    description: 'Suggest related pages or topics',
    useCases: [
      'Content discovery',
      'Cross-linking',
      'Exploration encouragement',
      'Related topics'
    ],
    tags: ['related', 'suggestions', 'navigation', 'discovery'],
    props: {
      items: { type: 'array', required: true, description: 'Array of related content items' },
      title: { type: 'string', required: false, default: 'Related Content', description: 'Section title' }
    }
  },

  // ============================================
  // CATEGORY: Media & Visual
  // ============================================

  'image-gallery': {
    id: 'image-gallery',
    name: 'Image Gallery',
    category: 'media-visual',
    description: 'Display multiple images in a gallery',
    useCases: [
      'Product showcases',
      'Screenshot galleries',
      'Design portfolios',
      'Visual examples'
    ],
    tags: ['images', 'gallery', 'photos', 'visual'],
    props: {
      images: { type: 'array', required: true, description: 'Array of image objects with url, alt, caption' },
      layout: { type: 'string', required: false, default: 'grid', description: 'Layout: grid, masonry, carousel' }
    }
  },

  'video-embed': {
    id: 'video-embed',
    name: 'Video Embed',
    category: 'media-visual',
    description: 'Embed video content (YouTube, Vimeo, etc.)',
    useCases: [
      'Product demos',
      'Tutorial videos',
      'Customer testimonials',
      'Explainer content'
    ],
    tags: ['video', 'embed', 'youtube', 'vimeo'],
    props: {
      url: { type: 'string', required: true, description: 'Video URL' },
      title: { type: 'string', required: false, description: 'Video title' },
      autoplay: { type: 'boolean', required: false, default: false, description: 'Auto-play video' },
      aspectRatio: { type: 'string', required: false, default: '16:9', description: 'Aspect ratio: 16:9, 4:3, 1:1' }
    }
  },

  // ============================================
  // CATEGORY: Alerts & Messaging
  // ============================================

  'alert-banner': {
    id: 'alert-banner',
    name: 'Alert Banner',
    category: 'alerts-messaging',
    description: 'Display important messages or announcements',
    useCases: [
      'Announcements',
      'System messages',
      'Important notices',
      'Status updates'
    ],
    tags: ['alert', 'banner', 'notification', 'message'],
    props: {
      message: { type: 'string', required: true, description: 'Alert message' },
      type: { type: 'string', required: false, default: 'info', description: 'Alert type: info, warning, success, error' },
      dismissible: { type: 'boolean', required: false, default: true, description: 'Can be dismissed' },
      icon: { type: 'string', required: false, description: 'Custom icon' }
    }
  },

  'notification-card': {
    id: 'notification-card',
    name: 'Notification Card',
    category: 'alerts-messaging',
    description: 'Highlight time-sensitive information',
    useCases: [
      'New feature announcements',
      'Limited-time offers',
      'Event notifications',
      'System updates'
    ],
    tags: ['notification', 'card', 'announcement', 'update'],
    props: {
      title: { type: 'string', required: true, description: 'Notification title' },
      message: { type: 'string', required: true, description: 'Notification message' },
      type: { type: 'string', required: false, default: 'announcement', description: 'Type: announcement, update, promotion' },
      ctaText: { type: 'string', required: false, description: 'Call-to-action text' }
    }
  }
}

/**
 * Get component by ID
 */
export function getComponent(componentId: string): ComponentRegistryEntry | null {
  return COMPONENT_REGISTRY[componentId] || null
}

/**
 * Get all components in a category
 */
export function getComponentsByCategory(category: ComponentCategory): ComponentRegistryEntry[] {
  return Object.values(COMPONENT_REGISTRY).filter(c => c.category === category)
}

/**
 * Search components by tags
 */
export function searchComponentsByTags(tags: string[]): ComponentRegistryEntry[] {
  const tagSet = new Set(tags.map(t => t.toLowerCase()))
  return Object.values(COMPONENT_REGISTRY).filter(component =>
    component.tags.some(tag => tagSet.has(tag.toLowerCase()))
  )
}

/**
 * Get component registry for LLM prompt
 * Returns a formatted string with all component metadata
 */
export function getComponentRegistryForPrompt(): string {
  const components = Object.values(COMPONENT_REGISTRY).map(component => ({
    id: component.id,
    name: component.name,
    category: component.category,
    description: component.description,
    useCases: component.useCases,
    tags: component.tags,
    props: Object.entries(component.props).map(([name, def]) => ({
      name,
      type: def.type,
      required: def.required,
      description: def.description
    }))
  }))

  return JSON.stringify(components, null, 2)
}

/**
 * Validate that a component exists in the registry
 */
export function validateComponent(componentType: string): boolean {
  return componentType in COMPONENT_REGISTRY
}

/**
 * Get component count by category
 */
export function getComponentCounts(): Record<ComponentCategory, number> {
  const counts: Partial<Record<ComponentCategory, number>> = {}

  Object.values(COMPONENT_REGISTRY).forEach(component => {
    counts[component.category] = (counts[component.category] || 0) + 1
  })

  return counts as Record<ComponentCategory, number>
}
