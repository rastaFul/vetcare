# Deploy — VetCare

## Cloudflare Tunnel

Adicionar ao arquivo `~/.cloudflared/config.yml`:

```yaml
- hostname: vetcare.rastaful.dev
  service: http://localhost:3001
```

Reiniciar o tunnel:

```bash
sudo systemctl restart cloudflared
```

## Variaveis de Ambiente (producao)

Copiar `.env.example` para `.env.local` e preencher:

1. `DATABASE_URL` — string de conexao PostgreSQL
2. `NEXTAUTH_SECRET` — gerar: `openssl rand -base64 32`
3. `NEXTAUTH_URL` — https://vetcare.rastaful.dev
4. `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — Google Cloud Console
5. `R2_*` — Cloudflare R2 (opcional no inicio, usar armazenamento local)
6. `ENCRYPTION_KEY` — gerar: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Verificar variaveis antes de subir

```bash
npx ts-node scripts/check-env.ts
```

## Iniciar em Producao

```bash
# Subir banco
docker compose -f docker-compose.dev.yml up -d

# Rodar migrations
npx prisma migrate deploy

# Build
npm run build

# Start (roda na porta 3001)
npm start
```

## Google OAuth — Configuracao

No Google Cloud Console:
1. Criar projeto VetCare
2. Credenciais -> OAuth 2.0 -> Tipo: Aplicacao Web
3. Authorized redirect URIs: `https://vetcare.rastaful.dev/api/auth/callback/google`
4. Copiar Client ID e Client Secret para `.env.local`

## Health Check

```bash
curl https://vetcare.rastaful.dev/api/health
# Esperado: {"status":"ok","timestamp":"...","version":"1.0.0","service":"vetcare-api"}
```
