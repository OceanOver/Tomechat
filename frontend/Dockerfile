FROM node:20-slim AS base

## Install dependencies only when needed
FROM base AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# If you want to build docker in China
# RUN npm config set registry https://registry.npmmirror.com/
RUN pnpm i

COPY . .
RUN pnpm run build:docker # run build standalone for docker version

## Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3210

# set hostname to localhost
ENV HOSTNAME "0.0.0.0"
ENV PORT=3210

# General Variables (all read at runtime, can be overridden via docker compose)
ENV ACCESS_CODE ""
ENV CUSTOM_MODELS ""
ENV SITE_URL ""

# Backend proxy endpoints (default targets a local source deployment;
# override via environment variables when deploying in containers)
ENV TOMECHAT_PROXY_URL "http://localhost:7861/v1"
ENV KNOWLEDGE_PROXY_URL "http://localhost:7861/knowledge_base"

# Optional: sub-path deployment
ENV NEXT_PUBLIC_BASE_PATH ""

CMD ["node", "server.js"]
