/**
 * Persona Taxonomy
 *
 * Defines the comprehensive taxonomy of user personas for classification and personalization.
 * Each persona includes indicators, keywords, and personalization preferences.
 */

export type PersonaId =
  | 'smb_owner'
  | 'enterprise_buyer'
  | 'technical_evaluator'
  | 'marketing_manager'
  | 'product_manager'
  | 'student_learner'
  | 'competitor_researcher'
  | 'returning_customer'
  | 'unknown'

export interface PersonaIndicators {
  /** Conversation patterns that indicate this persona */
  conversationPatterns: string[]

  /** Behavioral signals (clicks, time on page, etc.) */
  behavioralSignals: string[]

  /** Contextual clues (referrer, device, time of day, etc.) */
  contextualClues: string[]

  /** Priority keywords strongly associated with this persona */
  priorityKeywords: string[]

  /** Negative indicators (patterns that suggest NOT this persona) */
  negativeIndicators: string[]
}

export interface PersonalizationPreferences {
  /** Preferred tone of communication */
  tone: 'professional' | 'casual' | 'technical' | 'friendly' | 'educational'

  /** Preferred content focus */
  contentFocus: string[]

  /** Preferred CTA style */
  ctaStyle: 'action' | 'informational' | 'social-proof' | 'urgency' | 'value'

  /** Preferred messaging emphasis */
  messagingEmphasis: string[]

  /** Preferred examples and use cases */
  exampleTypes: string[]
}

export interface PersonaDefinition {
  /** Unique identifier for the persona */
  id: PersonaId

  /** Display name */
  name: string

  /** Short description */
  description: string

  /** Detailed characteristics */
  characteristics: string[]

  /** Primary goals and motivations */
  goals: string[]

  /** Pain points and challenges */
  painPoints: string[]

  /** Detection indicators */
  indicators: PersonaIndicators

  /** Minimum confidence threshold for classification (0-100) */
  confidenceThreshold: number

  /** Personalization preferences */
  preferences: PersonalizationPreferences

  /** Priority order (lower = higher priority when confidence is similar) */
  priority: number

  /** Typical journey stage */
  typicalStage: 'awareness' | 'consideration' | 'decision' | 'retention'
}

/**
 * Complete Persona Taxonomy
 */
export const PERSONA_TAXONOMY: Record<PersonaId, PersonaDefinition> = {
  smb_owner: {
    id: 'smb_owner',
    name: 'SMB Owner',
    description: 'Small/medium business owner looking for affordable, easy-to-implement solutions',
    characteristics: [
      'Budget-conscious',
      'Values quick implementation',
      'Wears multiple hats',
      'Practical and results-focused',
      'Limited technical resources',
    ],
    goals: [
      'Grow business efficiently',
      'Save time and money',
      'Implement quickly without technical overhead',
      'Scale as business grows',
    ],
    painPoints: [
      'Limited budget',
      'No dedicated IT team',
      'Need immediate ROI',
      'Time constraints',
      'Complex solutions overwhelming',
    ],
    indicators: {
      conversationPatterns: [
        'how much does it cost',
        'affordable',
        'easy to use',
        'quick setup',
        'no technical team',
        'small business',
        'startup',
        'can I do this myself',
        'pricing',
        'free trial',
      ],
      behavioralSignals: [
        'spends time on pricing page',
        'views getting started guides',
        'checks for self-service options',
        'short session times (busy)',
        'mobile usage (on-the-go)',
      ],
      contextualClues: [
        'referrer from SMB-focused sites',
        'searches for "affordable" solutions',
        'business hours access',
        'small company domain',
      ],
      priorityKeywords: [
        'affordable',
        'cost-effective',
        'easy',
        'simple',
        'quick',
        'small business',
        'startup',
        'budget',
        'DIY',
        'self-service',
      ],
      negativeIndicators: [
        'enterprise requirements',
        'complex integration needs',
        'mentions large team',
        'compliance requirements',
      ],
    },
    confidenceThreshold: 70,
    preferences: {
      tone: 'friendly',
      contentFocus: ['pricing', 'ease-of-use', 'quick-wins', 'ROI', 'testimonials'],
      ctaStyle: 'value',
      messagingEmphasis: ['affordability', 'simplicity', 'speed', 'practical-benefits'],
      exampleTypes: ['small-business-success', 'quick-implementation', 'cost-savings'],
    },
    priority: 3,
    typicalStage: 'consideration',
  },

  enterprise_buyer: {
    id: 'enterprise_buyer',
    name: 'Enterprise Buyer',
    description: 'Large organization decision-maker focused on scalability, security, and compliance',
    characteristics: [
      'Security and compliance focused',
      'Needs enterprise-grade features',
      'Long evaluation cycles',
      'Multiple stakeholder involvement',
      'Risk-averse',
    ],
    goals: [
      'Scale across large organization',
      'Ensure security and compliance',
      'Integrate with existing enterprise systems',
      'Long-term partnership',
      'Minimize organizational risk',
    ],
    painPoints: [
      'Complex approval processes',
      'Security and compliance requirements',
      'Legacy system integration',
      'Change management',
      'Vendor evaluation overhead',
    ],
    indicators: {
      conversationPatterns: [
        'enterprise',
        'scalability',
        'security',
        'compliance',
        'SSO',
        'SAML',
        'SOC 2',
        'GDPR',
        'integration',
        'API',
        'SLA',
        'support tier',
        'custom contract',
        'procurement',
      ],
      behavioralSignals: [
        'extended session times',
        'multiple return visits',
        'views security/compliance pages',
        'downloads enterprise resources',
        'requests demo or consultation',
      ],
      contextualClues: [
        'large company domain',
        'enterprise referrer',
        'business hours access from corporate network',
        'searches for "enterprise" solutions',
      ],
      priorityKeywords: [
        'enterprise',
        'scalability',
        'security',
        'compliance',
        'integration',
        'SSO',
        'SAML',
        'SLA',
        'support',
        'custom',
        'procurement',
        'SOC 2',
        'GDPR',
        'HIPAA',
      ],
      negativeIndicators: [
        'mentions individual use',
        'free tier interest',
        'DIY approach',
        'quick implementation needed',
      ],
    },
    confidenceThreshold: 75,
    preferences: {
      tone: 'professional',
      contentFocus: ['security', 'scalability', 'compliance', 'integrations', 'case-studies'],
      ctaStyle: 'action',
      messagingEmphasis: ['reliability', 'security', 'scale', 'enterprise-support'],
      exampleTypes: ['enterprise-case-studies', 'compliance-stories', 'integration-examples'],
    },
    priority: 1,
    typicalStage: 'consideration',
  },

  technical_evaluator: {
    id: 'technical_evaluator',
    name: 'Technical Evaluator',
    description: 'Developer, architect, or engineer evaluating technical capabilities and implementation',
    characteristics: [
      'Technically proficient',
      'Detail-oriented',
      'Values documentation',
      'Skeptical of marketing claims',
      'Hands-on evaluation approach',
    ],
    goals: [
      'Understand technical architecture',
      'Evaluate API capabilities',
      'Assess integration complexity',
      'Verify performance claims',
      'Test before recommending',
    ],
    painPoints: [
      'Poor documentation',
      'Limited API capabilities',
      'Black-box solutions',
      'Performance issues',
      'Vendor lock-in',
    ],
    indicators: {
      conversationPatterns: [
        'API',
        'documentation',
        'SDK',
        'webhook',
        'REST',
        'GraphQL',
        'technical specs',
        'architecture',
        'latency',
        'performance',
        'self-hosted',
        'open source',
        'GitHub',
        'code example',
      ],
      behavioralSignals: [
        'views API documentation',
        'checks GitHub repositories',
        'tests sandbox/demo',
        'long session times on technical pages',
        'views code examples',
      ],
      contextualClues: [
        'developer referrer sites',
        'technical search terms',
        'Stack Overflow referrer',
        'GitHub referrer',
      ],
      priorityKeywords: [
        'API',
        'SDK',
        'documentation',
        'technical',
        'architecture',
        'performance',
        'latency',
        'webhook',
        'REST',
        'GraphQL',
        'integration',
        'code',
        'developer',
      ],
      negativeIndicators: [
        'no technical questions',
        'focuses only on price',
        'mentions no coding skills',
        'avoids technical pages',
      ],
    },
    confidenceThreshold: 72,
    preferences: {
      tone: 'technical',
      contentFocus: ['API-docs', 'architecture', 'code-examples', 'performance', 'integrations'],
      ctaStyle: 'informational',
      messagingEmphasis: ['technical-depth', 'flexibility', 'performance', 'documentation'],
      exampleTypes: ['code-samples', 'architecture-diagrams', 'API-examples'],
    },
    priority: 2,
    typicalStage: 'consideration',
  },

  marketing_manager: {
    id: 'marketing_manager',
    name: 'Marketing Manager',
    description: 'Marketing professional focused on conversion, analytics, and ROI',
    characteristics: [
      'Data-driven',
      'Conversion-focused',
      'ROI-conscious',
      'Campaign-oriented',
      'Values analytics and reporting',
    ],
    goals: [
      'Increase conversion rates',
      'Improve lead quality',
      'Track and measure ROI',
      'Optimize campaigns',
      'Generate actionable insights',
    ],
    painPoints: [
      'Difficulty attributing conversions',
      'Limited analytics',
      'Poor integration with marketing stack',
      'Lack of personalization',
      'No A/B testing capabilities',
    ],
    indicators: {
      conversationPatterns: [
        'conversion',
        'analytics',
        'ROI',
        'lead generation',
        'campaign',
        'tracking',
        'attribution',
        'A/B testing',
        'personalization',
        'segmentation',
        'funnel',
        'metrics',
        'dashboard',
      ],
      behavioralSignals: [
        'views analytics features',
        'checks integration with marketing tools',
        'interested in conversion optimization',
        'views case studies with metrics',
        'explores dashboard/reporting features',
      ],
      contextualClues: [
        'marketing site referrer',
        'searches for "conversion" or "analytics"',
        'marketing tools in tech stack',
      ],
      priorityKeywords: [
        'conversion',
        'analytics',
        'ROI',
        'tracking',
        'attribution',
        'campaign',
        'leads',
        'funnel',
        'A/B testing',
        'personalization',
        'segmentation',
        'metrics',
      ],
      negativeIndicators: [
        'purely technical focus',
        'no mention of metrics',
        'developer-only concerns',
      ],
    },
    confidenceThreshold: 70,
    preferences: {
      tone: 'professional',
      contentFocus: ['analytics', 'conversion-optimization', 'ROI', 'case-studies', 'integrations'],
      ctaStyle: 'social-proof',
      messagingEmphasis: ['results', 'data', 'ROI', 'growth'],
      exampleTypes: ['conversion-lift-stories', 'analytics-dashboards', 'campaign-results'],
    },
    priority: 4,
    typicalStage: 'consideration',
  },

  product_manager: {
    id: 'product_manager',
    name: 'Product Manager',
    description: 'PM interested in features, roadmap, and product capabilities',
    characteristics: [
      'Feature-focused',
      'Roadmap-aware',
      'User-centric',
      'Cross-functional thinker',
      'Balances business and technical needs',
    ],
    goals: [
      'Understand product capabilities',
      'Evaluate feature set vs competitors',
      'Assess roadmap alignment',
      'Ensure user needs are met',
      'Integration with product workflow',
    ],
    painPoints: [
      'Feature gaps vs requirements',
      'Unclear product roadmap',
      'Poor user experience',
      'Limited customization',
      'Slow feature development',
    ],
    indicators: {
      conversationPatterns: [
        'features',
        'roadmap',
        'capability',
        'user experience',
        'UX',
        'customization',
        'workflow',
        'use case',
        'requirements',
        'product',
        'functionality',
        'vs competitor',
        'comparison',
      ],
      behavioralSignals: [
        'compares features',
        'views product roadmap',
        'checks use cases',
        'explores customization options',
        'reviews multiple feature pages',
      ],
      contextualClues: [
        'PM-focused referrer',
        'product comparison searches',
        'feature-focused queries',
      ],
      priorityKeywords: [
        'features',
        'roadmap',
        'capabilities',
        'functionality',
        'use case',
        'workflow',
        'product',
        'requirements',
        'customization',
        'comparison',
      ],
      negativeIndicators: [
        'only pricing focus',
        'purely technical details',
        'no feature discussions',
      ],
    },
    confidenceThreshold: 68,
    preferences: {
      tone: 'professional',
      contentFocus: ['features', 'roadmap', 'use-cases', 'comparisons', 'customer-stories'],
      ctaStyle: 'informational',
      messagingEmphasis: ['capabilities', 'flexibility', 'user-value', 'innovation'],
      exampleTypes: ['feature-showcases', 'workflow-examples', 'use-case-stories'],
    },
    priority: 5,
    typicalStage: 'consideration',
  },

  student_learner: {
    id: 'student_learner',
    name: 'Student/Learner',
    description: 'Individual learning about the technology or exploring for educational purposes',
    characteristics: [
      'Learning-focused',
      'Limited budget',
      'Interested in educational resources',
      'Exploratory mindset',
      'Values tutorials and guides',
    ],
    goals: [
      'Learn new technology',
      'Build skills',
      'Complete projects',
      'Explore capabilities',
      'Access free resources',
    ],
    painPoints: [
      'Limited budget',
      'Complex documentation',
      'Lack of beginner-friendly resources',
      'No free tier',
      'Steep learning curve',
    ],
    indicators: {
      conversationPatterns: [
        'tutorial',
        'learn',
        'beginner',
        'free',
        'education',
        'student',
        'course',
        'guide',
        'how to',
        'getting started',
        'example',
        'project',
      ],
      behavioralSignals: [
        'views getting started guides',
        'explores tutorials',
        'checks free tier',
        'spends time on educational content',
        'younger demographic patterns',
      ],
      contextualClues: [
        'educational institution referrer',
        'student email domain',
        'educational search terms',
        'late night/weekend access',
      ],
      priorityKeywords: [
        'learn',
        'tutorial',
        'free',
        'education',
        'beginner',
        'student',
        'course',
        'getting started',
        'guide',
        'example',
      ],
      negativeIndicators: [
        'business use case',
        'enterprise requirements',
        'procurement discussions',
        'commercial focus',
      ],
    },
    confidenceThreshold: 65,
    preferences: {
      tone: 'educational',
      contentFocus: ['tutorials', 'getting-started', 'examples', 'free-resources', 'documentation'],
      ctaStyle: 'informational',
      messagingEmphasis: ['learning', 'simplicity', 'free-access', 'community'],
      exampleTypes: ['step-by-step-tutorials', 'beginner-projects', 'learning-paths'],
    },
    priority: 7,
    typicalStage: 'awareness',
  },

  competitor_researcher: {
    id: 'competitor_researcher',
    name: 'Competitor Researcher',
    description: 'Individual analyzing the competitive landscape or researching alternatives',
    characteristics: [
      'Comparative mindset',
      'Thorough evaluator',
      'Seeks detailed information',
      'May be shopping for alternatives',
      'Feature-focused comparison',
    ],
    goals: [
      'Compare features vs competitors',
      'Understand positioning',
      'Evaluate pricing models',
      'Assess market fit',
      'Make informed decision',
    ],
    painPoints: [
      'Lack of comparison information',
      'Unclear differentiation',
      'Hidden pricing',
      'Difficulty evaluating alternatives',
    ],
    indicators: {
      conversationPatterns: [
        'vs',
        'versus',
        'compared to',
        'alternative',
        'competitor',
        'comparison',
        'better than',
        'difference',
        'why choose',
        'switching',
      ],
      behavioralSignals: [
        'views comparison pages',
        'checks multiple competitor mentions',
        'extensive feature exploration',
        'price comparison behavior',
        'downloads comparison resources',
      ],
      contextualClues: [
        'competitor site referrer',
        'comparison search terms',
        'review site referrer',
      ],
      priorityKeywords: [
        'vs',
        'comparison',
        'alternative',
        'competitor',
        'versus',
        'compare',
        'difference',
        'switch',
        'migrate',
      ],
      negativeIndicators: [
        'no competitor mentions',
        'first-time exploration',
        'greenfield project',
      ],
    },
    confidenceThreshold: 72,
    preferences: {
      tone: 'professional',
      contentFocus: ['comparisons', 'differentiation', 'migration-guides', 'competitive-advantages'],
      ctaStyle: 'social-proof',
      messagingEmphasis: ['differentiation', 'advantages', 'easy-migration', 'value'],
      exampleTypes: ['side-by-side-comparisons', 'migration-stories', 'advantage-showcases'],
    },
    priority: 6,
    typicalStage: 'consideration',
  },

  returning_customer: {
    id: 'returning_customer',
    name: 'Returning Customer',
    description: 'Existing user returning with specific needs or questions',
    characteristics: [
      'Familiar with product',
      'Specific use case',
      'Values efficiency',
      'May need support',
      'Potential for expansion',
    ],
    goals: [
      'Solve specific problem',
      'Learn new features',
      'Get support',
      'Expand usage',
      'Optimize current implementation',
    ],
    painPoints: [
      'Need quick answers',
      'Support access',
      'Feature discovery',
      'Implementation challenges',
    ],
    indicators: {
      conversationPatterns: [
        'account',
        'login',
        'support',
        'help',
        'issue',
        'problem',
        'how do I',
        'feature',
        'update',
        'upgrade',
        'expand',
      ],
      behavioralSignals: [
        'logged in user',
        'multiple return visits',
        'accesses account area',
        'views support/help content',
        'direct URL access (bookmarked)',
      ],
      contextualClues: [
        'returning user cookie',
        'authenticated session',
        'direct traffic (bookmarked)',
        'support portal access',
      ],
      priorityKeywords: [
        'account',
        'support',
        'help',
        'login',
        'dashboard',
        'upgrade',
        'expand',
        'feature',
        'issue',
      ],
      negativeIndicators: [
        'first visit',
        'basic questions about product',
        'pricing research',
      ],
    },
    confidenceThreshold: 80,
    preferences: {
      tone: 'friendly',
      contentFocus: ['support', 'advanced-features', 'updates', 'optimization', 'expansion'],
      ctaStyle: 'action',
      messagingEmphasis: ['efficiency', 'support', 'new-features', 'value-maximization'],
      exampleTypes: ['advanced-use-cases', 'feature-updates', 'optimization-tips'],
    },
    priority: 1,
    typicalStage: 'retention',
  },

  unknown: {
    id: 'unknown',
    name: 'Unknown',
    description: 'Insufficient information to classify persona',
    characteristics: ['Insufficient data', 'Early stage visitor', 'Minimal interaction'],
    goals: ['Explore', 'Discover'],
    painPoints: [],
    indicators: {
      conversationPatterns: [],
      behavioralSignals: [],
      contextualClues: [],
      priorityKeywords: [],
      negativeIndicators: [],
    },
    confidenceThreshold: 0,
    preferences: {
      tone: 'friendly',
      contentFocus: ['general-overview', 'getting-started', 'popular-content'],
      ctaStyle: 'informational',
      messagingEmphasis: ['discovery', 'exploration', 'general-value'],
      exampleTypes: ['general-use-cases', 'overview-content'],
    },
    priority: 10,
    typicalStage: 'awareness',
  },
}

/**
 * Get persona definition by ID
 */
export function getPersonaDefinition(personaId: PersonaId): PersonaDefinition {
  return PERSONA_TAXONOMY[personaId]
}

/**
 * Get all persona IDs (excluding 'unknown')
 */
export function getAllPersonaIds(): PersonaId[] {
  return Object.keys(PERSONA_TAXONOMY).filter(id => id !== 'unknown') as PersonaId[]
}

/**
 * Get all persona definitions (excluding 'unknown')
 */
export function getAllPersonaDefinitions(): PersonaDefinition[] {
  return getAllPersonaIds().map(id => PERSONA_TAXONOMY[id])
}

/**
 * Get default persona (unknown)
 */
export function getDefaultPersona(): PersonaDefinition {
  return PERSONA_TAXONOMY.unknown
}

/**
 * Priority-sorted persona list for classification
 */
export function getPersonasByPriority(): PersonaDefinition[] {
  return getAllPersonaDefinitions().sort((a, b) => a.priority - b.priority)
}
