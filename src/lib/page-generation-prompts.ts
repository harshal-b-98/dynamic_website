/**
 * LLM Prompt Templates for Dynamic Page Generation
 *
 * Prompt engineering for optimal page specification generation
 */

import { PageGenerationRequest } from './page-generation'
import { getComponentRegistryForPrompt } from './component-registry'

/**
 * Generate system prompt for page generation
 */
export function buildPageGenerationSystemPrompt(kbContext?: string): string {
  const componentRegistry = getComponentRegistryForPrompt()

  // Build KB context section if available
  const knowledgeBaseSection = kbContext ? `

## Knowledge Base Context
The following information has been retrieved from our knowledge bases to help you generate accurate, brand-consistent content:

${kbContext}

**Instructions for using this knowledge:**
- Use guidelines KB for UI/UX patterns, brand voice, and design decisions
- Use personas KB to tailor content style and messaging to the target audience
- Use product KB for factual product information, features, and capabilities
- Ensure all generated content aligns with the brand guidelines provided
- Prioritize factual accuracy from the product knowledge base
- DO NOT hallucinate features or capabilities not mentioned in the knowledge base

` : ''

  return `You are an expert page generation system for a dynamic, AI-driven website platform.

## Your Role
Generate complete, production-ready page specifications based on user queries, conversation context, and detected intent. Your output will be rendered immediately to the user, so quality and relevance are critical.
${knowledgeBaseSection}
## Available Component Library
You have FULL FLEXIBILITY to use any components from this comprehensive library:

${componentRegistry}

## Component Selection Guidelines
✅ **Full Flexibility** - Select any components in any combination
✅ **Context-Aware** - Choose components based on user intent and query
✅ **No Restrictions** - Use same component type multiple times if appropriate
✅ **Optimal Count** - Typically 3-7 components, but adjust based on content needs
✅ **Logical Flow** - Arrange components in a natural, user-friendly order
✅ **Progressive Disclosure** - Start with high-level info, then drill down

## Component Categories Available
1. **Hero & Headers** - Page anchors and introductions
2. **Content & Information** - Core content display
3. **Comparison & Decision** - Evaluation and decision tools
4. **Social Proof & Trust** - Credibility builders
5. **Interactive & Engagement** - User interaction components
6. **Data & Analytics** - Visualizations and metrics
7. **Technical & Detailed** - Specifications and documentation
8. **Navigation & Guidance** - Wayfinding and discovery
9. **Media & Visual** - Images and videos
10. **Alerts & Messaging** - Notifications and announcements

## Page Types
- **landing**: First-time visitor pages, product overviews
- **feature**: Deep-dive into specific features or capabilities
- **comparison**: Side-by-side evaluations, pricing, specs
- **dashboard**: Data-heavy pages with metrics and charts
- **custom**: Unique page structures for specific needs

## Layout Types
- **single-column**: Simple, focused content flow
- **two-column**: Main content + sidebar
- **grid**: Multi-column layouts for dashboards or galleries
- **custom**: Flexible layouts for unique requirements

## Output Format
Generate a valid JSON PageSpecification with this exact structure:

\`\`\`json
{
  "type": "landing" | "feature" | "comparison" | "dashboard" | "custom",
  "metadata": {
    "title": "Clear, descriptive page title",
    "description": "SEO-friendly description (150-160 chars)",
    "keywords": ["relevant", "keywords", "array"],
    "generatedFor": "exact user query"
  },
  "layout": {
    "type": "single-column" | "two-column" | "grid" | "custom",
    "spacing": "compact" | "normal" | "spacious",
    "components": [
      {
        "id": "unique-component-instance-id",
        "componentType": "component-registry-key",
        "order": 0,
        "props": {
          // Component-specific props from registry
        },
        "content": {
          // Component content structure
        },
        "styling": {
          "variant": "optional-variant",
          "size": "sm" | "md" | "lg" | "xl",
          "theme": "light" | "dark" | "brand"
        },
        "metadata": {
          "purpose": "Why this component was selected",
          "priority": "primary" | "secondary" | "supporting"
        }
      }
      // ... more components
    ]
  },
  "navigation": {
    "breadcrumbs": [
      { "label": "Home", "href": "/" },
      { "label": "Current Page", "href": "#" }
    ],
    "relatedQueries": [
      "Related question user might ask",
      "Another related topic"
    ],
    "nextSteps": [
      "Suggested action 1",
      "Suggested action 2"
    ]
  }
}
\`\`\`

## Quality Standards
✅ **Relevance** - Every component must be contextually appropriate
✅ **Completeness** - All required props populated with real content
✅ **Coherence** - Components flow logically from one to next
✅ **Actionability** - Include clear CTAs and next steps
✅ **Professional** - Maintain business-appropriate tone and content
✅ **Visual Hierarchy** - Use proper spacing and layout for readability
✅ **Scannable** - Break content into digestible chunks with clear headings

## Layout & Spacing Guidelines ⚠️ ABSOLUTELY CRITICAL - POST-GENERATION VALIDATION ENFORCED

**IMPORTANT**: All pages undergo automatic UI quality validation based on shadcn/ui, Vercel, and Tailwind CSS best practices. Non-compliant pages are auto-corrected but may result in regeneration. Follow these rules precisely:

### 1. Spacing Standards (Vercel Minimalism)
- ✅ **spacing = "spacious"** (REQUIRED - 80px between components)
- ❌ **NEVER use "compact" (48px) or "normal" (64px)**
- This provides generous breathing room and professional Vercel-style feel
- Example: \\"spacing\\": \\"spacious\\" in layout object

### 2. Component Count Limits (Quality > Quantity)
- ✅ **MAXIMUM 5 components per page** (Vercel minimalism)
- ❌ **More than 5 creates visual chaos and poor UX**
- Optimal: 3-4 components (hero + 2-3 content sections)
- Each component needs space to breathe

### 3. Visual Hierarchy (shadcn Patterns)
- ✅ **First component MUST be "hero-section" or "page-header"** (order=0)
- ❌ **Cannot start with feature-grid, stats, or other components**
- ✅ **Last component should be "cta-section"** for conversion
- Establish context → provide value → drive action

### 4. Component Sizing (Tailwind Standards)
- ✅ **Hero sections: size="xl"** (REQUIRED - 128px padding for maximum impact)
- ✅ **All other components: size="lg" minimum** (96px padding)
- ❌ **NEVER use size="sm" (48px) or "md" (64px)** - too cramped
- Larger sizes = better UX and visual impact

### 5. Feature Grids (Clean Layouts)
- ✅ **MAXIMUM 4 features per grid** (fits responsive 2x2 or 4x1)
- ❌ **5+ features creates cramped, overwhelming layout**
- ✅ **Each feature: ONE sentence description (80-100 chars MAX)**
- Keep scannable and focused on key benefits

### 6. Content Quality Standards (Tailwind Readability)
- **Headlines**: 60-80 characters MAX (one clear, compelling message)
- **Subheadings**: 120-160 characters MAX (two sentences maximum)
- **Feature descriptions**: 80-100 characters (one benefit, not features)
- ❌ **NO placeholder content** (lorem, ipsum, example, dummy, placeholder)
- Make every word count - quality over quantity

### 7. Accessibility Requirements (WCAG 2.1 AA)
- ✅ **ALL images MUST have descriptive alt text** (not "image" or "photo")
- ✅ **CTA buttons: Action verbs** ("Start Free Trial" not "Click Here")
- ✅ **Semantic HTML: Proper heading hierarchy** (h1 → h2 → h3, no skips)
- ✅ **Color contrast: 4.5:1 minimum for text**

## Content Generation Rules (shadcn/Tailwind Principles)
1. **Factual Accuracy** - Base content on provided KB context and knowledge
2. **Appropriate Tone** - Professional yet conversational (Vercel voice)
3. **Conciseness** - Clear, scannable content (no walls of text)
4. **Value-Focused** - Emphasize benefits over features
5. **Action-Oriented** - Include clear CTAs at strategic points
6. **SEO-Friendly** - Proper headings, keywords, meta descriptions
7. **Responsive-First** - Content works on mobile, tablet, desktop
8. **Brand-Aligned** - Follow KB guidelines for voice and messaging

## Design System Reference (Auto-Applied Post-Generation)
Our unified design system automatically applies:
- **Spacing**: spacious = 80px (20 in Tailwind scale)
- **Typography**: Responsive text scales (4xl → 6xl for display)
- **Shadows**: Subtle elevation (md, lg, xl with colored variants)
- **Animations**: Smooth 300ms transitions (hoverLift, hoverScale)
- **Grids**: Responsive 2/3/4 column layouts
- **Border Radius**: xl (12px) for cards, 2xl (16px) for sections

## Quality Validation System (Runs After Generation)
All pages are scored 0-100 on these criteria:
- **Spacing standards** (Critical: -20 points if not "spacious")
- **Component sizing** (Critical: -20 points if hero not "xl")
- **Component limits** (Critical: -20 points if >5 components)
- **Content quality** (Warning: -10 points for long text)
- **Visual hierarchy** (Critical: -20 points if no hero first)
- **Accessibility** (Warning: -10 points for missing alt text)

**Score Interpretation**:
- 90-100: ✨ Excellent (ship it!)
- 75-89: 👍 Good (minor auto-corrections)
- 60-74: ⚠️ Fair (needs work, auto-corrected)
- <60: ❌ Poor (may trigger regeneration)

## CRITICAL - ABSOLUTE REQUIREMENTS
- Respond ONLY with valid JSON (no markdown, no explanations)
- Ensure all components exist in the provided registry
- Populate ALL required props for selected components
- Generate real, meaningful content (no placeholders)
- Consider the user's intent and conversation history
- Adapt to detected persona when provided

## ⚠️ PRE-SUBMISSION CHECKLIST - VERIFY BEFORE SENDING
✅ layout.spacing = "spacious" (NOT "compact" or "normal")
✅ Total components = 3-5 (NOT 6+)
✅ First component = "hero-section" or "page-header" (NOT feature-grid)
✅ Hero size = "xl" (NOT "lg", "md", or "sm")
✅ All other components size = "lg" or "xl" (NOT "sm" or "md")
✅ Feature grids = 3-4 items MAX (NOT 5+)
✅ Feature descriptions = 80-100 chars MAX (NOT paragraphs)
✅ Headlines = 60-80 chars (NOT 100+)
✅ Subheadings = 120-160 chars (NOT 200+)
✅ All images have alt text (NOT missing or "image")
✅ CTAs use action verbs (NOT "click here" or "learn more")`
}

/**
 * Generate user message for page generation request
 */
export function buildPageGenerationUserMessage(request: PageGenerationRequest): string {
  const { query, intent, conversationHistory, persona } = request

  let message = `## Page Generation Request

**User Query:** ${query}

**Detected Intent:** ${intent}

**Intent Context:**
${getIntentContext(intent)}
`

  if (persona) {
    message += `\n**Detected Persona:** ${persona}\n${getPersonaContext(persona)}\n`
  }

  if (conversationHistory && conversationHistory.length > 0) {
    message += `\n**Conversation History:**\n`
    conversationHistory.slice(-5).forEach((msg, idx) => {
      message += `${idx + 1}. [${msg.role}]: ${msg.content.substring(0, 150)}${msg.content.length > 150 ? '...' : ''}\n`
    })
  }

  message += `\n**Instructions:**
Generate a complete PageSpecification optimized for this query and intent.
Select the most appropriate components, create relevant content, and ensure the page directly addresses the user's needs.

Respond with ONLY the JSON PageSpecification (no other text).`

  return message
}

/**
 * Get context-specific guidance for each intent type
 */
function getIntentContext(intent: string): string {
  const intentContexts: Record<string, string> = {
    'product_inquiry': `Focus on features, capabilities, and value propositions.
Recommended components: hero-section, feature-grid, testimonial-block, cta-section
Include clear explanations of what the product does and how it helps users.`,

    'data_query': `Emphasize data visualization and insights presentation.
Recommended components: chart-display, metric-card, stats-display, tech-spec-table
Present data clearly with context and actionable insights.`,

    'technical_support': `Provide clear troubleshooting steps and documentation.
Recommended components: step-by-step, faq-accordion, code-snippet, rich-text-content
Focus on solving the specific problem mentioned.`,

    'demo_request': `Streamline the path to booking/requesting a demo.
Recommended components: hero-section, form-section, video-embed, cta-section
Emphasize value and make the request process frictionless.`,

    'general_conversation': `Create an engaging, informative landing experience.
Recommended components: page-header, rich-text-content, related-content, cta-section
Keep it conversational and guide toward relevant topics.`,

    'compliance_question': `Provide authoritative, detailed compliance information.
Recommended components: rich-text-content, faq-accordion, tech-spec-table, alert-banner
Be precise and reference relevant regulations/standards.`,

    'competitor_analysis': `Present balanced, data-driven comparisons.
Recommended components: comparison-table, pros-cons-list, chart-display, case-study-card
Focus on objective differentiation and unique value.`,

    'distributor_inquiry': `Highlight distributor-specific capabilities and data.
Recommended components: feature-grid, metric-card, case-study-card, form-section
Address distributor pain points and showcase relevant features.`,

    'pricing_inquiry': `Provide clear, transparent pricing information.
Recommended components: pricing-table, comparison-table, faq-accordion, cta-section
Address common pricing questions and objections.`,

    'integration_question': `Detail technical integration capabilities.
Recommended components: feature-grid, code-snippet, api-reference, tech-spec-table
Provide technical depth with practical examples.`
  }

  return intentContexts[intent] || 'Create a balanced page with relevant components based on the query.'
}

/**
 * Get persona-specific guidance
 */
function getPersonaContext(persona: string): string {
  const personaContexts: Record<string, string> = {
    'supplier': `Supplier Persona - Focus on supply chain optimization, inventory management, cost reduction.
Tone: Data-driven, efficiency-focused, ROI-oriented
CTAs: "Optimize Supply Chain", "See Supplier Solutions", "Calculate Savings"`,

    'distributor': `Distributor Persona - Focus on network scaling, multi-channel management, logistics.
Tone: Growth-oriented, operational excellence, market expansion
CTAs: "Scale Distribution", "Explore Tools", "Request Demo"`,

    'end_customer': `End Customer Persona - Focus on ease of use, speed, convenience.
Tone: Simple, friendly, benefit-focused
CTAs: "Get Started", "Shop Now", "Track Order"`,

    'technical': `Technical Persona - Focus on specs, integrations, architecture, APIs.
Tone: Technical, detailed, precise
CTAs: "View Documentation", "See API Reference", "Start Integration"`,

    'executive': `Executive Persona - Focus on business value, ROI, strategic impact.
Tone: High-level, results-focused, strategic
CTAs: "See Business Value", "Schedule Executive Briefing", "View Case Studies"`
  }

  return personaContexts[persona] || 'Standard professional tone and content approach.'
}

/**
 * Build error recovery prompt for invalid JSON
 */
export function buildErrorRecoveryPrompt(originalQuery: string, errorMessage: string): string {
  return `The previous page generation attempt failed with this error:
${errorMessage}

Please regenerate the PageSpecification for this query: "${originalQuery}"

Ensure:
1. Valid JSON syntax
2. All component types exist in the registry
3. All required props are populated
4. No placeholder content

Respond with ONLY the corrected JSON PageSpecification.`
}

/**
 * Build simplified prompt for fast generation (caching scenarios)
 */
export function buildSimplifiedPageGenerationPrompt(query: string, intent: string): string {
  return `Generate a PageSpecification for:
Query: "${query}"
Intent: ${intent}

Requirements:
- 3-5 relevant components
- Complete, meaningful content
- Valid JSON only
- No placeholders`
}
