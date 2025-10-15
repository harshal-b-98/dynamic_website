# API & UI Reference

> Single source of truth for API endpoints, UI components, and their interactions

## Overview
This document maintains a comprehensive reference of all API endpoints and UI components in the Dynamic AI-Driven Website project.

**Last Updated**: 2025-10-15

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

### Contact Form & Lead Management
✅ **Implemented in feature/ui-updates branch**

#### POST /api/contact/submit
Submit contact form with validation and email notifications

```typescript
// Request Body
{
  name: string          // Full name (min 2 chars)
  email: string         // Valid email address
  phone: string         // Phone number (min 10 chars)
  company: string       // Company name (min 2 chars)
  role: string          // Selected role from dropdown
  reason: string        // Selected reason from dropdown
  message?: string      // Optional message
}

// Response
{
  success: boolean
  message: string               // Success/error message
  submissionId?: string         // UUID of created submission
}

// Error Response
{
  success: false
  error: string                 // Validation or server error
}
```

**Authentication**: None (public endpoint)
**Validation**: Server-side with zod schema
**Email Service**: Resend with branded HTML template
**Database Table**: dyn_contact_submissions
**Metadata Tracked**: User agent, IP address, timestamp

**Role Options** (9):
- C-Suite Executive
- VP/Director
- Manager
- Sales
- Marketing
- Data/Analytics
- IT/Technology
- Operations
- Other

**Reason Options** (7):
- Schedule a Demo
- Request Pricing Information
- Technical Support
- Partnership Inquiry
- General Question
- Product Feedback
- Other

**Email Configuration**:
- Recipient: info@consumeriq.ai
- Sender: Configured via RESEND_FROM_EMAIL
- Template: Professional HTML with ConsumerIQ branding
- Fallback: Console logging if service not configured

**Features**:
- Real-time client and server validation
- XSS protection via content sanitization
- Metadata tracking for analytics
- Status workflow (new → in_progress → contacted → closed)
- Automatic timestamp tracking (submitted_at, created_at, updated_at)

---

#### GET /api/contact/submissions
Retrieve contact form submissions with filtering

```typescript
// Query Parameters
?status=<string>      // Filter: 'all', 'new', 'in_progress', 'contacted', 'closed'
&limit=<number>       // Max results (default: 50)

// Response
{
  success: boolean
  submissions: DynContactSubmission[]
  total: number
  limit: number
  offset: number
}

// DynContactSubmission Structure
{
  id: string                                    // UUID
  name: string
  email: string
  phone: string
  company: string
  role: string
  reason: string
  message?: string
  submitted_at: string                          // ISO timestamp
  status: 'new' | 'in_progress' | 'contacted' | 'closed'
  metadata: {
    user_agent?: string
    ip_address?: string
  }
  created_at: string                            // ISO timestamp
  updated_at: string                            // ISO timestamp
}

// Error Response
{
  success: false
  error: string
}
```

**Authentication**: Requires valid Supabase session (admin only)
**Database Query**: Ordered by submitted_at DESC
**Indexes**: status, submitted_at, email, company
**Pagination**: Limit parameter (default 50, max 250)

**Status Workflow**:
1. **new**: Initial submission (default)
2. **in_progress**: Team member reviewing/responding
3. **contacted**: Follow-up communication sent
4. **closed**: Resolved or no longer active

---

#### PATCH /api/contact/submissions
Update contact submission status

```typescript
// Request Body
{
  id: string            // Submission UUID
  status: string        // New status value
}

// Response
{
  success: boolean
  submission: DynContactSubmission    // Updated submission
}

// Error Response
{
  success: false
  error: string
}
```

**Authentication**: Requires valid Supabase session (admin only)
**Validation**: Status must be one of: new, in_progress, contacted, closed
**Auto-Update**: updated_at timestamp automatically set via trigger
**Use Case**: Admin dashboard inline status updates

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
✅ **Implemented in DYN-5 (Story 1.4)**

**Location**: `src/components/organisms/DynamicPageRenderer.tsx`
**Purpose**: Renders dynamically generated pages from specifications

```typescript
interface DynamicPageRendererProps {
  pageSpec: PageSpecification
  onInteraction?: (interaction: InteractionHandlerProps) => void
  onComponentError?: (componentType: string, error: Error) => void
}

// Features:
// - Dynamic component loading with lazy imports
// - Error boundaries per component
// - Loading skeletons (hero, chart, table, form variants)
// - Responsive layouts (single-column, two-column, grid)
// - Smooth animations (300ms fade-in)
// - Staggered component entrance (50ms delay, max 300ms)
```

---

### Contact Page & Form
✅ **Implemented in feature/ui-updates branch**

#### ContactPage (Page Component)
**Location**: `src/app/contact/page.tsx`
**Route**: `/contact`
**Purpose**: Full-page contact form with company information

```typescript
// Features:
// - Two-column responsive layout (lg:grid-cols-5)
// - Left section (2 cols): Company contact details
// - Right section (3 cols): Contact form
// - Navbar and footer consistent with home page
// - Form height matches left section height
// - Inline styles with brand colors

// Left Section Components:
// 1. Contact Information Card
//    - Email: info@consumeriq.ai
//    - Phone: +1 (609) 619-0021
// 2. North America Address
//    - 3 Lenmore Ct, Monroe Township, NJ 08831
// 3. India Address
//    - Twenty20 Systems, Bengaluru full address
// 4. Why ConsumerIQ? Card
//    - 4 highlights with checkmarks

// Right Section:
// - Contact form with validation
// - 6 required fields + 1 optional field
// - Real-time error messages
// - Success/error feedback with icons
```

**Styling**:
- Background: Light Data Gray (#EBEFF2)
- Cards: White with shadow-sm
- Accents: Electric Cyan (#00C8FF)
- Text: Deep Indigo (#0A1930) on light, White (#FFFFFF) on dark
- Fonts: Montserrat (headings), Inter (body)

**Form Validation**: react-hook-form + zod schema
**Icons**: Feather Icons (mail, phone, map-pin, check)

---

#### Admin Dashboard (Page Component)
**Location**: `src/app/admin/contact-submissions/page.tsx`
**Route**: `/admin/contact-submissions`
**Purpose**: Manage contact form submissions

```typescript
// Features:
// - View all submissions with filtering by status
// - Status workflow: new → in_progress → contacted → closed
// - Inline status updates with dropdown
// - Display all submission details
// - Responsive cards with Electric Cyan accents
// - Real-time data refresh

// Status Badge Colors:
// - new: Blue (#3B82F6)
// - in_progress: Yellow (#F59E0B)
// - contacted: Green (#10B981)
// - closed: Gray (#6B7280)
```

**Authentication**: Requires Supabase session
**Data Fetching**: Client-side via fetch API
**Refresh**: Manual via "Refresh" button

---

#### FeatherIcon (Atom)
**Location**: `src/components/atoms/FeatherIcon.tsx`
**Purpose**: Reusable icon component using Feather Icons library

```typescript
interface FeatherIconProps {
  name: string              // Icon name (e.g., 'mail', 'phone', 'check')
  size?: number             // Icon size in pixels (default: 24)
  color?: string            // Icon color (default: 'currentColor')
  strokeWidth?: number      // Stroke width (default: 2)
}

// Usage:
<FeatherIcon name="mail" size={24} color="#00C8FF" strokeWidth={2} />
```

**Icons Available**: All Feather Icons (mail, phone, map-pin, check, alert-circle, check-circle, linkedin, twitter, facebook, etc.)

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
- 2025-10-15: Added UI Updates (feature/ui-updates branch):
  * POST /api/contact/submit endpoint (contact form submission)
  * GET /api/contact/submissions endpoint (admin retrieval)
  * PATCH /api/contact/submissions endpoint (status updates)
  * Contact page at /contact route (full-page layout)
  * Admin dashboard at /admin/contact-submissions
  * FeatherIcon atom component
  * Database schema: dyn_contact_submissions table
  * Email integration: Resend service with branded templates
  * Status workflow: new → in_progress → contacted → closed
  * Form validation: react-hook-form + zod
  * Navbar redesign: sticky, Deep Indigo, backdrop blur
  * Footer implementation: 4-column layout with newsletter signup
  * FAQ section refinements: sentence case title, single CTA button
  * Button navigation mappings: all "Talk to Our Team" → /contact
  * Brand consistency: Deep Indigo, Electric Cyan, White color palette
  * Typography: Montserrat (headings), Inter (body)
  * Responsive design: mobile, tablet, desktop breakpoints
