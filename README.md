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
