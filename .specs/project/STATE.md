# STATE — VetCare

## Status: PLATFORM FOUNDATION + MASSAGISTA COMPLETA ✅

### MVP (Sprints 1-4)
- Sprint 1-4: DONE — 127 testes — https://vetcare.rastaful.dev ✅

### Feature: Notifications
- Spec: DONE ✅
- Webhook Spec (Fase 2): DONE ✅ — `.specs/features/notifications/spec-webhook.md`
- Design System: DONE ✅ — `.interface-design/system.md`
- Status: DONE ✅ — 2026-06-05

### Feature: Platform Foundation + Massagista
- Spec: DONE ✅ — `.specs/features/platform-massagista/spec.md`
- Sprint 1 — Schema + Domain + Tests: DONE ✅ — 2026-06-06
- Sprint 2 — API Routes + Infra: DONE ✅ — 2026-06-06
- Sprint 3 — UI: DONE ✅ — 2026-06-06
- Sprint 4 — Polish: DONE ✅ — 2026-06-06

## O que foi entregue (Platform + Massagista)

### Sprint 1 — Schema + Domain
- Migration: `20260606033216_add_platform_massagista` ✅
- Migration: `20260606190956_make_notification_animal_optional` ✅
- Entidades: Client, ClientHealthRecord, Service, Session ✅
- Use cases com testes: 43 testes novos ✅

### Sprint 2 — API Routes + Infra
- `PrismaClientRepository` — clients + health records ✅
- `PrismaSessionRepository` — app_sessions ✅
- `PrismaServiceRepository` — services ✅
- `SendSessionNotification` use case — WhatsApp + Email para clientes ✅
- `MessageFormatter` — templates SESSION_REMINDER, SESSION_RETURN_REMINDER ✅
- `notification-cron.ts` — sessions + session returns ✅
- API routes `/api/v1/clients` (CRUD + health-record + sessions) ✅
- API routes `/api/v1/services` (CRUD + status toggle) ✅
- API routes `/api/v1/sessions` (CRUD + status PATCH) ✅
- API routes `/api/v1/settings/profession` (GET/PUT) ✅

### Sprint 3 — UI
- `professionType` no JWT/session (auth.ts) ✅
- `Sidebar` adaptativo por professionType ✅
- `BottomNav` adaptativo por professionType ✅
- Página `/clientes` — lista com busca ✅
- Página `/clientes/[id]` — detalhe + histórico sessões ✅
- Página `/agenda` — lista com filtros por status ✅
- Página `/agenda/[id]` — detalhe + ações (confirmar/concluir/cancelar) ✅
- Página `/servicos` — catálogo CRUD inline ✅
- Componentes: ClientCard, ClientDialog, ClientForm, SessionCard, SessionForm ✅

### Sprint 4 — Polish
- `/configuracoes` → tab "Profissão" (tipo + registro profissional) ✅

## Gates (2026-06-06)
- tsc: PASS (0 errors)
- jest: PASS (221/221, 46 suites)

## Feature: Google Calendar via Service Account
- Spec: APPROVED ✅ — `.specs/features/google-calendar-service-account/spec.md`
- Status: DONE ✅ — 2026-06-13
- Tasks 1-9: DONE — 230/230 tests, tsc 0 errors

## Próximo
- Webhook Spec Fase 2 (tutor responde "1 para confirmar") → `.specs/features/notifications/spec-webhook.md`
- Configurar Evolution API: `cd /home/rodrigo/services/evolution && docker compose up -d`
- Onboarding de profissão (tela após primeiro login — spec seção 7.4)
- Dashboard adaptativo para MASSAGE_THERAPIST
- Configurar tenant demo como MASSAGE_THERAPIST para validar UI

## Decisões Confirmadas
- Stack: Next.js 15 + TypeScript + PostgreSQL + Prisma + NextAuth + R2 ✅
- Nome: VetCare ✅
- Domínio: vetcare.rastaful.dev ✅
- Deploy: Cloudflare Tunnel existente, porta 3004 ✅
- Evolution API: latest, docker em /home/rodrigo/services/evolution/ ✅
- Cron: interno via instrumentation.ts + /api/cron/notifications ✅
- Email: noreply@rastaful.dev ✅
- professionType muda o menu mas exige re-login para atualizar token JWT ✅

## Observability — /api/metrics implementado — 2026-09-09
Feature `observability-metrics` (era `APPROVED` desde 2026-08-28, nunca executada) fechada:
`/api/metrics` real, protegido por `METRICS_TOKEN` (Bearer), scrapeado pelo Prometheus do
infra-platform (job `vetcare` dedicado, `up`, dado real confirmado). Gates: jest 4/4, tsc limpo,
eslint limpo, container rebuilded e saudável, curl real 401/401/200. Pendente: métricas HTTP
custom por rota (`http_requests_total`) — vetcare ainda não aparece no dashboard "Golden Signals"
por causa disso (documentado, não bloqueante). `METRICS_TOKEN` não empurrado pro Vault ainda.
Ver DECISIONS.md 2026-09-09 e `.specs/features/observability-metrics/spec.md`.

## Observability — continuação 2026-09-09
`docker-compose.dev.yml` agora usa `restart: always` (pedido do usuário — para o Docker Desktop
localmente pra jogar, espera tudo de volta sozinho). Métricas HTTP custom (`http_requests_total`
por rota) investigadas e **não implementadas de propósito** — Next.js middleware não vê o status/
duração reais da resposta, dado seria enganoso; fix correto precisa de wrapper nos ~50 route
handlers, registrado como follow-up. `METRICS_TOKEN` empurrado pro Vault. Achado colateral (de
outro repo, registrado aqui): `rastafinancas-api` não aparece no dashboard Golden Signals
compartilhado por divergência de nome de métrica — ver `infra-platform` DECISIONS.md.

## Observability — instrumentação HTTP real fechada — 2026-09-09 (continuação 2)
Follow-up da entrada acima resolvido: `src/lib/with-metrics.ts` + codemod AST
(`scripts/wrap-routes-with-metrics.mjs`) aplicado nos 72 handlers HTTP de 48 route.ts.
`http_requests_total`/`http_request_duration_ms` sem prefixo agora (alinhado com o ecossistema).
Gates completos PASS (tsc/eslint/jest 234-234/build real), container rebuilded saudável, verificado
com curl real que o contador funciona (incrementa em rota pública, não incrementa em rota que exige
sessão sem cookie — comportamento correto). `vetcare` agora aparece no dashboard Golden Signals
junto com os outros 3 produtos. Ver DECISIONS.md e `.specs/features/observability-metrics/spec.md`
(status: DONE completo).

## Harness Gates Rollout — 2026-09-08T22:33:21-03:00
Status: DONE (full — including devDependency installs and husky activation). Installed via `agents-harness/claude/install.sh`: CLAUDE.md, `.claude/agents/`, `skills/`, `steering/`, `templates/dev-quality/`, `.harness-sandbox/docker/`, `.github/workflows/gates.yml`, `.github/CODEOWNERS`, dev-quality devDependency bundle + husky hooks active. `lint-staged` correctly installed at the now-pinned `@16` (git-2.32.0-floor bug found+fixed centrally during the rastafinancas rollout just before this one). Working tree was clean before this rollout. Verified: files present, `bash -n`/`yamllint` PASS, real `npm install` succeeded. See `.specs/features/harness-gates-rollout/spec.md`.
