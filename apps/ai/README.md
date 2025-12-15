# Uxie AI Backend - Mastra AI Course Generator

AI-powered backend for generating interactive educational courses using Mastra framework and Groq LLM.

## Features

- **6 Specialized Agents**: Planner, Info, Explainer, Quiz, Grader, Chat
- **JSX Validation**: ESLint-based validation with 5-iteration retry loop
- **Course Creation Workflow**: Parallel chapter generation
- **RAG Support**: Supabase pgvector for document embeddings
- **Memory**: LibSQL for agent memory and chat history
- **Observability**: Built-in tracing and logging

## Prerequisites

- Node.js 22.13.0 or higher
- pnpm package manager
- Groq API key
- Supabase project (for RAG)

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create `.env` file:

```bash
# ===========================================
# AI Provider (Required)
# ===========================================
# Groq API key for LLM inference
GROQ_API_KEY=gsk_your_groq_api_key_here

# OpenAI API key for embeddings (used for RAG)
# If not set, RAG features will be disabled
OPENAI_API_KEY=sk-your_openai_api_key_here

# Optional: Custom embedding model and endpoint
# EMBEDDING_MODEL=text-embedding-3-small
# EMBEDDING_API_URL=https://api.openai.com/v1/embeddings

# ===========================================
# Supabase (Required)
# ===========================================
# Supabase project URL
SUPABASE_URL=https://your-project-id.supabase.co

# Supabase service role key (for backend operations)
# WARNING: Keep this secret! Never expose in frontend
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_ROLE_KEY

# ===========================================
# Database (Internal Mastra Storage)
# ===========================================
# LibSQL database URL for Mastra agent memory
# Default: file-based SQLite in project root
DATABASE_URL=file:./mastra.db
```

### 3. Set Up Supabase Database

Run the migration to create tables:

```bash
# Using Supabase CLI
supabase db push

# Or apply manually from:
# supabase/migrations/001_initial_schema.sql
```

### 3. Run Development Server

```bash
pnpm dev
```

Server runs on [http://localhost:4111](http://localhost:4111)

## Agents

### 1. Planner Agent

- **Input**: Query, time, difficulty, language
- **Output**: Learning path with chapters

### 2. Info Agent

- **Input**: Query, time, difficulty, language
- **Output**: Course title, description, image query

### 3. Explainer Agent

- **Input**: Chapter details, context, RAG docs
- **Output**: JSX component code + key takeaways
- **Validation**: ESLint with 5 retries

### 4. Quiz Agent

- **Input**: Chapter content, difficulty
- **Output**: Mix of MC and open-text questions

### 5. Grader Agent

- **Input**: Question, correct answer, user answer
- **Output**: Points (0-2) + feedback

### 6. Chat Agent

- **Input**: User message, chapter context
- **Output**: Helpful response
- **Memory**: LibSQL per-thread history

## Course Creation Workflow

The workflow uses a parallel processing pattern:

1. **Info Step**: Generate title, description, image query
2. **Plan Step**: Get cover image + learning path (parallel)
3. **Chapters Step**: For each chapter (ALL IN PARALLEL):
   - Generate content + chapter image (parallel)
   - Generate quiz (after content)

```typescript
import { createCourse } from "./workflows/course-creation-workflow";

const course = await createCourse({
  request: {
    query: "Machine Learning basics",
    timeHours: 5,
    difficulty: "medium",
    language: "en",
  },
  userId: "user-123",
});
```

## JSX Validation

ESLint programmatic API with React plugins:

```typescript
import { validateJsx } from "./tools/jsx-validator";

const result = await validateJsx(jsxCode);
if (!result.isValid) {
  console.log(result.errors);
}
```

**Validation Rules**:

- `no-undef` - Undefined variables
- `no-dupe-keys` - Duplicate object keys
- `react/jsx-key` - Missing keys in lists
- `react/jsx-no-undef` - Undefined JSX components
- `react-hooks/rules-of-hooks` - Hook violations

**Retry Loop**: 5 iterations with error feedback to agent

## Visualization Libraries

Available in AI-generated JSX:

- **Recharts**: Charts (line, bar, pie, area, scatter)
- **Latex**: Math equations (KaTeX)
- **Plot**: 3D plots (Plotly)
- **SyntaxHighlighter**: Code blocks
- **RF**: Flow diagrams (ReactFlow)
- **motion**: Animations (Framer Motion)

See `src/mastra/agents/explainer-agent/plugin-docs.ts` for full documentation.

## RAG (Retrieval Augmented Generation)

Supabase pgvector for document embeddings:

```typescript
import { addToVectorStore, searchVectorStore } from "./tools/supabase-vector";

// Add documents
await addToVectorStore({
  courseId: "course-123",
  documents: ["content 1", "content 2"],
});

// Search
const results = await searchVectorStore({
  courseId: "course-123",
  query: "What is machine learning?",
  limit: 5,
});
```

## Observability

Built-in tracing with Mastra:

- Agent execution times
- Token usage
- Error tracking
- Request/response logging

Access at: http://localhost:4111/observability

## Testing

Run tests:

```bash
pnpm test
```

Build:

```bash
pnpm build
```

Start production:

```bash
pnpm start
```

## API Endpoints

### Agents

```bash
# Generate with any agent
POST /api/agents/{agentName}/generate
{
  "messages": [{"role": "user", "content": "..."}],
  "output": { /* optional schema */ },
  "threadId": "optional-thread-id"
}
```

### Workflows

```bash
# Start course creation workflow
POST /api/workflows/courseCreationWorkflow/start
{
  "request": {
    "query": "Topic to learn",
    "timeHours": 5,
    "difficulty": "medium",
    "language": "en"
  }
}
```

## Configuration

### Mastra Config

```typescript
export const mastra = new Mastra({
  workflows: { courseCreationWorkflow },
  agents: {
    plannerAgent,
    infoAgent,
    explainerAgent,
    quizAgent,
    graderAgent,
    chatAgent,
  },
  storage: new LibSQLStore({ url: process.env.DATABASE_URL }),
  logger: new PinoLogger({ name: "Uxie", level: "info" }),
  observability: { default: { enabled: true } },
});
```

### Agent Config

```typescript
export const explainerAgent = new Agent({
  name: "explainerAgent",
  instructions: "...",
  model: groq("llama-3.3-70b-versatile"),
  tools: { validateJsx, getChapterRAGContext },
});
```

## Schemas

All schemas use Zod for validation:

```typescript
import { courseRequestSchema, type CourseRequest } from "./schemas/course";

const request: CourseRequest = {
  query: "React hooks",
  timeHours: 3,
  difficulty: "easy",
  language: "en",
};
```

## Performance

- **Parallel Processing**: All chapters generated simultaneously
- **Caching**: LibSQL for agent memory
- **Retry Logic**: 5 attempts for JSX validation
- **Streaming**: Progress updates via generators
