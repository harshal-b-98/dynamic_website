# Development Priority Queue

> Local-first backlog tracking for Dynamic AI-Driven Website project

**Last Updated**: 2025-10-09

---

## Current Sprint (Week 1-2): Foundation

### P0: Must Do First (Phase 0 Bootstrap)
- [x] Initialize Next.js project structure ✅
- [x] Create workflow folders ✅
- [x] Configure environment variables ✅
- [x] Create Epic 1 context folder ✅
- [ ] Set up testing framework (Jest, React Testing Library)
- [ ] Create initial tests
- [ ] Obtain API keys (Anthropic, OpenAI)
- [ ] Set up Redis for session storage

### P1: Epic 1 - Core Chat & Page Generation (Stories)
**Priority Order for Implementation**:

1. [ ] **DYN-2**: Story 1.1 - Build Persistent Chat Interface (13 pts)
   - **Status**: Not Started
   - **Dependencies**: Testing framework, Redis setup
   - **Estimated Duration**: 3-4 days

2. [ ] **DYN-3**: Story 1.2 - Implement Intent Classification System (8 pts)
   - **Status**: Not Started
   - **Dependencies**: DYN-2 (chat interface), Anthropic API key
   - **Estimated Duration**: 2-3 days

3. [ ] **DYN-4**: Story 1.3 - Build Dynamic Page Generator (21 pts)
   - **Status**: Not Started
   - **Dependencies**: DYN-3 (intent classification)
   - **Estimated Duration**: 5-6 days

4. [ ] **DYN-5**: Story 1.4 - Implement Page Renderer (13 pts)
   - **Status**: Not Started
   - **Dependencies**: DYN-4 (page generator), Component library
   - **Estimated Duration**: 3-4 days

5. [ ] **DYN-6**: Story 1.5 - Context Management System (8 pts)
   - **Status**: Not Started
   - **Dependencies**: DYN-2 (chat), Redis
   - **Estimated Duration**: 2-3 days

---

## Upcoming Sprints

### Week 3-4: Epic 2 - RAG Knowledge Base
- [ ] **DYN-8**: Vector Database Setup
- [ ] **DYN-9**: Content Embedding Pipeline
- [ ] **DYN-10**: RAG Retrieval System
- [ ] **DYN-11**: CMS to Vector DB Reindex Pipeline
- [ ] **DYN-12**: Initial Knowledge Base Population

### Week 5-8: Epic 3 - Dynamic Component Library
- [ ] **DYN-17**: Core Component Library
- [ ] **DYN-14**: Component Registry & Metadata
- [ ] **DYN-15**: Theme System & Design Tokens
- [ ] **DYN-16**: Storybook Documentation

---

## Dependency Graph

```
Phase 0 (Bootstrap)
    ↓
DYN-2 (Chat Interface)
    ↓
DYN-3 (Intent Classification)
    ↓
DYN-4 (Page Generator)
    ↓
DYN-5 (Page Renderer)

DYN-6 (Context Management) ← Can be parallel with DYN-4/DYN-5
```

---

## Blockers & Issues

### 🚨 Current Blockers
1. **API Keys Needed**:
   - Anthropic Claude API (for LLM)
   - OpenAI API (for embeddings in Epic 2)
   - **Impact**: Blocks DYN-3, DYN-4
   - **Action**: User needs to obtain keys from respective platforms

2. **Redis Setup Needed**:
   - For session storage and context management
   - **Impact**: Blocks DYN-2, DYN-6
   - **Action**: Set up local Redis or Upstash

### ⚠️ Upcoming Considerations
- Supabase account needed for Epic 2 (vector database)
- CRM credentials needed for Epic 5 (Salesforce/HubSpot)

---

## Story Points Summary

### Epic 1: Core Chat & Page Generation
- Total: 63 points
- Completed: 0 points
- Remaining: 63 points
- Progress: 0%

### Overall Project
- Total: 359 points (34 stories across 8 epics)
- Completed: 0 points
- Remaining: 359 points
- Progress: 0%

---

## Next Actions

### Immediate (Today)
1. [x] Complete project setup ✅
2. [ ] Set up testing framework
3. [ ] Create first test file
4. [ ] Document API key acquisition process

### Short-term (This Week)
1. [ ] Begin DYN-2: Chat Interface
2. [ ] Set up Redis/Upstash
3. [ ] Create chat UI mockup
4. [ ] Implement message persistence

### Medium-term (Next 2 Weeks)
1. [ ] Complete DYN-2 and DYN-3
2. [ ] Start DYN-4 (Page Generator)
3. [ ] Create first dynamically generated page
4. [ ] E2E test: Chat → Intent → Page

---

## Reference Links
- **Jira Board**: https://yoursite.atlassian.net/jira/software/projects/DYN/boards
- **GitHub Repo**: https://github.com/harshal-b-98/dynamic_website
- **Project Documents**: /ProjectDocuments/

---

**Maintained By**: Development Team
**Format**: Local markdown (syncs to Jira when available)
