# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy workspace files for monorepo support
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/ai/package.json ./apps/ai/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/ai ./apps/ai

# Copy node_modules from deps stage (pnpm hoists to root)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# Build Mastra application
WORKDIR /app/apps/ai
RUN pnpm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 mastra

# Copy built Mastra output
COPY --from=builder --chown=mastra:nodejs /app/apps/ai/.mastra/output ./.mastra/output

USER mastra

EXPOSE 4111

ENV PORT=4111
ENV HOSTNAME="0.0.0.0"

# Run Mastra server with instrumentation for observability
CMD ["node", "--import=./.mastra/output/instrumentation.mjs", ".mastra/output/index.mjs"]