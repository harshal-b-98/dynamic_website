# API & UI Reference

> Single source of truth for API endpoints, UI components, and their interactions

## Overview
This document maintains a comprehensive reference of all API endpoints and UI components in the Dynamic AI-Driven Website project.

**Last Updated**: 2025-10-13

---

## API Endpoints

### Chat & Conversation
✅ **Implemented in DYN-2 (Story 1.1)**

#### POST /api/chat/message
Send a message and receive AI response

```typescript
// Request Body
{
  message: string           // User message content
  conversationId?: string   // Optional: existing conversation ID
}

// Response
{
  success: boolean
  conversationId: string
  userMessage: DynMessage
  assistantMessage: DynMessage
  sessionId: string
}

// Error Response
{
  error: string
}
```

**Authentication**: Iron Session cookie-based
**Database Tables**: dyn_conversations, dyn_messages

---

#### GET /api/chat/history
Retrieve conversation history

```typescript
// Query Parameters
?conversationId=<uuid>  // Optional: specific conversation

// Response (with conversationId)
{
  conversation: DynConversation
  messages: DynMessage[]
  sessionId: string
}

// Response (without conversationId)
{
  conversations: DynConversation[]
  sessionId: string
}

// Error Response
{
  error: string
}
```

**Authentication**: Iron Session cookie-based
**Database Tables**: dyn_conversations, dyn_messages

### Intent Classification
✅ **Implemented in DYN-3 (Story 1.2)**

#### POST /api/intent/classify
Classify user message intent using Claude AI

```typescript
// Request Body
{
  message: string    // User message to classify
}

// Response
{
  success: boolean
  classification: {
    intent: IntentType        // Classified intent (e.g., 'product_inquiry')
    confidence: number        // Confidence score (0-1)
    reasoning: string         // Explanation of classification
    entities: string[]        // Extracted entities from message
  }
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

// Error Response
{
  error: string
  details?: string
}
```

**Authentication**: None (internal API)
**LLM Model**: claude-3-haiku-20240307
**Average Response Time**: ~1s

**Intent Types**: `product_inquiry`, `data_query`, `technical_support`, `demo_request`, `general_conversation`, `compliance_question`, `competitor_analysis`, `distributor_inquiry`, `pricing_inquiry`, `integration_question`

---

### Page Generation
✅ **Implemented in DYN-4 (Story 1.3)**

#### POST /api/page/generate
Generate dynamic page specification using LLM

```typescript
// Request Body
{
  query: string                     // User's original query
  intent: string                    // Classified intent
  conversationHistory?: Array<{     // Optional: recent conversation
    role: 'user' | 'assistant'
    content: string
  }>
  persona?: string                  // Optional: detected persona
  sessionId: string                 // Required: session identifier
}

// Response
{
  success: boolean
  pageSpec?: PageSpecification      // Generated page specification
  cached?: boolean                  // Whether result was from cache
  error?: string
}

// PageSpecification Structure
{
  id: string
  type: 'landing' | 'feature' | 'comparison' | 'dashboard' | 'custom'
  metadata: {
    title: string
    description: string
    keywords: string[]
    generatedFor: string            // Original query
  }
  layout: {
    type: 'single-column' | 'two-column' | 'grid' | 'custom'
    spacing?: 'compact' | 'normal' | 'spacious'
    components: ComponentSpec[]     // Array of component specifications
  }
  navigation?: {
    breadcrumbs?: Breadcrumb[]
    relatedQueries?: string[]
    nextSteps?: string[]
  }
  generatedAt: Date
  generatedBy: 'llm'
  llmModel: string                  // e.g., 'claude-3-haiku-20240307'
  generationTime: number            // Milliseconds
}

// ComponentSpec Structure
{
  id: string                        // Unique instance ID
  componentType: string             // Component registry key
  order: number                     // Render order (0-indexed)
  props: Record<string, any>        // Component-specific props
  content: any                      // Component content
  styling?: {
    variant?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    theme?: 'light' | 'dark' | 'brand'
    className?: string
  }
  metadata?: {
    purpose?: string
    priority?: 'primary' | 'secondary' | 'supporting'
  }
}

// Error Response
{
  success: false
  error: string                     // User-friendly error message
}
```

**Authentication**: None (requires valid sessionId)
**LLM Model**: claude-3-haiku-20240307
**Target Performance**: <2s (P90), <3s (P99)
**Current Performance**: ~15s (first generation), <100ms (cached)
**Timeout**: 15 seconds maximum
**Retry Logic**: 2 retries with exponential backoff
**Caching**: 30-minute TTL, 100 entry max
**Component Library**: 25+ components across 10 categories

**Features**:
- LLM-driven page generation with full component flexibility
- Structured JSON output with validation
- Automatic component registry verification
- In-memory caching for common queries
- Comprehensive error handling
- Security: XSS protection via content sanitization

**Error Types**:
- `LLM_UNAVAILABLE`: LLM service unavailable (503)
- `COMPONENT_NOT_FOUND`: Invalid component in spec (500)
- `INVALID_SPECIFICATION`: Validation failed (500)
- `TIMEOUT`: Generation exceeded 15s (504)
- `VALIDATION_FAILED`: Schema validation errors (500)

### RAG & Knowledge Base
✅ **Implemented in DYN-53 (RAG Integration)**

#### POST /api/knowledge-base/multi-retrieve
Retrieve relevant content from multiple specialized knowledge bases in parallel

```typescript
// Request Body
{
  query: string                  // Search query
  intent?: string                // User intent for KB weighting (e.g., 'product_inquiry')
  threshold?: number             // Minimum similarity threshold (0-1, default: 0.7)
  guidelinesTopK?: number        // Override guidelines KB result count
  personasTopK?: number          // Override personas KB result count
  productTopK?: number           // Override product KB result count
}

// Response
{
  success: boolean
  query: string
  intent?: string
  results: {
    guidelines: RetrievalResult[]   // UI/UX guidelines, brand voice, design patterns
    personas: RetrievalResult[]     // User persona definitions and characteristics
    product: RetrievalResult[]      // ConsumerIQ features, capabilities, FAQ
  }
  stats: {
    guidelinesCount: number
    personasCount: number
    productCount: number
    totalCount: number
    processingTime: number          // Milliseconds
    averageSimilarity: {
      guidelines: number
      personas: number
      product: number
    }
  }
  weights: {                        // Intent-based KB weighting applied
    guidelines: 'low' | 'medium' | 'high'
    personas: 'low' | 'medium' | 'high'
    product: 'low' | 'medium' | 'high'
  }
  processingTime: number            // Total milliseconds
}

// RetrievalResult Structure
{
  contentId: string                 // Unique chunk ID
  contentType: string               // e.g., 'documentation', 'product', 'faq'
  contentText: string               // Retrieved text content
  contentTitle?: string             // Optional: content title
  similarity: number                // Cosine similarity score (0-1)
  metadata?: Record<string, any>   // Additional metadata
}

// Error Response
{
  success: false
  error: string
}
```

**Authentication**: None (internal API)
**Vector Database**: Supabase pgvector with cosine similarity
**Knowledge Bases**:
- **Guidelines KB** 📐: UI component usage, brand voice, design patterns, layout recommendations
- **Personas KB** 👤: User persona definitions, behavioral characteristics, content preferences
- **Product KB** 🎯: ConsumerIQ features, capabilities, technical details, FAQ content

**Performance**: ~4-5s (parallel retrieval from 3 KBs)
**Intent-Based Weighting**: 8 intent types with configurable weight multipliers (low=0.5x, medium=1.0x, high=1.5x)
**Default topK**: Guidelines: 3, Personas: 2, Product: 5

**Intent Mappings**:
- `product_inquiry`: guidelines=low, personas=medium, product=high
- `pricing_request`: guidelines=medium, personas=high, product=high
- `technical_support`: guidelines=high, personas=low, product=high
- `demo_request`: guidelines=medium, personas=high, product=medium
- `general_conversation`: guidelines=medium, personas=medium, product=medium
- `compliance_question`: guidelines=low, personas=low, product=high
- `competitor_analysis`: guidelines=medium, personas=medium, product=high
- `distributor_inquiry`: guidelines=medium, personas=high, product=high

**Features**:
- Parallel retrieval from 3 specialized KBs using Promise.all
- Intent-based KB weighting for relevance optimization
- Token-aware context building for LLM prompts
- Graceful error handling per KB (failures don't break entire request)
- Structured sections with icons in LLM context (📐, 👤, 🎯)

**Usage in Page Generation**:
- Automatically called during POST /api/page/generate
- Retrieved context (2,000-4,000 tokens) injected into LLM system prompt
- Enhances content accuracy, brand consistency, and persona awareness
- Reduces hallucinations by grounding LLM in factual business data

---

## UI Components

### Chat Interface
✅ **Implemented in DYN-2 (Story 1.1)**

#### ChatInterface (Organism)
**Location**: `src/components/organisms/ChatInterface.tsx`
**Purpose**: Complete persistent chat interface with message history and real-time updates

```typescript
interface ChatInterfaceProps {
  initialMessages?: Message[]  // Optional: pre-loaded messages
  conversationId?: string       // Optional: existing conversation
}

// Features:
// - Auto-loads conversation history on mount
// - Displays messages in chronological order
// - Auto-scrolls to latest message
// - Shows typing indicator while loading
// - Error handling with user-friendly messages
// - Session-based persistence via Iron Session
```

**Dependencies**: ChatMessage (atom), ChatInput (molecule)

---

#### ChatMessage (Atom)
**Location**: `src/components/atoms/ChatMessage.tsx`
**Purpose**: Individual message bubble display

```typescript
interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

// Features:
// - Different styling for user vs assistant messages
// - Timestamp display
// - Responsive text wrapping
// - Accessible markup
```

---

#### ChatInput (Molecule)
**Location**: `src/components/molecules/ChatInput.tsx`
**Purpose**: Message input with keyboard shortcuts

```typescript
interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

// Features:
// - Enter to send, Shift+Enter for new line
// - Auto-resize textarea (min 52px, max 120px)
// - Disabled state during message sending
// - Clear input after successful send
```

### Dynamic Page Renderer
_Epic 1: Story 1.4_

```typescript
// Location: src/components/organisms/DynamicPageRenderer.tsx
// Purpose: Renders dynamically generated pages from specifications
// Props: { pageSpec: PageSpecification, context: RenderContext }
```

---

## Integration Notes

### Chat → Intent → Page Flow
1. User sends message via ChatInterface
2. Message sent to POST /api/chat
3. Intent classified via POST /api/intent/classify
4. Page generated via POST /api/page/generate
5. Page rendered by DynamicPageRenderer

### Dependencies
- All chat endpoints require valid session ID
- Page generation depends on intent classification
- RAG retrieval enhances all LLM responses

---

## Update Log
- 2025-10-09: Initial document structure created
- 2025-10-09: Added DYN-2 implementation details:
  * POST /api/chat/message endpoint
  * GET /api/chat/history endpoint
  * ChatInterface organism component
  * ChatMessage atom component
  * ChatInput molecule component
  * Database schema: dyn_conversations, dyn_messages, dyn_sessions
  * Iron Session authentication details
- 2025-10-09: Added DYN-3 implementation details:
  * POST /api/intent/classify endpoint
  * 10 intent types with confidence scoring
  * Entity extraction capabilities
  * Claude 3 Haiku integration
- 2025-10-09: Added DYN-4 implementation details:
  * POST /api/page/generate endpoint
  * PageSpecification and ComponentSpec schemas
  * 25+ component library across 10 categories
  * LLM-driven page generation system
  * Caching layer (30min TTL, 100 entries)
  * Validation and sanitization
  * Performance: <100ms (cached), ~15s (uncached)
- 2025-10-13: Added DYN-53 implementation details:
  * POST /api/knowledge-base/multi-retrieve endpoint
  * Multi-KB architecture: 3 specialized knowledge bases
  * Guidelines KB 📐, Personas KB 👤, Product KB 🎯
  * Parallel retrieval with Promise.all
  * Intent-based KB weighting system (8 intent mappings)
  * Token-aware context building for LLM prompts
  * RAG integration into page generation flow
  * Performance: ~4-5s for 3-KB parallel retrieval
  * Graceful error handling per KB
