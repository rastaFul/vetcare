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

# /api/health (not root "/") -- root 307-redirects via NextAuth to the
# ABSOLUTE public URL (NEXTAUTH_URL, e.g. https://vetcare.rastaful.dev),
# which wget --spider follows -- meaning liveness depended on outbound
# internet + the Cloudflare Tunnel being up, backwards for a container
# healthcheck. Found 2026-08-28 while debugging a real tunnel outage:
# this container falsely reported "unhealthy" even though the app itself
# was fine, confusing the actual diagnosis. Every other app in this infra
# already uses a dedicated /api/health or /health endpoint for this
# reason (see infra-platform docs/reference/docker-build-conventions.md).
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q --spider http://localhost:3004/api/health || exit 1

CMD ["node_modules/.bin/next", "start", "-p", "3004"]
