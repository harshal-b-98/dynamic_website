# API & UI Reference

> Single source of truth for API endpoints, UI components, and their interactions

## Overview
This document maintains a comprehensive reference of all API endpoints and UI components in the Dynamic AI-Driven Website project.

**Last Updated**: 2025-10-09

---

## API Endpoints

### Chat & Conversation
_Coming in Epic 1: Story 1.1_

```typescript
// POST /api/chat
// Send a message and receive AI-generated response
// Body: { message: string, sessionId: string }
// Response: { response: string, intent: string, suggestedActions: Action[] }
```

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
_Epic 1: Story 1.1_

```typescript
// Location: src/components/organisms/ChatInterface.tsx
// Purpose: Persistent chat interface with message history
// Props: { sessionId: string, onMessageSent: (message: string) => void }
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
