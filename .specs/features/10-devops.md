# DevOps Strategy — VetCare

## Ambientes

| Ambiente | Propósito | URL |
|----------|-----------|-----|
| `development` | Local dev | http://localhost:3001 |
| `production` | Produção | https://vetcare.rastaful.dev |

---

## Stack de Infra — Decisão: Cloudflare Tunnel (Infra Existente)

### Por que Cloudflare Tunnel em vez de VPS novo?

O usuário já possui Cloudflare Tunnel configurado em `~/.cloudflared/config.yml` servindo outros projetos (`financas.rastaful.dev`, `grow.rastaful.dev`). O VetCare utiliza a mesma infraestrutura.

**Benefícios:**
- Zero custo adicional
- HTTPS automático (gerenciado pela Cloudflare)
- Sem Nginx, sem certbot, sem gestão de SSL
- Deploy imediato: basta adicionar entrada no config.yml

### Adição ao Tunnel Existente

```yaml
# ~/.cloudflared/config.yml — adicionar:
- hostname: vetcare.rastaful.dev
  service: http://localhost:3001
```

```bash
# Reiniciar tunnel após edição
sudo systemctl restart cloudflared
```

**Porta da aplicação**: 3001 (disponível; 3000 é financas.rastaful.dev)

---

## Docker

### Dockerfile

```dockerfile
# Dockerfile
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose.yml (produção)

```yaml
version: '3.9'

services:
  app:
    image: vetcare:${VERSION:-latest}
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
      - R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
      - R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
      - R2_BUCKET_NAME=${R2_BUCKET_NAME}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - vetcare

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: vetcare
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - vetcare

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - certbot_conf:/etc/letsencrypt
      - certbot_www:/var/www/certbot
    depends_on:
      - app
    networks:
      - vetcare

  certbot:
    image: certbot/certbot
    volumes:
      - certbot_conf:/etc/letsencrypt
      - certbot_www:/var/www/certbot

volumes:
  postgres_data:
  certbot_conf:
  certbot_www:

networks:
  vetcare:
    driver: bridge
```

### docker-compose.dev.yml (desenvolvimento)

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: vetcare_dev
      POSTGRES_USER: vetcare
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_dev:/var/lib/postgresql/data

volumes:
  postgres_dev:
```

---

## CI/CD — GitHub Actions

### Pipeline Completo

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: vetcare_test
          POSTGRES_USER: vetcare
          POSTGRES_PASSWORD: secret
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci
      - run: npx prisma generate
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm test -- --coverage
        env:
          DATABASE_URL: postgresql://vetcare:secret@localhost:5432/vetcare_test
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://vetcare:secret@localhost:5432/vetcare_test
      - run: npm audit --audit-level=critical

  e2e:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npm run test:e2e
        env:
          NEXTAUTH_SECRET: test-secret
          # ... outros envs de teste

  deploy:
    needs: [quality, e2e]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: |
          docker build -t vetcare:${{ github.sha }} .
          docker tag vetcare:${{ github.sha }} ghcr.io/${{ github.repository }}:${{ github.sha }}
          docker tag vetcare:${{ github.sha }} ghcr.io/${{ github.repository }}:latest

      - name: Push to registry
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push ghcr.io/${{ github.repository }}:${{ github.sha }}
          docker push ghcr.io/${{ github.repository }}:latest

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/vetcare
            docker pull ghcr.io/${{ github.repository }}:latest
            docker compose up -d --no-deps app
            docker exec vetcare_app npx prisma migrate deploy
            docker system prune -f
```

---

## Observabilidade

### Logs
- **Biblioteca**: Pino (JSON structured logging)
- **Campos**: `timestamp`, `level`, `service`, `tenantId`, `userId`, `traceId`, `message`
- **Sem PII** em logs (sem CPF, email, tokens)
- **Agregação**: Loki + Grafana (futuro) ou Papertrail (MVP simples)

### Métricas
- Response time por endpoint (Next.js instrumentation)
- Error rate por endpoint
- DB query time (Prisma metrics)

### Error Tracking
- **Sentry** com source maps
- `beforeSend`: remover dados sensíveis
- Alertas por email para erros novos

### Health Check
```
GET /api/health
Response: {
  status: "ok" | "degraded",
  db: "ok" | "error",
  uptime: number,
  version: string
}
```

---

## Backup

```bash
# cron: 0 2 * * * (diário às 02:00)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
PGPASSWORD=$DB_PASSWORD pg_dump -h localhost -U $DB_USER vetcare \
  | gzip \
  | gpg --encrypt --recipient backup@vetcare.app \
  > /backups/vetcare_$DATE.sql.gz.gpg

# Manter últimos 30 dias
find /backups -name "*.gpg" -mtime +30 -delete

# Upload para R2 (cold storage)
aws s3 cp /backups/vetcare_$DATE.sql.gz.gpg \
  s3://$R2_BACKUP_BUCKET/db/ \
  --endpoint-url https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com
```

---

## Nginx Config (HTTPS + Proxy)

```nginx
server {
    listen 443 ssl http2;
    server_name app.vetcare.app;

    ssl_certificate /etc/letsencrypt/live/app.vetcare.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.vetcare.app/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # Upload limit
    client_max_body_size 11M;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
