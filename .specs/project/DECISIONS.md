# DECISIONS — VetCare

## ADR-008: Notificações via Evolution API + Resend
- **Data**: 2026-06-04
- **Status**: PROPOSED
- **Contexto**: Veterinária precisa avisar tutores sobre vacinas, retornos e consultas. Volume baixo (~50 tutores, MEI).
- **Decisão**: Evolution API (WhatsApp, self-hosted, free) como canal principal + Resend (email, 3k/mês free) como fallback.
- **Descartado**: WhatsApp Business API oficial (burocracia + custo para MEI); SMS (custo por mensagem).
- **Consequências**: Risco de ban se usado em excesso; mitigado por volume baixo e uso apenas para contatos existentes. Migração para API oficial disponível na Fase 3 sem refactor (mesma porta INotificationService).

## ADR-001: Monolito Modular em vez de Microserviços
- **Data**: 2026-06-04
- **Status**: ACCEPTED
- **Contexto**: MVP com uma única usuária, equipe mínima, orçamento limitado
- **Decisão**: Monolito Modular com Bounded Contexts isolados por pasta
- **Consequências**: Menor complexidade operacional; migração para microserviços possível no futuro via extração de módulos

## ADR-002: Next.js App Router (Full Stack)
- **Data**: 2026-06-04
- **Status**: ACCEPTED
- **Contexto**: Necessidade de SSR, API Routes, e stack unificada TypeScript
- **Decisão**: Next.js 15 com App Router para frontend + API Routes para backend
- **Consequências**: Menor overhead de infra; facilita deploy em Vercel ou Docker

## ADR-003: PostgreSQL + Prisma
- **Data**: 2026-06-04
- **Status**: ACCEPTED
- **Contexto**: Dados relacionais (Tutor → Animal → Histórico), necessidade de migrations versionadas
- **Decisão**: PostgreSQL 16 com Prisma ORM
- **Consequências**: Type-safety no acesso a dados; migrations gerenciadas; JSON columns para dados semi-estruturados

## ADR-004: tenant_id desde o MVP
- **Data**: 2026-06-04
- **Status**: ACCEPTED
- **Contexto**: Evolução futura para multi-tenant SaaS
- **Decisão**: Todas as entidades de negócio terão coluna `tenant_id` desde a criação
- **Consequências**: Overhead mínimo no MVP; elimina migração destrutiva no futuro

## ADR-005: Cloudflare R2 para Storage
- **Data**: 2026-06-04
- **Status**: ACCEPTED
- **Contexto**: Upload de PDFs, fotos, exames; custo controlado
- **Decisão**: Cloudflare R2 (S3-compatible) com presigned URLs
- **Consequências**: Zero egress cost; compatível com AWS SDK v3; troca transparente para S3 se necessário

## ADR-006: Google Calendar como Agenda Principal
- **Data**: 2026-06-04
- **Status**: ACCEPTED
- **Contexto**: Veterinária já usa Google Calendar; não queremos substituir hábito
- **Decisão**: Sistema cria/atualiza/deleta eventos via Google Calendar API; agenda do sistema é camada de visualização
- **Consequências**: Dependência de OAuth Google; fallback necessário para modo offline

## ADR-007: NextAuth.js v5 para Autenticação
- **Data**: 2026-06-04
- **Status**: ACCEPTED
- **Contexto**: Necessidade de autenticação segura, suporte a Google OAuth e credenciais
- **Decisão**: NextAuth.js v5 com adapter Prisma
- **Consequências**: Sessões gerenciadas; fácil adição de providers futuros; RBAC extensível

## 2026-09-08 — Harness Gates Rollout installed (full, incl. husky/commitlint)
See STATE.md same date. Commit messages in this repo must now follow Conventional Commits (commitlint via pre-commit hook).

## 2026-09-09 — /api/metrics implementado (observability-metrics spec)
Contexto: usuário (via harness-infra, sessão infra-platform) pediu para corrigir a ausência de
`/metrics` do vetcare, único dos 4 produtos sem instrumentação Prometheus (spec `APPROVED` desde
2026-08-28, nunca executada).
Decisão/execução: `src/lib/metrics.ts` (Registry + `collectDefaultMetrics` prefixo `vetcare_`) +
`src/app/api/metrics/route.ts` (Bearer token, 401 sem/errado, 200 certo) + `src/lib/auth.config.ts`
(bypass do NextAuth middleware pra `/api/metrics`, mesmo padrão já usado por `/api/health`).
`METRICS_TOKEN` usa o MESMO valor do `infra-platform/platform/prometheus/metrics_token`
(credencial compartilhada), não um token próprio do vetcare — decisão deliberada pra garantir que
o scrape funcionasse sem depender de sincronizar 2 segredos separados.
Escopo deixado de fora (T1 da spec, documentado, não bloqueia os Done Criteria): sem
`http_requests_total`/`http_request_duration_seconds` por rota ainda — Next.js App Router não tem
hook central tipo Fastify `onRequest`, precisa de decisão de abordagem (middleware Node runtime vs
wrapper por rota). Consequência visível: vetcare não aparece no dashboard "Golden Signals" ainda
(variável `$service` depende de `http_requests_total` existir).
Verificação externa: jest 4/4 (`__tests__/metrics.test.ts`), `tsc --noEmit` limpo, `eslint` limpo,
container rebuilded (`docker compose -f docker-compose.dev.yml up -d --build app`, healthy), curl
real contra `127.0.0.1:3004/api/metrics` (401/401/200), Prometheus target `vetcare` confirmado
`up` e `vetcare_process_cpu_seconds_total` retornando via `GET /api/v1/query` real (lado
infra-platform, ver `infra-platform/.specs/audit/execution.md` sessão 2026-09-09).
Pendência: `METRICS_TOKEN` não empurrado pro Vault ainda (`vault-push-env.sh`).

## 2026-09-09 (continuação) — restart:always, métricas HTTP custom (não implementadas, motivo registrado), Vault
- `docker-compose.dev.yml`: `restart: always` em todos os serviços (era `unless-stopped`) — pedido
  do usuário, que para o Docker Desktop localmente pra jogar e espera que tudo volte sozinho.
- Métricas HTTP custom (`http_requests_total`/duration por rota): implementadas e revertidas na
  mesma sessão. Decisão: Next.js App Router middleware não tem acesso ao status/duração reais da
  resposta (roda antes do route handler) — qualquer tentativa produziria um `status_code` sempre
  "passou pelo auth" e uma `duration` só do check de auth, dado tecnicamente presente mas enganoso
  num dashboard que calcula taxa de erro por `status_code`. Melhor não ter a métrica do que ter uma
  errada. Fix correto = wrapper por route handler (~50 arquivos), registrado como follow-up, não
  feito agora.
- `METRICS_TOKEN` empurrado pro Vault (`secret/data/vetcare/env`, 20 chaves, valor confirmado
  idêntico ao `.env`).
- Achado colateral (não é deste repo, registrado aqui porque foi descoberto investigando isso):
  `rastafinancas-api` usa convenção de nome de métrica HTTP diferente do resto do ecossistema,
  nunca aparece no dashboard Golden Signals compartilhado. Ver `infra-platform` DECISIONS.md
  D-2026-09-09-2.

## 2026-09-09 (continuação 2) — instrumentação HTTP real implementada (fecha o follow-up)
`src/lib/with-metrics.ts` (wrapper, mede status/duração reais dentro do route handler) aplicado
nos 72 handlers HTTP de 48 `route.ts` via codemod baseado em AST (`scripts/wrap-routes-with-metrics.mjs`,
TypeScript compiler API — acha e reescreve com segurança, preserva formatação/comentários do corpo).
2 rotas deliberadamente não instrumentadas: `/api/metrics` (auto-referência sem sentido) e
`/api/auth/[...nextauth]` (re-export do NextAuth, fora do padrão do codemod).
`http_requests_total`/`http_request_duration_ms` sem prefixo (removido `vetcare_` de
`collectDefaultMetrics` também) — alinhado com o resto do ecossistema (ver `infra-platform`
D-2026-09-09-3).
Gates: `tsc`/`eslint` limpos, `jest` 234/234, `npm run build` real PASS, container rebuilded
saudável. Verificado com curl real que o contador incrementa de fato pra rota pública
(`/api/health`) e corretamente NÃO incrementa pra rota que exige sessão sem cookie válido
(esperado — o wrapper só mede o que chega no handler).
