# API & UI Reference

> Single source of truth for API endpoints, UI components, and their interactions

## Overview
This document maintains a comprehensive reference of all API endpoints and UI components in the Dynamic AI-Driven Website project.

**Last Updated**: 2025-10-09

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
_Coming in Epic 1: Story 1.2_

```typescript
// POST /api/intent/classify
// Classify user intent from message
// Body: { message: string, context?: ConversationContext }
// Response: { intent: IntentType, confidence: number, entities: Entity[] }
```

### Page Generation
_Coming in Epic 1: Story 1.3_

```typescript
// POST /api/page/generate
// Generate dynamic page based on intent
// Body: { intent: string, context: any, personaData?: PersonaProfile }
// Response: { pageSpec: PageSpecification, components: Component[] }
```

### RAG Retrieval
_Coming in Epic 2: Story 2.3_

```typescript
// POST /api/rag/retrieve
// Retrieve relevant content chunks
// Body: { query: string, topK?: number, filters?: Record<string, any> }
// Response: { results: RetrievalResult[], relevanceScores: number[] }
```

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
