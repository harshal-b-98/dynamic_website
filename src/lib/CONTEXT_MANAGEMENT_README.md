# Context Management System

## Overview

The Context Management System provides comprehensive conversation context tracking across multiple turns and sessions. It uses **iron-session** for session identification and **Supabase** for persistent storage.

## Architecture

```
User Session (iron-session)
        ↓
ContextManager
        ↓
Supabase Storage (dyn_conversations, dyn_messages)
        ↓
Context APIs (/api/context/*)
```

## Core Components

### 1. Context Types (`context-types.ts`)

Defines the schema for conversation context:

- **ConversationContext**: Main context object containing messages, pages, preferences, metadata
- **Message**: Individual chat messages with role, content, intent, timestamp
- **PageView**: Tracked page views with viewing duration and interaction count
- **UserPreferences**: User interests, seen content, preferred components
- **ConversationMetadata**: Turn count, token usage, intent history, performance metrics

### 2. Context Manager (`context-manager.ts`)

Service class for managing context operations:

```typescript
const contextManager = new ContextManager(sessionId, userId)

// Get context
const context = await contextManager.getContext(conversationId)

// Update context
await contextManager.updateContext(conversationId, {
  addMessage: message,
  addPageView: pageView,
  updatePreferences: { interests: ['analytics'] }
})

// Reset context
await contextManager.resetContext(conversationId, {
  clearMessages: true,
  preservePreferences: true
})

// Delete context
await contextManager.deleteContext(conversationId)
```

**Key Features:**
- Automatic context compression for long conversations
- TTL management (30-minute expiration)
- Message and page tracking
- Token usage tracking
- Intent history
- Graceful error handling

### 3. Context APIs

#### GET `/api/context`
Get current conversation context

**Query Params:**
- `conversationId` (optional): Specific conversation
- `messageLimit` (default: 10): Number of recent messages
- `pageLimit` (default: 5): Number of recent pages
- `recent` (boolean): Get recent context only

**Response:**
```json
{
  "success": true,
  "context": {
    "sessionId": "...",
    "conversationId": "...",
    "messages": [...],
    "pages": [...],
    "preferences": {...},
    "metadata": {...}
  }
}
```

#### POST `/api/context`
Create a new conversation

**Body:**
```json
{
  "title": "New Conversation"
}
```

#### PUT `/api/context`
Update conversation context

**Body:**
```json
{
  "conversationId": "...",
  "updates": {
    "addMessage": {...},
    "addPageView": {...},
    "updatePreferences": {...},
    "currentPage": "...",
    "lastIntent": "..."
  }
}
```

#### DELETE `/api/context`
Delete a conversation

**Query Params:**
- `conversationId` (required)

#### POST `/api/context/reset`
Reset conversation context

**Body:**
```json
{
  "conversationId": "...",
  "options": {
    "clearMessages": true,
    "clearPages": true,
    "preservePreferences": false,
    "createNewConversation": false,
    "reason": "user_request"
  }
}
```

#### GET `/api/context/stats`
Get storage statistics

**Query Params:**
- `conversationId` (required)

**Response:**
```json
{
  "success": true,
  "stats": {
    "messageCount": 25,
    "pageCount": 10,
    "storageSize": 15340,
    "compressionRatio": 0.65
  }
}
```

#### POST `/api/context/cleanup`
Cleanup expired contexts (TTL management)

**Body:**
```json
{
  "ttlHours": 24,
  "authToken": "..."
}
```

**Usage:** Should be called by a cron job or scheduled task.

## Integration Guide

### 1. Basic Usage in APIs

```typescript
import { ContextManager } from '@/lib/context-manager'
import { getIronSession } from 'iron-session'

export async function POST(request: NextRequest) {
  // Get session
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  // Create context manager
  const contextManager = new ContextManager(session.sessionId, session.userId)

  // Get or create context
  const context = await contextManager.getContext(conversationId)

  // Use context for AI generation
  const recentMessages = context.messages.slice(-10)
  const lastIntent = context.lastIntent

  // ... AI processing ...

  // Update context
  await contextManager.updateContext(conversationId, {
    addMessage: newMessage,
    lastIntent: detectedIntent,
    updateMetadata: {
      totalTokens: context.metadata.totalTokens + tokens
    }
  })
}
```

### 2. Multi-Turn Conversations

```typescript
// Get recent context for follow-up queries
const recentContext = await contextManager.getRecentContext(conversationId, {
  messageLimit: 5,  // Last 5 messages
  pageLimit: 3      // Last 3 pages viewed
})

// Use in AI prompt
const conversationHistory = recentContext.messages?.map(msg => ({
  role: msg.role,
  content: msg.content
}))
```

### 3. Context Reset

```typescript
// User clicks "Start Over"
await contextManager.resetContext(conversationId, {
  clearMessages: true,
  clearPages: false,
  preservePreferences: true,
  reason: 'user_request'
})

// Or create new conversation
await contextManager.resetContext(conversationId, {
  createNewConversation: true,
  reason: 'context_switch'
})
```

### 4. Session Management

```typescript
// Get session from iron-session
const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

// Initialize context manager with session
const contextManager = new ContextManager(session.sessionId, session.userId)

// Session persists across requests
// Context is automatically associated with session
```

## Storage Schema

### Supabase Tables

**dyn_conversations:**
```sql
id: uuid (primary key)
session_id: text (indexed)
user_id: text (nullable)
title: text
metadata: jsonb  -- stores pages, preferences, turnCount, etc.
created_at: timestamp
updated_at: timestamp
```

**dyn_messages:**
```sql
id: uuid (primary key)
conversation_id: uuid (foreign key)
role: text ('user' | 'assistant' | 'system')
content: text
metadata: jsonb  -- stores intent, tokens, pageId, etc.
created_at: timestamp
```

### Metadata Structure

**Conversation Metadata:**
```json
{
  "pages": [
    {
      "pageId": "...",
      "pageType": "feature",
      "title": "Features Page",
      "viewedAt": "2025-01-10T12:00:00Z",
      "duration": 45000,
      "specification": {...}
    }
  ],
  "preferences": {
    "interests": ["analytics", "pricing"],
    "seenContent": ["feature-1", "feature-2"],
    "preferences": {}
  },
  "currentPage": "page-123",
  "lastIntent": "product_inquiry",
  "turnCount": 15,
  "totalTokens": 12500,
  "intentHistory": ["product_inquiry", "pricing_inquiry", ...],
  "pageGenerationCount": 3,
  "averageResponseTime": 2400
}
```

**Message Metadata:**
```json
{
  "intent": "product_inquiry",
  "confidence": 0.95,
  "reasoning": "...",
  "entities": [...],
  "model": "claude-3-haiku-20240307",
  "input_tokens": 250,
  "output_tokens": 180,
  "pageGenerated": true,
  "pageId": "page-123"
}
```

## Performance Considerations

### Context Compression

Contexts are automatically compressed when:
- Message count > 50
- Page count > 20
- Turn count > 25

```typescript
import { shouldCompressContext } from '@/lib/context-types'

if (shouldCompressContext(context)) {
  // Compression happens automatically in ContextManager
  // Old messages/pages are archived
}
```

### TTL Management

Conversations expire after 30 minutes of inactivity:

```typescript
// Run cleanup (should be scheduled)
const deletedCount = await ContextManager.cleanupExpiredContexts(24) // 24 hours

// For production, set up a cron job:
// 0 */6 * * * curl -X POST http://localhost:3000/api/context/cleanup \
//   -H "Content-Type: application/json" \
//   -d '{"ttlHours": 24, "authToken": "..."}'
```

### Query Optimization

**Efficient Context Retrieval:**
```typescript
// ❌ Don't fetch full context if you only need recent messages
const context = await contextManager.getContext(conversationId)
const recent = context.messages.slice(-10)

// ✅ Use getRecentContext instead
const recentContext = await contextManager.getRecentContext(conversationId, {
  messageLimit: 10,
  pageLimit: 5
})
```

## Error Handling

All context operations are designed to fail gracefully:

```typescript
try {
  await contextManager.updateContext(conversationId, updates)
} catch (error) {
  console.error('Error updating context (non-blocking):', error)
  // Continue with request - don't fail
}
```

**Error Types:**
- `Conversation not found` - Invalid conversationId
- `Failed to fetch messages` - Database error
- `Failed to update context` - Write error
- `Failed to decompress context` - Corrupted data

## Testing

### Unit Tests

```typescript
import { ContextManager } from '@/lib/context-manager'

describe('ContextManager', () => {
  it('should create new context', async () => {
    const manager = new ContextManager('session-123')
    const context = await manager.createContext('Test')

    expect(context.sessionId).toBe('session-123')
    expect(context.messages).toHaveLength(0)
  })

  it('should update context with message', async () => {
    const manager = new ContextManager('session-123')
    const context = await manager.createContext()

    await manager.updateContext(context.conversationId, {
      addMessage: {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date()
      }
    })

    const updated = await manager.getContext(context.conversationId)
    expect(updated.messages).toHaveLength(1)
  })
})
```

### Integration Tests

Test full conversation flow:
1. Create conversation
2. Send multiple messages
3. Generate pages
4. Verify context updates
5. Test reset/cleanup

## Best Practices

1. **Always use ContextManager** - Don't query Supabase directly
2. **Handle errors gracefully** - Context updates shouldn't fail requests
3. **Use recent context** - Don't fetch full context if you only need recent turns
4. **Set up TTL cleanup** - Schedule /api/context/cleanup as a cron job
5. **Monitor context size** - Use /api/context/stats to track storage
6. **Preserve preferences** - When resetting, consider preserving user preferences
7. **Track token usage** - Update metadata with token counts for analytics

## Future Enhancements

- [ ] Redis caching for hot contexts
- [ ] Semantic search across conversation history
- [ ] Context similarity scoring
- [ ] Advanced compression algorithms
- [ ] Context export/import
- [ ] Multi-session context aggregation
- [ ] Context analytics dashboard
- [ ] Real-time context sync across devices

## Troubleshooting

**Context not persisting:**
- Check session cookie is set
- Verify Supabase connection
- Check console for errors

**Context too large:**
- Enable compression
- Reduce message/page limits
- Run cleanup more frequently

**TTL not working:**
- Set up cron job for /api/context/cleanup
- Check CLEANUP_AUTH_TOKEN env variable
- Verify timestamp queries

**Performance issues:**
- Use getRecentContext instead of getContext
- Enable context compression
- Add database indexes on session_id and conversation_id

## Support

For questions or issues:
- Check console logs for errors
- Use /api/context/stats to diagnose issues
- Review Supabase dashboard for data issues
- Test with /api/context endpoint directly
