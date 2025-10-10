/**
 * AI Thinking Process Types and Stages
 *
 * Defines the stages and types for visualizing the AI's thinking process
 * during page generation instead of showing a generic loading spinner.
 */

export type ThinkingStageStatus = 'pending' | 'active' | 'complete' | 'error'

export interface ThinkingStage {
  id: string
  name: string
  message: string
  status: ThinkingStageStatus
  duration?: number
  progress?: number
  startTime?: number
  endTime?: number
}

export interface ThinkingStageUpdate {
  stageId: string
  status: ThinkingStageStatus
  message?: string
  progress?: number
  duration?: number
}

export interface ThinkingProcessState {
  stages: ThinkingStage[]
  currentStageIndex: number
  isComplete: boolean
  totalDuration: number
  error?: string
}

/**
 * Default thinking stages for page generation
 */
export const DEFAULT_THINKING_STAGES: Omit<ThinkingStage, 'status'>[] = [
  {
    id: 'intent',
    name: 'Understanding',
    message: '🔍 Analyzing your question...'
  },
  {
    id: 'context',
    name: 'Context',
    message: '📚 Gathering relevant information...'
  },
  {
    id: 'planning',
    name: 'Planning',
    message: '🎨 Structuring the response...'
  },
  {
    id: 'generation',
    name: 'Creating',
    message: '⚡ Building interactive components...'
  },
  {
    id: 'validation',
    name: 'Finalizing',
    message: '✨ Validating the page...'
  }
]

/**
 * Stage-specific messages for different contexts
 */
export const STAGE_MESSAGES = {
  intent: {
    start: '🔍 Analyzing your question...',
    progress: [
      'Understanding your intent...',
      'Classifying the request...',
      'Identifying key topics...'
    ],
    complete: (confidence: number) => `✓ ${getIntentName(confidence)} detected (${Math.round(confidence * 100)}% confidence)`
  },
  context: {
    start: '📚 Gathering relevant information...',
    progress: [
      'Retrieving conversation history...',
      'Loading knowledge base...',
      'Finding related topics...'
    ],
    complete: (count: number) => `✓ Found ${count} related topics`
  },
  planning: {
    start: '🎨 Structuring the response...',
    progress: [
      'Designing page layout...',
      'Selecting components...',
      'Planning visual hierarchy...'
    ],
    complete: (componentCount: number) => `✓ Planning ${componentCount} components for optimal readability`
  },
  generation: {
    start: '⚡ Building interactive components...',
    progress: [
      'Creating hero section...',
      'Adding professional icons...',
      'Generating content sections...',
      'Applying brand styling...'
    ],
    complete: (components: string[]) => `✓ Generated ${components.join(', ')} sections`
  },
  validation: {
    start: '✨ Finalizing the page...',
    progress: [
      'Validating page structure...',
      'Checking accessibility...',
      'Optimizing layout...'
    ],
    complete: () => '✓ Page validated successfully!'
  }
}

/**
 * Helper function to get intent name from confidence
 */
function getIntentName(confidence: number): string {
  if (confidence >= 0.9) return 'Product inquiry'
  if (confidence >= 0.8) return 'Data query'
  if (confidence >= 0.7) return 'General question'
  return 'Question'
}

/**
 * Estimated durations for each stage (in milliseconds)
 */
export const STAGE_DURATIONS = {
  intent: 2000,      // 1-2 seconds
  context: 2000,     // 1-2 seconds
  planning: 3000,    // 2-3 seconds
  generation: 6000,  // 4-8 seconds
  validation: 2000   // 1-2 seconds
}

/**
 * Calculate total estimated time
 */
export const TOTAL_ESTIMATED_TIME = Object.values(STAGE_DURATIONS).reduce((a, b) => a + b, 0)

/**
 * Did you know tips for display during generation
 */
export const DID_YOU_KNOW_TIPS = [
  "ConsumerIQ uses Claude 3 Haiku for lightning-fast responses",
  "Each page is uniquely generated based on your question",
  "We analyze conversation context to provide relevant answers",
  "The AI considers spacing and layout for optimal readability",
  "Components are lazy-loaded for better performance",
  "Generated pages are fully responsive across all devices"
]
