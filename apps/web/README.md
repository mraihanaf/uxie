# Uxie Web App

The frontend for Uxie - an AI-powered educational platform that transforms static learning into interactive experiences.

## Features

- **AI-Generated Courses**: Create personalized courses on any topic
- **Interactive Visualizations**: Dynamic charts, code examples, and mathematical formulas
- **Adaptive Quizzes**: AI-graded assessments with personalized feedback
- **AI Tutor Chat**: Ask questions and get contextual explanations
- **Bilingual Support**: English and Indonesian language support
- **Progress Tracking**: Track your learning journey across courses

## Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS 4 with custom design system
- **Auth & Database**: Supabase (PostgreSQL, Auth, Realtime)
- **AI Backend**: Mastra AI
- **Visualization Libraries**: Recharts, React Plotly, React Flow, KaTeX

## Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase project with the schema applied
- Mastra AI backend running (see `../ai/README.md`)

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_PUBLISHABLE_DEFAULT_KEY

# Mastra AI Backend
NEXT_PUBLIC_MASTRA_API_URL=http://localhost:4111
```

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Run the development server:

```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Adding New Components

1. Create component in `src/components/`
2. Follow the design tokens in `globals.css`
3. Use existing UI primitives from `src/components/ui/`

## Deployment

Build the production bundle:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Related

- [Mastra AI Backend](../ai/README.md) - AI agents and course generation
