# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl git
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build?schema=public

# Build-time arguments for Shopify deployment
ARG SHOPIFY_APP_URL
ARG SHOPIFY_API_KEY
ARG SHOPIFY_APP_DEPLOYMENT_TOKEN
ARG SHOPIFY_CLI_PARTNERS_TOKEN

# Convert ARGs to ENVs so they are available during run steps
ENV SHOPIFY_APP_URL=$SHOPIFY_APP_URL
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
ENV SHOPIFY_APP_DEPLOYMENT_TOKEN=$SHOPIFY_APP_DEPLOYMENT_TOKEN
ENV SHOPIFY_CLI_PARTNERS_TOKEN=$SHOPIFY_CLI_PARTNERS_TOKEN

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN chmod +x scripts/prisma-schema-engine-stub.sh \
  && PRISMA_SCHEMA_ENGINE_BINARY=./scripts/prisma-schema-engine-stub.sh pnpm run prisma:generate \
  && if [ -n "$SHOPIFY_APP_DEPLOYMENT_TOKEN" ] || [ -n "$SHOPIFY_CLI_PARTNERS_TOKEN" ]; then \
       echo "Deploying Shopify app configuration and extensions..."; \
       pnpm run deploy; \
     else \
       echo "Skipping Shopify app deployment (no SHOPIFY_APP_DEPLOYMENT_TOKEN or SHOPIFY_CLI_PARTNERS_TOKEN provided)"; \
     fi \
  && pnpm run build \
  && pnpm prune --prod --ignore-scripts

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl tini \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
COPY --chown=nextjs:nodejs --from=builder /app/package.json ./package.json
COPY --chown=nextjs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs --from=builder /app/.next ./.next
COPY --chown=nextjs:nodejs --from=builder /app/public ./public
COPY --chown=nextjs:nodejs --from=builder /app/prisma ./prisma
COPY --chown=nextjs:nodejs --from=builder /app/prisma.config.js ./prisma.config.js
COPY --chown=nextjs:nodejs --from=builder /app/scripts ./scripts
COPY --chown=nextjs:nodejs --from=builder /app/utils ./utils
COPY --chown=nextjs:nodejs --from=builder /app/next.config.js ./next.config.js
COPY --chown=nextjs:nodejs --from=builder /app/jsconfig.json ./jsconfig.json
USER nextjs
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "scripts/docker-start.js"]
