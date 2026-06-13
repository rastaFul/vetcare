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
