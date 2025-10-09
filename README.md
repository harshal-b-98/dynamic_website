# Dynamic AI-Driven Website

> A conversation-first platform that generates personalized web pages dynamically using AI, RAG, and component-based architecture for Consumer IQ GTM Launch.

## 📋 Project Overview

This project implements an innovative AI-driven UI system that:
- Generates web pages dynamically based on user conversations
- Uses RAG (Retrieval-Augmented Generation) for accurate, contextual responses
- Personalizes content based on detected user personas
- Captures and syncs leads automatically to CRM systems
- Maintains enterprise-grade security and compliance

## 🏗️ Architecture

### Core Components
- **Chat Interface**: Persistent, context-aware conversation system
- **RAG Engine**: Vector database + LLM for intelligent content retrieval
- **Component Library**: 50+ reusable React components
- **Personalization Engine**: ML-powered persona detection and content adaptation
- **Lead Capture**: Smart forms with CRM integration

### Tech Stack

**Frontend**
- Next.js 14+ (App Router)
- React 18+
- TypeScript (strict mode)
- Tailwind CSS
- Storybook

**Backend**
- Next.js API Routes
- Prisma ORM
- PostgreSQL

**AI/ML**
- Anthropic Claude (claude-3-5-sonnet-20241022)
- OpenAI Embeddings (text-embedding-ada-002)
- LangChain

**Infrastructure**
- Supabase (pgvector for embeddings)
- Redis (caching)
- Vercel (deployment)

## 📂 Project Structure

```
dynamic_website/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/               # API routes
│   │   ├── (routes)/          # Page routes
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── atoms/            # Basic UI elements
│   │   ├── molecules/        # Composite components
│   │   └── organisms/        # Complex sections
│   ├── lib/                   # Utility libraries
│   │   ├── chat/             # Chat logic
│   │   ├── rag/              # RAG system
│   │   ├── persona/          # Persona detection
│   │   ├── embeddings/       # Vector embeddings
│   │   └── analytics/        # Analytics tracking
│   └── styles/               # Global styles
├── prisma/                    # Database schema
├── public/                    # Static assets
├── .storybook/               # Storybook config
├── ProjectDocuments/         # Project documentation
└── tests/                    # Test files
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database
- Supabase account (for vector database)
- Anthropic API key
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/dynamic_website.git
cd dynamic_website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Database
DATABASE_URL="postgresql://..."

# Supabase (Vector DB)
SUPABASE_URL="https://..."
SUPABASE_SERVICE_KEY="..."

# AI APIs
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# CRM (optional)
SALESFORCE_CLIENT_ID="..."
HUBSPOT_API_KEY="..."
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Seed the knowledge base:
```bash
npm run seed
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Documentation

- **Jira Space**: [DynamicWebsite (DYN)](https://yoursite.atlassian.net/jira/software/projects/DYN)
- **Project Documents**: See `/ProjectDocuments` folder
  - AI Development Memory & Workflow Guide
  - Dynamic AI-Driven UI System PRD
  - UI Design & Development Principles Guide

## 🎯 Key Features

### 1. Intelligent Chat Interface
- Persistent conversation history
- Context-aware responses
- Intent classification
- Multi-turn dialogue support

### 2. RAG Knowledge Base
- Vector database with 10,000+ content chunks
- Semantic search with < 500ms latency
- Real-time content synchronization from CMS
- 85%+ retrieval accuracy

### 3. Dynamic Page Generation
- AI-powered component selection
- Real-time page assembly
- SEO-optimized pages
- A/B testing support

### 4. Persona Detection
- ML-powered user classification
- 85%+ detection accuracy
- Behavioral tracking
- Dynamic content personalization

### 5. Lead Capture & CRM
- Smart forms with 60%+ completion rate
- Automatic lead enrichment
- Real-time CRM sync (Salesforce, HubSpot)
- Conversation context export

## 📊 Jira Epics

| Epic | Stories | Story Points | Status |
|------|---------|--------------|--------|
| [DYN-1] Core Chat & Page Generation | 5 | 63 | 🔵 To Do |
| [DYN-7] RAG Knowledge Base | 5 | 63 | 🔵 To Do |
| [DYN-13] Dynamic Component Library | 4 | 55 | 🔵 To Do |
| [DYN-18] Persona Detection | 3 | 34 | 🔵 To Do |
| [DYN-22] Lead Capture & CRM | 3 | 29 | 🔵 To Do |
| [DYN-26] Security & Compliance | 5 | 42 | 🔵 To Do |
| [DYN-32] Observability & Analytics | 4 | 42 | 🔵 To Do |
| [DYN-37] Performance & Optimization | 5 | 31 | 🔵 To Do |
| **Total** | **34** | **359** | |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run Storybook
npm run storybook
```

## 🔒 Security & Compliance

- **Authentication**: NextAuth.js with MFA support
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Compliance**: GDPR, CCPA, SOC 2 Type II ready
- **Audit Logging**: Comprehensive activity tracking

## 📈 Performance Targets

- Page load time: < 3 seconds
- API response time (p95): < 200ms
- Lighthouse score: > 95
- LCP < 2.5s, FID < 100ms, CLS < 0.1
- Vector search latency: < 500ms

## 🤝 Contributing

1. Check the [Jira board](https://yoursite.atlassian.net/jira/software/projects/DYN) for available stories
2. Create a feature branch: `git checkout -b feature/DYN-XXX-description`
3. Follow the [AI Development Workflow Guide](./ProjectDocuments/AI%20Development%20Memory%20%26%20Workflow%20Guide.pdf)
4. Commit your changes: `git commit -m "DYN-XXX: Description"`
5. Push to the branch: `git push origin feature/DYN-XXX-description`
6. Create a Pull Request

### Commit Message Format
```
DYN-XXX: Brief description

- Detailed point 1
- Detailed point 2

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

## 📝 Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:e2e": "playwright test",
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "seed": "ts-node scripts/seed.ts",
  "populate-kb": "ts-node scripts/populate-kb.ts"
}
```

## 🌐 Environment Variables

See `.env.example` for all required environment variables.

## 📄 License

This project is proprietary and confidential.

## 👥 Team

- **Product**: Consumer IQ Team
- **Development**: [Your Team]
- **AI Assistant**: Claude Code

## 📞 Support

- **Jira**: [DynamicWebsite Project](https://yoursite.atlassian.net/jira/software/projects/DYN)
- **Documentation**: `/ProjectDocuments`

---

**Last Updated**: 2025-10-09
**Version**: 0.1.0
**Status**: 🚧 In Development
