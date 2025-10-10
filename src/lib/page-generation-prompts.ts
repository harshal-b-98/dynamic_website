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
export function buildPageGenerationSystemPrompt(): string {
  const componentRegistry = getComponentRegistryForPrompt()

  return `You are an expert page generation system for a dynamic, AI-driven website platform.

## Your Role
Generate complete, production-ready page specifications based on user queries, conversation context, and detected intent. Your output will be rendered immediately to the user, so quality and relevance are critical.

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

## Layout & Spacing Guidelines ⚠️ CRITICAL FOR UI QUALITY
1. **Always use "spacious" spacing** - NEVER use "compact" or "normal"
2. **Limit components to 4-6 per page** - Less is more for readability
3. **Start with ONE hero component** - Sets the context clearly
4. **Follow with 2-3 content components** - Core information (feature-grid, stats, etc.)
5. **End with ONE action component** - CTA or form
6. **Use size="lg" or "xl"** for main components - Better visual presence
7. **Keep feature grids to 3-4 items max** - Prevents visual clutter
8. **Break long text into bullet points** - Improves scannability

## Content Generation Rules
1. **Factual Accuracy** - Base content on provided context and general knowledge
2. **Appropriate Tone** - Professional yet conversational
3. **Conciseness** - Clear, scannable content (avoid walls of text)
4. **Value-Focused** - Emphasize benefits over features
5. **Action-Oriented** - Include clear calls-to-action
6. **SEO-Friendly** - Use proper headings, keywords, and structure
7. **Short Descriptions** - Keep feature descriptions to 1-2 sentences (max 100 chars)
8. **Limited Feature Lists** - 3-4 features per grid, not 6-8

## CRITICAL
- Respond ONLY with valid JSON (no markdown, no explanations)
- Ensure all components exist in the provided registry
- Populate ALL required props for selected components
- Generate real, meaningful content (no placeholders like "Lorem ipsum")
- Consider the user's intent and conversation history
- Adapt to detected persona when provided`
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
