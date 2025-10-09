/**
 * Intent Classification System for ConsumerIQ
 *
 * Defines intent types for user messages and classification logic
 */

export type IntentType =
  | 'product_inquiry'        // Questions about ConsumerIQ features, pricing, capabilities
  | 'data_query'             // Questions about beverage data, market insights, analytics
  | 'technical_support'      // Help with using the platform, troubleshooting
  | 'demo_request'           // Request for demo, trial, or sales contact
  | 'general_conversation'   // Greetings, casual chat, off-topic
  | 'compliance_question'    // Questions about TTB COLA, regulatory compliance
  | 'competitor_analysis'    // Questions about competitive intelligence, market trends
  | 'distributor_inquiry'    // Questions about distributor performance, tracking
  | 'pricing_inquiry'        // Questions about pricing, packages, costs
  | 'integration_question'   // Questions about data integrations, APIs, connections

export interface IntentClassification {
  intent: IntentType
  confidence: number // 0-1 scale
  reasoning: string  // Why this intent was chosen
  entities: string[] // Extracted entities (product names, locations, etc.)
}

export interface ClassifiedMessage {
  message: string
  classification: IntentClassification
  timestamp: Date
}

/**
 * Intent descriptions for Claude prompt
 */
export const INTENT_DESCRIPTIONS: Record<IntentType, string> = {
  product_inquiry: 'User is asking about ConsumerIQ features, capabilities, how it works, or what it can do',
  data_query: 'User wants specific beverage alcohol data, market insights, analytics, or reports',
  technical_support: 'User needs help using the platform, troubleshooting issues, or technical assistance',
  demo_request: 'User wants to schedule a demo, start a trial, or speak with sales team',
  general_conversation: 'Greetings, casual chat, thank you messages, or off-topic conversation',
  compliance_question: 'User has questions about TTB COLA approvals, regulatory compliance, or legal requirements',
  competitor_analysis: 'User wants competitive intelligence, market trends, or competitor tracking',
  distributor_inquiry: 'User asking about distributor performance, relationships, or distribution analytics',
  pricing_inquiry: 'User wants to know about pricing, packages, costs, or billing',
  integration_question: 'User asking about data integrations, APIs, connectors, or data sources'
}

/**
 * Example messages for each intent (for testing and validation)
 */
export const INTENT_EXAMPLES: Record<IntentType, string[]> = {
  product_inquiry: [
    'What features does ConsumerIQ offer?',
    'How does the predictive intelligence work?',
    'Can ConsumerIQ track COLA approvals?',
    'Tell me about your natural language analytics'
  ],
  data_query: [
    'Show me RTD launches in the last 60 days',
    'Which distributors are underperforming in the Southeast?',
    'What are the top trending categories?',
    'Give me sales data for Q4 2024'
  ],
  technical_support: [
    'How do I upload my distributor data?',
    'I\'m having trouble logging in',
    'My dashboard isn\'t loading',
    'Can you help me set up my account?'
  ],
  demo_request: [
    'I\'d like to schedule a demo',
    'Can I try ConsumerIQ?',
    'Talk to your team about pricing',
    'Let\'s set up a call to discuss'
  ],
  general_conversation: [
    'Hello!',
    'Good morning',
    'Thanks for your help',
    'Have a great day'
  ],
  compliance_question: [
    'How long does COLA approval typically take?',
    'What are the TTB requirements for label changes?',
    'Can you track state licensing status?',
    'Help me understand compliance risks'
  ],
  competitor_analysis: [
    'What new products has Diageo launched?',
    'Show me trending RTD brands',
    'Who are the top players in hard seltzer?',
    'What are competitors doing in the Southeast?'
  ],
  distributor_inquiry: [
    'How is Southern Glazer performing?',
    'Show me distributor health scores',
    'Which distributors have the best execution?',
    'Track my distributor relationships'
  ],
  pricing_inquiry: [
    'How much does ConsumerIQ cost?',
    'What pricing plans do you offer?',
    'Is there a free trial?',
    'What\'s included in the enterprise package?'
  ],
  integration_question: [
    'Can you integrate with VIP data?',
    'What data sources do you support?',
    'How do I connect my retail scan data?',
    'Do you have an API?'
  ]
}

/**
 * Response templates for each intent
 */
export const INTENT_RESPONSE_TEMPLATES: Record<IntentType, string> = {
  product_inquiry: 'I\'d be happy to explain {feature}. ConsumerIQ provides...',
  data_query: 'Let me pull that data for you. Based on our latest market intelligence...',
  technical_support: 'I can help you with that technical issue. Let\'s troubleshoot...',
  demo_request: 'Great! I can help you schedule a demo. Our team would love to show you...',
  general_conversation: 'Hello! How can I help you with ConsumerIQ today?',
  compliance_question: 'Regarding regulatory compliance, ConsumerIQ can help by...',
  competitor_analysis: 'Based on our competitive intelligence tracking...',
  distributor_inquiry: 'Looking at distributor performance data...',
  pricing_inquiry: 'ConsumerIQ offers flexible pricing plans tailored to your needs...',
  integration_question: 'ConsumerIQ integrates with all major beverage alcohol data sources...'
}
