# Epic 2: Enhancements & Improvements

## Overview
This document tracks continuous improvement ideas, technical debt, and enhancement opportunities identified during Epic 2 (RAG Knowledge Base) development.

---

## Proposed Enhancements

### Enhancement #01: Free Local Embedding Models Alternative

**Rationale**: Currently using OpenAI text-embedding-ada-002 at $0.0001/1k tokens. While cost is minimal for current scale ($0.0009 per full population), implementing free local embedding models would:
- Eliminate ongoing API costs entirely ($0.00)
- Improve privacy (embeddings generated locally, no data sent to external APIs)
- Remove dependency on external API availability and rate limits
- Enable faster processing for large-scale document populations (no network latency)

**Cost Comparison**:
- **Current (OpenAI)**: $0.0009 per 9,095 tokens = $0.20 per 1M tokens
- **sentence-transformers (Local)**: $0.00 for unlimited tokens
- **Break-even**: ~1,000 documents or 1M+ tokens processed

**Technical Notes**:
- **Dependencies**:
  - Python 3.8+ runtime
  - `sentence-transformers` library (~500MB download)
  - Optional: CUDA/GPU support for faster processing
- **Affected Modules**:
  - `src/lib/rag/pipeline.ts` - Add embedding provider abstraction
  - `src/lib/rag/embeddings.ts` (new) - Create provider interface
  - `src/scripts/populate-kb.ts` - Add `--provider` CLI flag
- **Implementation Approach**:
  1. Create embedding provider interface (OpenAI, SentenceTransformers, HuggingFace)
  2. Implement Python bridge for sentence-transformers
  3. Add configuration option to select provider
  4. Update CLI tools to support provider selection
  5. Maintain backward compatibility with existing OpenAI embeddings

**Recommended Models**:
- `all-MiniLM-L6-v2` (384 dims) - Fast, good quality
- `all-mpnet-base-v2` (768 dims) - Better quality, slower
- `multi-qa-mpnet-base-dot-v1` (768 dims) - Optimized for Q&A retrieval

**Performance Expectations**:
- OpenAI: ~2-3 seconds per document (network + API)
- Local CPU: ~5-10 seconds per document
- Local GPU: ~1-2 seconds per document

**Next Steps**:
  - [ ] Create Jira sub-task (DYN-XX)
  - [ ] Research optimal local model for Consumer IQ use case
  - [ ] Prototype Python bridge implementation
  - [ ] Benchmark quality comparison (OpenAI vs local models)
  - [ ] Estimate migration effort (3-5 story points)

**Priority**: Medium (Nice to have, not urgent)

**Status**: Proposed

**Reference**:
- Discussion: Session 2025-10-10 (user inquiry about free alternatives)
- OpenAI Pricing: $0.0001 per 1k tokens
- sentence-transformers: https://www.sbert.net/
- Hugging Face Models: https://huggingface.co/models?pipeline_tag=sentence-similarity

---

## Technical Debt

### High Priority Debt
_None identified_

### Medium Priority Debt

**Debt #01: Vector Database Migration Strategy**
- **Issue**: No documented procedure for migrating embeddings if we change models
- **Impact**: Switching from OpenAI (1536 dims) to local models (768 dims) requires full repopulation
- **Resolution**: Create migration scripts and document process
- **Effort**: 2 story points

### Low Priority Debt
_None identified_

---

## Future Considerations

### Scalability Improvements

**Scale #01: Batch Processing Optimization**
- Current: Process documents sequentially
- Future: Parallel processing with worker pool (5-10 concurrent)
- Expected gain: 5-10x faster population for large document sets

**Scale #02: Incremental Updates**
- Current: Full repopulation on every run
- Future: Delta detection - only process changed documents
- Expected gain: 10-100x faster for routine updates

### Performance Optimizations

**Perf #01: Embedding Cache Layer**
- Cache embeddings for frequently accessed content
- Reduce redundant API calls for duplicate queries
- Redis or in-memory cache with smart eviction

**Perf #02: Retrieval Query Optimization**
- Implement ANN (Approximate Nearest Neighbor) with IVFFlat
- Pre-filter by metadata before vector search
- Query result caching with 15-min TTL (already implemented)

### User Experience Enhancements

**UX #01: Real-time Population Status**
- WebSocket-based progress updates
- Visual progress bar in admin UI
- Estimated time remaining

**UX #02: Content Preview Before Population**
- Preview parsed text before embedding
- Validate content quality
- Manual chunk boundary adjustment

### Knowledge Base Content Expansion

**Content #01: Additional Content Sources**
- Case studies
- Customer testimonials
- Product documentation
- Blog posts and articles
- Video transcripts

**Content #02: Multi-language Support**
- Embeddings for Spanish, French, German
- Language-specific retrieval optimization
- Multi-lingual models (e.g., `paraphrase-multilingual-mpnet-base-v2`)

---

## Lessons Applied to Future Work

### What Worked Well
1. **CLI-first approach** - Operational tools were easy to use and debug
2. **Comprehensive validation suite** - 22 test queries caught issues early
3. **Incremental development** - Building pipeline → retrieval → population in stages
4. **Clear documentation** - Well-documented code and architecture decisions

### What Could Be Improved
1. **Earlier dependency testing** - pdf-parse v2.x compatibility issue could have been caught sooner
2. **Performance benchmarking from start** - Should have baseline metrics before optimization
3. **Error recovery** - Add retry logic and graceful degradation for API failures

---

**Last Updated**: 2025-10-10
**Epic Status**: Complete
**Next Review**: Before Epic 3 kickoff
