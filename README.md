# sender-api

**sender-api** is the backend service for **Sender** — an AI-powered email template platform that helps developers, dev teams, and non-technical founders create, manage, and export professional email templates in minutes.

It handles everything from user authentication and brand configuration to AI-driven template generation, intelligent editing, and multi-format export. Templates can be exported as MJML, plain HTML with inlined styles, or React Email components — all responsive and compatible across every major email client including Outlook.

---

## What It Does

Sender works by learning about your product — your brand colors, fonts, tone, and industry — and using that context to generate a complete suite of email templates tailored to you. From there, you can edit templates visually, refine them through natural language AI prompts, browse a curated library of industry-specific templates, and export in whatever format your stack requires.

The backend is responsible for:

- User authentication with JWT
- Storing and managing brand configurations per user
- AI-powered template generation and editing via Gemini (Claude coming later)
- RAG (Retrieval Augmented Generation) using MongoDB Atlas Vector Search to ground generation in real, proven templates
- A curated library of email templates organized by industry and category
- Exporting templates as MJML, inlined HTML, or React Email JSX
- Brand extraction from external URLs using web scraping
- File storage via Cloudinary

---

## Tech Stack

| Layer                   | Technology                                   |
| ----------------------- | -------------------------------------------- |
| Framework               | NestJS 11 (TypeScript)                       |
| Database                | MongoDB Atlas + Mongoose                     |
| Vector Search           | MongoDB Atlas Vector Search                  |
| AI Orchestration        | LangChain.js                                 |
| AI Provider (default)   | Gemini 2.5 Flash via @langchain/google-genai |
| AI Provider (secondary) | Claude via @langchain/anthropic              |
| Structured Output       | Zod + LangChain `.withStructuredOutput()`    |
| Auth                    | JWT + Passport                               |
| MJML Export             | mjml                                         |
| HTML Export             | juice (CSS inliner)                          |
| React Email Export      | @react-email/components                      |
| File Storage            | Cloudinary                                   |
| Web Scraping            | axios + cheerio                              |
| Validation              | nestjs-zod + class-validator                 |
| Testing                 | Jest (TDD)                                   |
| API Docs                | Swagger (auto-generated)                     |
| Deployment              | Railway                                      |

---

## Prerequisites

- Node.js >= 20
- npm >= 10
- MongoDB Atlas account (or local MongoDB 7+)
- Gemini API key (Google AI Studio)
- Cloudinary account

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-org/sender-api.git
cd sender-api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
NODE_ENV=development
PORT=3000

MONGODB_URI=mongodb+srv://your-cluster.mongodb.net/sender_db

JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

AI_DEFAULT_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
CLAUDE_MODEL=claude-sonnet-4-6

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Run in development

```bash
npm run start:dev
```

The API starts on `http://localhost:3000`.
Swagger docs are available at `http://localhost:3000/docs`.

---

## API Overview

All routes are prefixed with `/api`.

| Module    | Prefix           | Description                          |
| --------- | ---------------- | ------------------------------------ |
| Auth      | `/api/auth`      | Register, login, get current user    |
| Brand     | `/api/brand`     | Brand config CRUD                    |
| Templates | `/api/templates` | User template CRUD                   |
| Library   | `/api/library`   | Browse and clone community templates |
| Generate  | `/api/generate`  | AI template generation               |
| Edit      | `/api/edit`      | AI-assisted editing                  |
| Export    | `/api/export`    | Export to HTML, MJML, React Email    |
| Extract   | `/api/extract`   | Brand extraction from URLs           |

Full interactive documentation is available at `/docs` when the server is running.

---

## AI Provider Switching

Every AI endpoint accepts an optional `provider` field.

```json
{ "provider": "gemini" }
{ "provider": "claude" }
```

If omitted, the value of `AI_DEFAULT_PROVIDER` in `.env` is used (default: `gemini`).

This is handled centrally by `AIRouterService` — no route needs to know which model it is talking to.

---

## Template Schema

All templates are stored as a `blocks` array — a format-agnostic JSON structure that the exporters convert to the target format at export time.

```json
{
  "blocks": [
    { "id": "b1", "type": "header", "props": { "backgroundColor": "#6C63FF" } },
    {
      "id": "b2",
      "type": "text",
      "props": { "content": "Welcome, {{user.firstName}}!", "size": "heading" }
    },
    {
      "id": "b3",
      "type": "button",
      "props": { "label": "Get Started", "url": "{{cta.url}}" }
    },
    { "id": "b4", "type": "footer", "props": { "unsubscribe": true } }
  ],
  "variables": ["user.firstName", "cta.url"]
}
```

Available block types: `header`, `text`, `button`, `image`, `divider`, `footer`, `spacer`, `columns`.

---

## Export Formats

| Format      | Description                                                    |
| ----------- | -------------------------------------------------------------- |
| MJML        | Source MJML markup — compile with any MJML renderer            |
| HTML        | Fully compiled, responsive HTML with all CSS inlined via juice |
| React Email | TypeScript JSX component using @react-email/components         |

```bash
POST /api/export/mjml          # returns MJML string
POST /api/export/html          # returns inlined HTML string
POST /api/export/react-email   # returns TSX component string
POST /api/export/all           # returns all three formats
```

---

## Project Structure

```
src/
├── config/                  # Configuration factory
├── common/                  # Shared guards, filters, pipes
├── schemas/zod/             # Zod schemas for AI output contracts
└── modules/
    ├── auth/                # JWT authentication
    ├── users/               # User management
    ├── brand/               # Brand config CRUD
    ├── templates/           # Template CRUD
    ├── library/             # Curated library browsing + cloning
    ├── generate/            # AI generation endpoints
    ├── edit/                # AI editing endpoints
    ├── export/              # Format export + exporters
    │   └── exporters/       # MjmlExporter, HtmlExporter, ReactEmailExporter
    ├── extract/             # URL brand extraction
    └── ai/                  # LangChain AI layer
        ├── providers/       # GeminiProvider, ClaudeProvider
        ├── rag/             # RAG retrieval service
        └── prompts/         # Prompt builder functions
```

---

## Testing

This project is built using Test-Driven Development (TDD). Every service and controller has a corresponding `.spec.ts` file.

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run in watch mode
npm run test:watch

# Run a specific module
npm test -- --testPathPattern=auth.service
```

Coverage target: > 75% across all modules.

No test makes a real API call to Gemini or Claude — all AI providers are mocked at the LangChain model level.

---

## MongoDB Atlas Vector Search Setup

RAG requires a vector index on the `library_templates` collection.

1. Go to your cluster → Search → Create Search Index
2. Select JSON Editor and use this configuration:

```json
{
  "fields": [
    {
      "numDimensions": 768,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}
```

3. Name the index `vector_index`

Embeddings are generated automatically using Google's `text-embedding-004` model.

---

## Deployment (Railway)

```bash
railway login
railway link
railway up
```

Set `NODE_ENV=production` and provide all required environment variables in the Railway dashboard.

---

## Roadmap

- Claude as primary provider option (currently secondary)
- Stripe integration for Pro plan
- Redis caching for frequently accessed library templates
- BullMQ job queue for large generation suites
- CLI tool for developers to pull templates programmatically
- Resend integration for platform transactional emails

---

## License

MIT
