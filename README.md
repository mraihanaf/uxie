# Uxie

**Uxie** is an AI-powered educational platform that, unlike basic LLMs that produce static text, makes learning interactive and engaging with dynamic visualizations, interactive exercises, and adaptive content to help learners grasp complex concepts quickly.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `web`: a [Next.js](https://nextjs.org/) app
- `ai`: a [Mastra](https://mastra.ai/) backend for AI-powered features
- `@uxie/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@uxie/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This project has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Environment Variables

Before running the project, you need to set up environment variables for both the web and AI apps.

### 1. Web App (`apps/web/.env.local`)

Create `apps/web/.env.local` with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key

# Mastra AI Backend URL
# For local development:
NEXT_PUBLIC_MASTRA_API_URL=http://localhost:4111
# For production (when using Docker):
# NEXT_PUBLIC_MASTRA_API_URL=http://ai:4111
```

**Getting Supabase credentials:**

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings → API
4. Copy the `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the `anon` `public` key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

### 2. AI App (`apps/ai/.env`)

Create `apps/ai/.env` with the following variables:

```bash
GROQ_API_KEY=gsk_your_groq_api_key_here
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLEKEY
LIBSQL_URL=file:./mastra.db

# ===========================================
# CORS Configuration (Optional)
# ===========================================
# Allowed origin for CORS (defaults to '*' if not set)
# For production, set to your web app URL:
# ALLOWED_ORIGIN=https://your-web-app.vercel.app
```

**Getting API keys:**

- **Groq API Key**: Sign up at [console.groq.com](https://console.groq.com/) and create an API key
- **Supabase Service Role Key**: Found in Supabase Dashboard → Settings → API → `service_role` `secret` key

### 3. Docker Compose (`.env` in project root)

If using Docker Compose, you can also create a `.env` file in the project root. Docker Compose will automatically load these variables:

```bash
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# Web App
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
NEXT_PUBLIC_MASTRA_API_URL=http://ai:4111

# AI App
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
LIBSQL_URL=file:./mastra.db
ALLOWED_ORIGIN=http://localhost:3000
```

> **Note:** Never commit `.env` or `.env.local` files to version control. They are already included in `.gitignore`.

### Run the project

### Fully Locally Using Docker

> **Warning:** Running Supabase locally can be resource-intensive and may require significant CPU/memory, especially on lower-end machines. Ensure your machine has adequate resources available before starting the full local stack.

```
pnpm install
npx supabase start
npx supabase db push
docker compose up
```

### Without docker

```
pnpm install
npx supabase start
npx supabase db push
pnpm run dev
```

### Build

To build all apps and packages, run the following command:

```bash
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```bash
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=web
turbo build --filter=ai

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
pnpm exec turbo build --filter=web
pnpm exec turbo build --filter=ai
```

### Develop

To develop all apps and packages, run the following command:

```bash
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```bash
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web
turbo dev --filter=ai

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
pnpm exec turbo dev --filter=web
pnpm exec turbo dev --filter=ai
```

## Getting Started

This project uses [pnpm](https://pnpm.io/) as the package manager. To get started:

```bash
# Install dependencies
pnpm install

# Start development servers for all apps
pnpm dev

# Or start a specific app
pnpm --filter web dev
pnpm --filter ai dev
```
