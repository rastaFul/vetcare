# ── Dependencies stage ───────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Build stage ──────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before build
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder for build-time only: prisma.ts throws if unset during page-data
# collection (no real DB access happens at build time). Runtime uses the real
# DATABASE_URL injected via env/secret at container start.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build_placeholder"
RUN npm run build

# ── Runtime stage ────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=appuser:appgroup /app/.next ./.next
COPY --from=builder --chown=appuser:appgroup /app/public ./public
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
COPY --from=builder --chown=appuser:appgroup /app/next.config.ts ./
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma

USER appuser

EXPOSE 3004

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q --spider http://localhost:3004 || exit 1

CMD ["node_modules/.bin/next", "start", "-p", "3004"]
