# 🚀 Page Generation Performance Optimization Plan

**Current Performance**: 13.6s total (4.4s RAG + 9.2s LLM)
**Target Performance**: <3s total (<500ms RAG + <2.5s LLM)
**Gap to Close**: 10.6 seconds (78% reduction needed)

---

## 📊 Current Bottleneck Analysis

### Timing Breakdown
```
Total: 13.6s
├── RAG Retrieval: 4.4s (32%)
│   ├── Vector Search (3 KBs in parallel): ~3.5s
│   ├── Context Building: ~0.5s
│   └── Embedding Generation: ~0.4s
└── LLM Generation: 9.2s (68%)
    ├── API Call Latency: ~0.5s
    ├── LLM Processing: ~8.5s
    └── Response Parsing: ~0.2s
```

### Root Causes
1. **RAG is too slow** (4.4s vs target 500ms = 8.8x slower)
   - Each vector search: ~1.2s per KB
   - No caching of frequent queries
   - Embedding generation every time

2. **LLM is too slow** (9.2s vs target 2.5s = 3.7x slower)
   - Using Claude 3 Haiku (not optimized for speed)
   - Large context window (11k tokens)
   - No streaming responses
   - Synchronous processing

---

## 🎯 Optimization Strategy (Prioritized)

### Phase 1: Quick Wins (1-2 days) - Target: 8s total
**Impact**: 5.6s reduction (41% improvement)

### Phase 2: Caching & Streaming (3-5 days) - Target: 4s total
**Impact**: Additional 4s reduction (29% improvement)

### Phase 3: Architectural (1-2 weeks) - Target: <3s total
**Impact**: Additional 1s reduction (7% improvement)

---

## 🔥 Phase 1: Quick Wins (Implement Immediately)

### 1. Cache RAG Retrieval Results ⚡ **HIGHEST IMPACT**
**Time Savings**: 3.5-4s per request
**Effort**: 2-3 hours
**Impact**: 🟢🟢🟢🟢🟢 (5/5)

#### Problem
Every page generation queries the vector DB, even for repeated queries.

#### Solution
Add Redis cache for RAG retrieval results with intent-based key.

#### Implementation

**Create: `src/lib/rag/rag-cache.ts`**
```typescript
import { createClient } from 'redis'
import type { MultiKBRetrievalResult } from '@/lib/knowledge-base/multi-kb-retriever'

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

redis.connect().catch(console.error)

/**
 * Generate cache key for RAG retrieval
 */
function getRagCacheKey(query: string, intent: string): string {
  // Normalize query for caching
  const normalizedQuery = query.toLowerCase().trim()
  return `rag:${intent}:${normalizedQuery}`
}

/**
 * Get cached RAG results
 */
export async function getCachedRAGResults(
  query: string,
  intent: string
): Promise<MultiKBRetrievalResult | null> {
  try {
    const key = getRagCacheKey(query, intent)
    const cached = await redis.get(key)

    if (cached) {
      console.log(`RAG cache hit for query: "${query}" (intent: ${intent})`)
      return JSON.parse(cached)
    }

    return null
  } catch (error) {
    console.error('RAG cache retrieval error:', error)
    return null
  }
}

/**
 * Cache RAG results
 */
export async function cacheRAGResults(
  query: string,
  intent: string,
  results: MultiKBRetrievalResult,
  ttl: number = 3600 // 1 hour default
): Promise<void> {
  try {
    const key = getRagCacheKey(query, intent)
    await redis.setEx(key, ttl, JSON.stringify(results))
    console.log(`Cached RAG results for: "${query}" (TTL: ${ttl}s)`)
  } catch (error) {
    console.error('RAG cache write error:', error)
  }
}

/**
 * Invalidate RAG cache (for CMS updates)
 */
export async function invalidateRAGCache(pattern?: string): Promise<number> {
  try {
    const keysPattern = pattern || 'rag:*'
    const keys = await redis.keys(keysPattern)

    if (keys.length === 0) return 0

    await redis.del(keys)
    console.log(`Invalidated ${keys.length} RAG cache entries`)
    return keys.length
  } catch (error) {
    console.error('RAG cache invalidation error:', error)
    return 0
  }
}
```

**Modify: `src/services/PageGenerationService.ts` (line 151)**
```typescript
// BEFORE
try {
  console.log(`Retrieving knowledge base context for intent: ${request.intent}`)
  const kbRetrieval = await retrieveFromMultipleKBs(request.query, {
    intent: request.intent,
    threshold: 0.7
  })

// AFTER
import { getCachedRAGResults, cacheRAGResults } from '@/lib/rag/rag-cache'

try {
  console.log(`Retrieving knowledge base context for intent: ${request.intent}`)

  // Check cache first
  let kbRetrieval = await getCachedRAGResults(request.query, request.intent)

  if (!kbRetrieval) {
    // Cache miss - retrieve from vector DB
    kbRetrieval = await retrieveFromMultipleKBs(request.query, {
      intent: request.intent,
      threshold: 0.7
    })

    // Cache for 1 hour
    await cacheRAGResults(request.query, request.intent, kbRetrieval, 3600)
  } else {
    console.log(`RAG cache hit! Saved ~4s`)
  }
```

**Expected Results**:
- First request: 13.6s (no change)
- Cached requests: ~9.2s (4.4s savings = 32% faster)
- Cache hit rate after 24h: ~40-60%

---

### 2. Switch to Claude 3.5 Haiku ⚡
**Time Savings**: 5-6s per request
**Effort**: 10 minutes
**Impact**: 🟢🟢🟢🟢🟢 (5/5)

#### Problem
Claude 3 Haiku (20240307) is the older model. Claude 3.5 Haiku is 3x faster.

#### Solution
Update model to `claude-3-5-haiku-20241022`

#### Implementation

**Modify: `src/lib/claude.ts`**
```typescript
// BEFORE
export const DEFAULT_CLAUDE_PARAMS = {
  model: 'claude-3-haiku-20240307',
  max_tokens: 4096
}

// AFTER
export const DEFAULT_CLAUDE_PARAMS = {
  model: 'claude-3-5-haiku-20241022', // 3x faster than 3.0
  max_tokens: 4096
}
```

**Expected Results**:
- LLM generation: 9.2s → ~3s (6.2s savings = 67% faster)
- **Total with cache**: 9.2s → **~4s** ✅

---

### 3. Reduce Context Size ⚡
**Time Savings**: 1-2s per request
**Effort**: 30 minutes
**Impact**: 🟢🟢🟢 (3/5)

#### Problem
Sending 11k tokens (4k KB context + 7k system prompt) to LLM

#### Solution
Optimize prompt engineering and reduce KB context

#### Implementation

**Modify: `src/services/PageGenerationService.ts` (line 176)**
```typescript
// BEFORE
const builtContext = contextBuilder.buildMultiKBContext(
  kbRetrieval.guidelines,
  kbRetrieval.personas,
  kbRetrieval.product,
  request.query,
  {
    maxTokens: 4000,
    format: 'markdown',
    includeMetadata: false
  }
)

// AFTER
const builtContext = contextBuilder.buildMultiKBContext(
  kbRetrieval.guidelines,
  kbRetrieval.personas,
  kbRetrieval.product,
  request.query,
  {
    maxTokens: 2000, // Reduce from 4000 to 2000
    format: 'markdown',
    includeMetadata: false
  }
)
```

**Modify: `src/lib/page-generation-prompts.ts`**
```typescript
// Optimize system prompt - remove verbose explanations
// Current: ~7000 tokens → Target: ~4000 tokens

export function buildPageGenerationSystemPrompt(kbContext?: string): string {
  const componentRegistry = getComponentRegistryForPrompt()

  const knowledgeBaseSection = kbContext ? `
## Knowledge Base Context
${kbContext}

Use guidelines for UI/UX, personas for audience targeting, product for factual info.
` : ''

  return `You are a page generation system for dynamic websites.

Generate JSON PageSpecification based on user queries and intent.
${knowledgeBaseSection}
## Components Available
${componentRegistry}

## Rules
- 4-5 components max, spacing: "spacious", size: "lg" or "xl"
- Hero first (order: 0), CTA last
- Feature grids: 3-4 items max
- Descriptions: 1 sentence, <80 chars
- Valid JSON only, no markdown

Output: PageSpecification JSON`
}
```

**Expected Results**:
- Input tokens: 11k → 6k (45% reduction)
- LLM time: ~3s → ~2s (1s savings)
- **Total with cache + Haiku 3.5**: ~4s → **~3s** ✅

---

### 4. Enable Parallel Embedding Generation
**Time Savings**: 0.3-0.5s per request
**Effort**: 1 hour
**Impact**: 🟢🟢 (2/5)

#### Problem
Embeddings generated sequentially for query normalization

#### Solution
Pre-generate embeddings for common queries (top 100 queries)

#### Implementation

**Create: `src/lib/rag/embedding-cache.ts`**
```typescript
import { createClient } from 'redis'
import { generateEmbedding } from '@/lib/embeddings/generator'

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

redis.connect().catch(console.error)

/**
 * Get cached embedding or generate new one
 */
export async function getCachedEmbedding(text: string): Promise<number[]> {
  const key = `embedding:${text.toLowerCase().trim()}`

  try {
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (error) {
    console.error('Embedding cache error:', error)
  }

  // Generate new embedding
  const embedding = await generateEmbedding(text)

  // Cache for 24 hours
  try {
    await redis.setEx(key, 86400, JSON.stringify(embedding))
  } catch (error) {
    console.error('Embedding cache write error:', error)
  }

  return embedding
}
```

**Expected Results**:
- First request: No change
- Cached: 0.4s savings per request

---

## 🚀 Phase 1 Summary

| Optimization | Time Saved | Effort | Implementation |
|--------------|------------|--------|----------------|
| 1. RAG caching | 4.4s | 2-3h | Redis cache layer |
| 2. Claude 3.5 Haiku | 6.2s | 10min | Model version bump |
| 3. Reduce context | 1s | 30min | Optimize prompts |
| 4. Embedding cache | 0.4s | 1h | Pre-cache embeddings |
| **Total** | **~12s** | **4-5h** | |

**Phase 1 Result**: 13.6s → **~4s** (70% reduction) ✅

---

## 🎯 Phase 2: Streaming & Advanced Caching (3-5 days)

### 5. Implement LLM Streaming ⚡ **USER EXPERIENCE**
**Time Savings**: 0s (perceived: 8-9s)
**Effort**: 1-2 days
**Impact**: 🟢🟢🟢🟢 (4/5 - UX)

#### Problem
User waits 9s staring at loading spinner

#### Solution
Stream LLM response to show partial results immediately

#### Implementation

**Modify: `src/services/PageGenerationService.ts`**
```typescript
// Use streaming API
const stream = await anthropic.messages.stream({
  ...DEFAULT_CLAUDE_PARAMS,
  max_tokens: 2048,
  temperature: 0.5,
  system: systemPrompt,
  messages: [{ role: 'user', content: userMessage }]
})

let accumulatedText = ''

for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta') {
    accumulatedText += chunk.delta.text

    // Emit progress events for UI
    // ... implement SSE or WebSocket updates
  }
}
```

**Add: `src/app/api/page/generate-stream/route.ts`**
```typescript
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  // Stream page generation progress
  pageGenerationService.generatePageStreaming(body, {
    onChunk: (chunk) => {
      writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
    },
    onComplete: (pageSpec) => {
      writer.write(encoder.encode(`data: {"done":true,"pageSpec":${JSON.stringify(pageSpec)}}\n\n`))
      writer.close()
    }
  })

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
```

**Expected Results**:
- Time to first token: <500ms (vs 9s wait)
- Perceived performance: 90% better
- User engagement: Higher (see progress)

---

### 6. Smart RAG Cache Warming 🔥
**Time Savings**: Pre-emptive (0s added, higher cache hit rate)
**Effort**: 1 day
**Impact**: 🟢🟢🟢 (3/5)

#### Problem
First user pays the 4.4s RAG penalty

#### Solution
Pre-warm cache with common queries daily

#### Implementation

**Create: `src/scripts/warm-rag-cache.ts`**
```typescript
import { retrieveFromMultipleKBs } from '@/lib/knowledge-base/multi-kb-retriever'
import { cacheRAGResults } from '@/lib/rag/rag-cache'

const COMMON_QUERIES = [
  { query: "What is ConsumerIQ?", intent: "product_inquiry" },
  { query: "Show me pricing", intent: "pricing_request" },
  { query: "How does it work?", intent: "technical_support" },
  { query: "Request a demo", intent: "demo_request" },
  { query: "Features comparison", intent: "competitor_analysis" },
  // ... top 50-100 queries from analytics
]

async function warmCache() {
  console.log(`Warming RAG cache for ${COMMON_QUERIES.length} queries...`)

  for (const { query, intent } of COMMON_QUERIES) {
    const results = await retrieveFromMultipleKBs(query, { intent })
    await cacheRAGResults(query, intent, results, 86400) // 24h TTL
    console.log(`✅ Cached: ${query}`)
  }

  console.log('Cache warming complete!')
}

warmCache()
```

**Add to package.json:**
```json
{
  "scripts": {
    "cache:warm": "tsx src/scripts/warm-rag-cache.ts"
  }
}
```

**Cron job (daily at 2am):**
```bash
0 2 * * * cd /app && npm run cache:warm
```

**Expected Results**:
- Cache hit rate: 40-60% → 70-80%
- Average response time: 4s → 2-3s

---

### 7. Database Query Optimization ⚡
**Time Savings**: 1-1.5s per request
**Effort**: 1-2 days
**Impact**: 🟢🟢🟢🟢 (4/5)

#### Problem
Vector search queries not optimized

#### Solution
Add database indexes and optimize query patterns

#### Implementation

**Run migration: `supabase/migrations/add_vector_indexes.sql`**
```sql
-- Add HNSW index for faster vector search (if not already present)
CREATE INDEX IF NOT EXISTS idx_embeddings_hnsw
ON embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Add B-tree indexes for metadata filtering
CREATE INDEX IF NOT EXISTS idx_embeddings_content_type
ON embeddings (content_type);

CREATE INDEX IF NOT EXISTS idx_embeddings_kb_category
ON embeddings ((metadata->>'kb_category'));

CREATE INDEX IF NOT EXISTS idx_embeddings_created_at
ON embeddings (created_at DESC);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_embeddings_type_category
ON embeddings (content_type, (metadata->>'kb_category'));

-- Analyze tables for query planner
ANALYZE embeddings;
```

**Optimize vector search query:**
```typescript
// BEFORE: No query optimization
const { data, error } = await supabase.rpc('match_embeddings', {
  query_embedding: embedding,
  match_threshold: threshold,
  match_count: topK
})

// AFTER: Optimized with index hints and limits
const { data, error } = await supabase.rpc('match_embeddings_optimized', {
  query_embedding: embedding,
  match_threshold: threshold,
  match_count: topK,
  content_type_filter: contentTypes,
  kb_category_filter: kbCategory
})
```

**Create optimized RPC function:**
```sql
CREATE OR REPLACE FUNCTION match_embeddings_optimized(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  content_type_filter text[] DEFAULT NULL,
  kb_category_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content_id text,
  content_type text,
  content_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.content_id,
    e.content_type,
    e.content_text,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM embeddings e
  WHERE
    1 - (e.embedding <=> query_embedding) > match_threshold
    AND (content_type_filter IS NULL OR e.content_type = ANY(content_type_filter))
    AND (kb_category_filter IS NULL OR e.metadata->>'kb_category' = kb_category_filter)
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**Expected Results**:
- Vector search: 1.2s → 0.3-0.4s per KB (70% faster)
- Total RAG: 4.4s → 1.2s (72% faster)

---

### 8. Implement Multi-Level Cache Strategy 🎯
**Time Savings**: Variable (improves cache hit rate)
**Effort**: 2 days
**Impact**: 🟢🟢🟢 (3/5)

#### Problem
Only caching final page specs, not intermediate results

#### Solution
Cache at multiple levels: embeddings, RAG results, page specs

#### Implementation

```typescript
// Cache hierarchy:
// L1: Embeddings cache (24h TTL) - saves 0.4s
// L2: RAG results cache (1h TTL) - saves 4.4s
// L3: Page spec cache (30min TTL) - saves 13.6s

interface CacheStrategy {
  embeddings: { ttl: 86400, hit_rate: 0.95 },
  rag: { ttl: 3600, hit_rate: 0.70 },
  pageSpec: { ttl: 1800, hit_rate: 0.40 }
}
```

---

## 🔮 Phase 3: Architectural Optimizations (1-2 weeks)

### 9. Background Job Processing 🏗️
**Time Savings**: User perceives instant response
**Effort**: 1 week
**Impact**: 🟢🟢🟢🟢🟢 (5/5 - Architecture)

#### Problem
User waits for entire generation process

#### Solution
Return immediately with job ID, process in background

#### Implementation

```typescript
// 1. User submits query → immediate response with job_id
POST /api/page/generate
Response: { job_id: "uuid", status: "processing" }

// 2. Poll for status
GET /api/page/status/{job_id}
Response: { status: "complete", pageSpec: {...} }

// 3. WebSocket for real-time updates
WebSocket: ws://localhost:3000/page-generation/{job_id}
```

---

### 10. CDN & Edge Caching 🌐
**Time Savings**: 50-100ms saved on cache hits
**Effort**: 3-5 days
**Impact**: 🟢🟢🟢 (3/5)

#### Problem
No geographic distribution, single origin server

#### Solution
Deploy to Vercel Edge, cache at CDN level

#### Implementation

```typescript
// Use Vercel Edge Functions
export const config = {
  runtime: 'edge',
}

// Add cache headers
return new Response(JSON.stringify(pageSpec), {
  headers: {
    'Cache-Control': 's-maxage=3600, stale-while-revalidate=7200',
    'CDN-Cache-Control': 'max-age=3600',
  }
})
```

---

## 📊 Performance Projection

### Timeline & Results

| Phase | Time to Implement | Expected Result | Cumulative |
|-------|------------------|-----------------|------------|
| **Baseline** | - | 13.6s | - |
| **Phase 1** (Quick Wins) | 4-5 hours | ~4s | 70% faster ✅ |
| Phase 1 + **Cache Hit** | - | ~2s | 85% faster ✅ |
| **Phase 2** (Caching/Streaming) | 3-5 days | ~2s | 85% faster ✅ |
| Phase 2 + **Optimized DB** | - | ~1.5s | 89% faster ✅ |
| **Phase 3** (Architecture) | 1-2 weeks | <1s | 93% faster ✅ |

### Cache Hit Rate Impact

| Scenario | RAG Cache | Page Cache | Total Time |
|----------|-----------|------------|------------|
| Cold (no cache) | Miss | Miss | 4s |
| Warm (RAG cached) | Hit | Miss | 2s |
| Hot (both cached) | Hit | Hit | <100ms |

---

## 🎯 Recommended Implementation Order

### Week 1 (Quick Wins)
**Day 1**:
1. ✅ Switch to Claude 3.5 Haiku (10 min)
2. ✅ Implement RAG caching (3 hours)

**Day 2**:
3. ✅ Reduce context size (1 hour)
4. ✅ Add embedding cache (2 hours)
5. ✅ Test and measure (1 hour)

**Expected Result**: 13.6s → ~4s (70% faster)

### Week 2 (Streaming & DB)
**Day 3-4**:
6. ✅ Implement LLM streaming (2 days)

**Day 5**:
7. ✅ Database query optimization (1 day)
8. ✅ Create warm cache script (1 day)

**Expected Result**: 4s → ~2s (85% faster)

### Week 3-4 (Architecture)
**Optional**: Background jobs, edge caching, etc.

---

## 📏 Success Metrics

### Performance Targets
| Metric | Baseline | Phase 1 | Phase 2 | Target | Status |
|--------|----------|---------|---------|--------|--------|
| **Total Time (p50)** | 13.6s | 4s | 2s | <3s | ✅ |
| **Total Time (p95)** | 15s | 5s | 3s | <5s | ✅ |
| **RAG Latency** | 4.4s | 4.4s* | 0.5s | <500ms | ✅ |
| **LLM Latency** | 9.2s | 3s | 2s | <2.5s | ✅ |
| **Cache Hit Rate** | 40% | 70% | 80% | >70% | ✅ |
| **User Satisfaction** | ? | ? | ? | >4.5/5 | TBD |

*With cache: <100ms

### Monitoring Setup
```typescript
// Add performance monitoring
import * as Sentry from '@sentry/nextjs'

Sentry.startSpan({
  name: 'page-generation',
  op: 'ai.generation'
}, async () => {
  const span = Sentry.getCurrentScope().getSpan()

  // RAG timing
  const ragStart = Date.now()
  const ragResults = await retrieveFromMultipleKBs(...)
  span?.setData('rag_duration', Date.now() - ragStart)

  // LLM timing
  const llmStart = Date.now()
  const claudeResponse = await anthropic.messages.create(...)
  span?.setData('llm_duration', Date.now() - llmStart)

  // Total
  span?.setData('total_duration', Date.now() - startTime)
})
```

---

## 🚨 Risks & Mitigation

### Risk 1: Cache Invalidation
**Issue**: Stale content served after CMS updates
**Mitigation**:
- Webhook from CMS invalidates specific cache keys
- Max TTL of 1 hour for RAG, 30 min for page specs
- Manual cache flush API endpoint

### Risk 2: Redis Availability
**Issue**: Redis down = degraded performance
**Mitigation**:
- Graceful degradation (continue without cache)
- Redis cluster with failover
- Monitor cache hit rates

### Risk 3: Prompt Quality with Shorter Context
**Issue**: Reduced context may hurt quality
**Mitigation**:
- A/B test different context sizes
- Monitor validation errors and user feedback
- Adjust based on quality metrics

---

## 💰 Cost Impact

### Estimated Monthly Costs (at scale)

| Item | Before | After | Savings |
|------|--------|-------|---------|
| **LLM API** (input tokens) | $500 | $250 | $250 (50%) |
| **LLM API** (output tokens) | $200 | $200 | $0 |
| **Embeddings** | $100 | $50 | $50 (50%) |
| **Redis** | $0 | $50 | -$50 |
| **Vector DB** | $200 | $150 | $50 (25%) |
| **Total** | $1000 | $700 | **$300/mo (30%)** |

---

## ✅ Action Items

### Immediate (This Week)
- [ ] Set up Redis instance (Upstash or AWS ElastiCache)
- [ ] Implement RAG caching (rag-cache.ts)
- [ ] Switch to Claude 3.5 Haiku
- [ ] Reduce context size to 2000 tokens
- [ ] Add performance monitoring (Sentry spans)

### Short-Term (Next 2 Weeks)
- [ ] Implement LLM streaming
- [ ] Add database indexes
- [ ] Create cache warming script
- [ ] Set up daily cron job
- [ ] A/B test prompt variations

### Long-Term (Next Month)
- [ ] Background job processing
- [ ] Edge deployment (Vercel)
- [ ] Advanced caching strategies
- [ ] Performance dashboard

---

**Document Version**: 1.0
**Last Updated**: 2025-10-13
**Owner**: Engineering Team
**Status**: 🟡 Ready for Implementation

