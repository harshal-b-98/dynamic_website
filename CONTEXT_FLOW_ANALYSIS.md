# Context Flow Analysis for UI Generation

## 📊 Complete Context Flow During Page Generation

This document details **exactly what context** is passed to the LLM when generating UI pages.

---

## 🔄 Generation Pipeline Overview

```
User Query → Intent Classification → Knowledge Base Retrieval → Context Building → LLM Prompt → Page Generation → Quality Validation → Final Page
```

---

## 1️⃣ **Input: PageGenerationRequest**

When a user makes a query, the following information is collected:

```typescript
interface PageGenerationRequest {
  query: string              // User's question/request
  intent: string            // Detected intent (product_inquiry, demo_request, etc.)
  sessionId: string         // User session ID
  persona?: string          // Detected user persona (supplier, distributor, technical, etc.)
  conversationHistory?: Array<{  // Previous conversation messages
    role: 'user' | 'assistant'
    content: string
  }>
}
```

**Example**:
```json
{
  "query": "What are the main features of ConsumerIQ?",
  "intent": "product_inquiry",
  "sessionId": "ps_1234567890",
  "persona": "technical",
  "conversationHistory": [
    { "role": "user", "content": "Tell me about your product" },
    { "role": "assistant", "content": "ConsumerIQ is a supply chain platform..." }
  ]
}
```

---

## 2️⃣ **Knowledge Base Retrieval (RAG)**

Based on the query, the system retrieves relevant context from **3 knowledge bases**:

### **A. Guidelines Knowledge Base** 📐
- **Purpose**: UI/UX patterns, brand voice, design decisions
- **Content Retrieved**: Design guidelines, component usage patterns, brand tone

### **B. Personas Knowledge Base** 👤
- **Purpose**: Understand target audience behavior and preferences
- **Content Retrieved**: Persona characteristics, messaging preferences, user needs

### **C. Product Knowledge Base** 🎯
- **Purpose**: Factual product information, features, capabilities
- **Content Retrieved**: Feature descriptions, technical specs, use cases

### **Retrieval Process**:
```typescript
const kbRetrieval = await retrieveFromMultipleKBs(query, {
  intent: 'product_inquiry',
  threshold: 0.7  // 70% similarity threshold
})

// Results:
{
  guidelines: [/* RetrievalResult[] */],
  personas: [/* RetrievalResult[] */],
  product: [/* RetrievalResult[] */],
  totalResults: 5,
  processingTime: 4448  // ms
}
```

### **Context Building**:
```typescript
const builtContext = contextBuilder.buildMultiKBContext(
  kbRetrieval.guidelines,
  kbRetrieval.personas,
  kbRetrieval.product,
  query,
  {
    maxTokens: 4000,        // Max 4000 tokens of KB context
    format: 'markdown',     // Formatted as markdown
    includeMetadata: false  // No metadata included
  }
)

// Result:
{
  context: "# Relevant Knowledge Base Information...",
  tokenCount: 2142,
  resultsIncluded: 2,
  metadata: {
    sources: ["Product Features Guide", "Technical Persona Profile"],
    contentTypes: ["guidelines", "personas", "product"]
  }
}
```

**Formatted KB Context Structure**:
```markdown
# Relevant Knowledge Base Information

Query: "What are the main features of ConsumerIQ?"

The following information from multiple knowledge bases is relevant:

---

## 📐 UI/UX Guidelines

### Feature Grid Best Practices

Use 3-4 features maximum for clean layouts...

### Brand Voice Guidelines

Professional yet conversational tone...

---

## 👤 User Personas

### Technical Persona

Focus on specs, integrations, architecture, APIs...

---

## 🎯 Product Knowledge

### ConsumerIQ Core Features

Real-time inventory tracking
Predictive analytics
Multi-channel integration
...

---

Please use the above information to provide an accurate, brand-consistent, and persona-aware response.
```

---

## 3️⃣ **System Prompt Construction**

The system prompt includes:

### **A. Role & Instructions**
```
You are an expert page generation system for a dynamic, AI-driven website platform.

Generate complete, production-ready page specifications based on user queries,
conversation context, and detected intent.
```

### **B. Knowledge Base Context** (if retrieved)
```markdown
## Knowledge Base Context

[2142 tokens of structured KB content from Guidelines, Personas, Product KBs]

**Instructions for using this knowledge:**
- Use guidelines KB for UI/UX patterns, brand voice, and design decisions
- Use personas KB to tailor content style and messaging to the target audience
- Use product KB for factual product information, features, and capabilities
- Ensure all generated content aligns with the brand guidelines provided
- DO NOT hallucinate features or capabilities not mentioned in the knowledge base
```

### **C. Component Registry** (~50+ components)
```
## Available Component Library

{
  "hero-section": {
    "description": "Primary page introduction...",
    "requiredProps": ["headline", "subheading"],
    ...
  },
  "feature-grid": { ... },
  "cta-section": { ... },
  ... (50+ more components)
}
```

### **D. Design System Guidelines** (NEW!)
```markdown
## Layout & Spacing Guidelines ⚠️ ABSOLUTELY CRITICAL

**IMPORTANT**: All pages undergo automatic UI quality validation based on
shadcn/ui, Vercel, and Tailwind CSS best practices.

### 1. Spacing Standards (Vercel Minimalism)
- ✅ spacing = "spacious" (REQUIRED - 80px between components)
- ❌ NEVER use "compact" or "normal"

### 2. Component Count Limits
- ✅ MAXIMUM 5 components per page
- Optimal: 3-4 components

### 3. Visual Hierarchy
- ✅ First component MUST be "hero-section" or "page-header"
- ✅ Last component should be "cta-section"

### 4. Component Sizing
- ✅ Hero sections: size="xl" (REQUIRED)
- ✅ All other components: size="lg" minimum

### 5. Feature Grids
- ✅ MAXIMUM 4 features per grid
- ✅ Each feature: 80-100 chars description

### 6. Content Quality
- Headlines: 60-80 characters MAX
- Subheadings: 120-160 characters MAX
- NO placeholder content

### 7. Accessibility
- ALL images MUST have descriptive alt text
- CTA buttons: Action verbs only

## Quality Validation System
All pages are scored 0-100:
- 90-100: ✨ Excellent
- 75-89: 👍 Good
- 60-74: ⚠️ Fair (auto-corrected)
- <60: ❌ Poor (may regenerate)
```

### **E. Pre-Submission Checklist**
```
## ⚠️ PRE-SUBMISSION CHECKLIST
✅ layout.spacing = "spacious"
✅ Total components = 3-5
✅ First component = "hero-section" or "page-header"
✅ Hero size = "xl"
✅ All other components size = "lg" or "xl"
✅ Feature grids = 3-4 items MAX
✅ Feature descriptions = 80-100 chars MAX
✅ Headlines = 60-80 chars
✅ All images have alt text
✅ CTAs use action verbs
```

**Total System Prompt Size**: ~15,000-20,000 tokens

---

## 4️⃣ **User Message Construction**

The user message sent to the LLM includes:

```markdown
## Page Generation Request

**User Query:** What are the main features of ConsumerIQ?

**Detected Intent:** product_inquiry

**Intent Context:**
Focus on features, capabilities, and value propositions.
Recommended components: hero-section, feature-grid, testimonial-block, cta-section
Include clear explanations of what the product does and how it helps users.

**Detected Persona:** technical
Technical Persona - Focus on specs, integrations, architecture, APIs.
Tone: Technical, detailed, precise
CTAs: "View Documentation", "See API Reference", "Start Integration"

**Conversation History:**
1. [user]: Tell me about your product
2. [assistant]: ConsumerIQ is a supply chain platform that...

**Instructions:**
Generate a complete PageSpecification optimized for this query and intent.
Select the most appropriate components, create relevant content, and ensure
the page directly addresses the user's needs.

Respond with ONLY the JSON PageSpecification (no other text).
```

---

## 5️⃣ **Complete Context Summary**

### **Total Context Sent to LLM**:

| Component | Token Estimate | Content |
|-----------|---------------|---------|
| **System Prompt Base** | ~2,000 | Role, instructions, quality guidelines |
| **Knowledge Base Context** | ~2,000-4,000 | Retrieved from Guidelines/Personas/Product KBs |
| **Component Registry** | ~8,000-10,000 | 50+ component definitions |
| **Design System Rules** | ~2,000 | Spacing, sizing, validation standards |
| **User Message** | ~500-1,000 | Query, intent, persona, conversation history |
| **Total Input** | ~15,000-20,000 | Full context for generation |

### **Context Categories**:

1. **📐 UI/UX Guidelines** (from KB)
   - Component usage patterns
   - Design best practices
   - Brand voice and tone
   - Spacing and layout standards

2. **👤 Persona Information** (from KB + detection)
   - Target audience characteristics
   - Messaging preferences
   - Tone recommendations
   - Preferred CTAs

3. **🎯 Product Knowledge** (from KB)
   - Feature descriptions
   - Technical specifications
   - Use cases and benefits
   - Integration capabilities

4. **🎨 Design System Rules** (built-in)
   - Vercel/shadcn/Tailwind standards
   - Spacing requirements (80px spacious)
   - Component sizing rules (xl for hero, lg for others)
   - Feature limits (max 4 per grid)
   - Content length limits
   - Accessibility requirements

5. **🗣️ Conversation Context**
   - Last 5 messages
   - User's previous questions
   - Assistant's previous responses
   - Conversation flow

6. **🧩 Component Library**
   - 50+ available components
   - Required props for each
   - Optional styling variants
   - Usage examples

---

## 6️⃣ **LLM Generation Output**

The LLM generates a **PageSpecification JSON**:

```json
{
  "type": "landing",
  "metadata": {
    "title": "ConsumerIQ Features - Supply Chain Intelligence Platform",
    "description": "Discover ConsumerIQ's powerful features...",
    "keywords": ["supply chain", "features", "analytics"],
    "generatedFor": "What are the main features of ConsumerIQ?"
  },
  "layout": {
    "type": "single-column",
    "spacing": "spacious",  // ✅ Enforced by guidelines
    "components": [
      {
        "id": "hero-1",
        "componentType": "hero-section",
        "order": 0,  // ✅ First component is hero
        "props": {
          "headline": "Transform Your Supply Chain with AI",
          "subheading": "Real-time visibility, predictive analytics...",
          "ctaText": "View Documentation",  // ✅ Persona-specific CTA
          "secondaryCta": "Start Integration"
        },
        "styling": {
          "size": "xl",  // ✅ Hero is xl
          "theme": "brand"
        }
      },
      {
        "id": "features-1",
        "componentType": "feature-grid",
        "order": 1,
        "content": {
          "title": "Core Features",
          "features": [  // ✅ Only 4 features
            {
              "icon": "dashboard",
              "title": "Real-Time Inventory Tracking",
              "description": "Monitor stock levels across all locations with instant updates."  // ✅ 80-100 chars
            },
            // ... 3 more features
          ]
        },
        "styling": {
          "size": "lg",  // ✅ Not hero, so lg
          "variant": "3"
        }
      },
      {
        "id": "cta-1",
        "componentType": "cta-section",
        "order": 2,  // ✅ Last component is CTA
        "props": {
          "headline": "Ready to Integrate?",
          "primaryCta": "Start Integration",  // ✅ Action verb
          "secondaryCta": "View API Reference"
        },
        "styling": {
          "size": "lg",
          "theme": "brand"
        }
      }
    ]
  },
  "navigation": {
    "breadcrumbs": [...],
    "relatedQueries": [...],
    "nextSteps": [...]
  }
}
```

**Output Token Count**: ~1,000-2,000 tokens

---

## 7️⃣ **Post-Generation Validation & Correction**

After LLM generates the page, the system automatically:

### **A. Validates Against Standards**:
```typescript
const qualityResult = validateAndCorrectUIQuality(pageSpec)

// Quality checks:
// ✅ Spacing is "spacious"
// ✅ Hero section is size="xl"
// ✅ Total components ≤ 5
// ✅ Feature grids have ≤ 4 items
// ✅ Content lengths within limits
// ✅ Images have alt text
// ✅ CTAs use action verbs
```

### **B. Auto-Corrections Applied**:
```
📊 UI Quality Report
Score: 95/100 🌟
Status: ✅ PASS

Auto-Corrections Applied:
✅ Fixed: Changed layout spacing to "spacious"
✅ Fixed: Set Hero section to size="xl"
✅ Fixed: Reduced feature grid from 5 to 4 items
✅ Fixed: Truncated subheading from 180 to 160 chars
✅ Fixed: Added alt text to hero image
```

### **C. Final Corrected Page**:
```typescript
{
  corrected: PageSpecification,  // Auto-corrected version
  score: 95,                     // Quality score (0-100)
  issues: [],                    // Any remaining issues
  autoCorrections: [...]         // What was fixed
}
```

---

## 📈 **Context Impact on UI Quality**

### **Before Context Improvements** (Old System):
- ❌ No KB context → generic, non-brand-aligned content
- ❌ No persona awareness → one-size-fits-all messaging
- ❌ No design system enforcement → inconsistent spacing
- ❌ No quality validation → poor layouts

### **After Context Improvements** (Current System):
- ✅ **KB Context** (2,000-4,000 tokens) → Brand-aligned, factually accurate content
- ✅ **Persona Context** → Tailored messaging and CTAs
- ✅ **Design System Rules** → Consistent shadcn/Vercel/Tailwind styling
- ✅ **Quality Validation** → Auto-corrected to 90+ score

---

## 🎯 **Key Context Features**

### **1. Knowledge Base Integration**:
- Retrieves relevant content from 3 specialized KBs
- Provides factual grounding (no hallucinations)
- Ensures brand consistency

### **2. Persona Awareness**:
- Adapts tone and messaging to user type
- Suggests persona-appropriate CTAs
- Tailors content complexity

### **3. Design System Enforcement**:
- Built-in shadcn/Vercel/Tailwind standards
- Automatic spacing enforcement (80px spacious)
- Component sizing rules (xl for heroes, lg for others)
- Content length limits
- Accessibility requirements

### **4. Quality Validation**:
- 100-point scoring system
- 6 validation categories
- Auto-correction for common issues
- Detailed quality reports

### **5. Conversation History**:
- Maintains context across turns
- References previous questions/answers
- Builds on prior knowledge

---

## 💡 **Example: Full Context for "What are the main features?"**

**Total Tokens Sent**: ~18,500

1. **System Prompt** (~15,000 tokens):
   - Role and instructions (500)
   - KB Context: Guidelines (700)
   - KB Context: Personas (600)
   - KB Context: Product (800)
   - Component Registry (8,000)
   - Design System Rules (2,000)
   - Quality Validation Info (500)
   - Pre-submission checklist (200)

2. **User Message** (~500 tokens):
   - Query: "What are the main features of ConsumerIQ?"
   - Intent: product_inquiry
   - Intent-specific guidance
   - Persona: technical
   - Persona-specific guidance
   - Conversation history (last 5 messages)

3. **LLM Output** (~1,200 tokens):
   - PageSpecification JSON
   - 3-4 components
   - Complete content

4. **Quality Report** (logged, not sent):
   - Score: 95/100
   - 3 auto-corrections applied
   - Ready to render

---

## 🔍 **Console Logs During Generation**

```bash
Retrieving knowledge base context for intent: product_inquiry
KB retrieval stats: {
  guidelines: 1,
  personas: 1,
  product: 3,
  total: 5,
  processingTime: 4448
}
Built KB context: 2142 tokens, 2 results
Running UI quality validation...

📊 UI Quality Report
Score: 95/100 🌟
Status: ✅ PASS

Auto-Corrections Applied:
✅ Fixed: Changed layout spacing to "spacious"

✨ Excellent UI quality score: 95/100

Page generation successful: {
  requestId: 'dbf51b42-f8c2-4634-9b17-2390a6ba955f',
  query: 'What are the main features of ConsumerIQ?',
  intent: 'product_inquiry',
  generationTime: 13579,
  llmTokens: { input: 11242, output: 1236 },
  componentsGenerated: 4,
  cached: false,
  success: true
}
```

---

## ✅ **Summary**

### **Context Passed to LLM**:
1. ✅ **User Query** - What they're asking
2. ✅ **Detected Intent** - What they want (product_inquiry, demo_request, etc.)
3. ✅ **Persona** - Who they are (technical, executive, supplier, etc.)
4. ✅ **Conversation History** - What was discussed before
5. ✅ **Knowledge Base Content** - Brand guidelines, persona profiles, product info
6. ✅ **Component Library** - 50+ available components
7. ✅ **Design System Rules** - shadcn/Vercel/Tailwind standards
8. ✅ **Quality Requirements** - Spacing, sizing, content limits, accessibility

### **Result**:
Professional, brand-aligned, persona-tailored, design-system-compliant pages with **95+ quality scores** and automatic corrections applied! 🌟
