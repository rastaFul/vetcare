# STATE — VetCare

## Status: FEATURE NOTIFICATIONS COMPLETA ✅

### MVP (Sprints 1-4)
- Sprint 1-4: DONE — 127 testes — https://vetcare.rastaful.dev ✅

### Feature: Notifications
- Spec: DONE ✅
- Webhook Spec (Fase 2): DONE ✅ — `.specs/features/notifications/spec-webhook.md`
- Design System: DONE ✅ — `.interface-design/system.md`
- Status: DONE ✅ — 2026-06-05

## Tarefas Notifications

| # | Tarefa | Status |
|---|--------|--------|
| N1 | TDD GREEN — adapters + use case | DONE ✅ |
| N2 | Cron + API routes | DONE ✅ |
| N3 | UI integration | DONE ✅ |

## O que foi entregue

### Infraestrutura
- Evolution API docker: `/home/rodrigo/services/evolution/docker-compose.yml` (latest)
- Cron interno: `src/instrumentation.ts` → `src/lib/notification-cron.ts`
- Rate limit: 1 msg/segundo, ~20 tutores

### Módulo `src/modules/notifications/`
- `domain/entities/NotificationLog.ts`
- `application/ports/INotificationService.ts`, `INotificationLogRepository.ts`
- `application/use-cases/SendNotification.ts` (deduplication, fallback WhatsApp→Email)
- `application/MessageFormatter.ts` (templates WhatsApp + HTML email)
- `infrastructure/whatsapp/EvolutionApiAdapter.ts`
- `infrastructure/email/ResendAdapter.ts`
- `infrastructure/repositories/PrismaNotificationLogRepository.ts`

### API Routes
- `POST /api/v1/notifications/send`
- `GET /api/v1/notifications/logs?tutorId=&animalId=`
- `GET /api/v1/settings/notifications` (config)
- `PUT /api/v1/settings/notifications` (save config)
- `GET /api/v1/settings/notifications/status` (WhatsApp + Email status)
- `GET /api/v1/settings/notifications/whatsapp/qrcode`
- `DELETE /api/v1/settings/notifications/whatsapp/disconnect`
- `GET /api/cron/notifications?secret=X` (HTTP trigger externo)

### UI
- `/configuracoes` → tab "Notificações" (config + QR code)
- `/consultas/[id]` → botão "Enviar lembrete" (CONSULTATION_REMINDER)
- `/tutores/[id]` → histórico de notificações

## Próximo
- Webhook Spec Fase 2 (tutor responde "1 para confirmar") → `.specs/features/notifications/spec-webhook.md`
- Configurar Evolution API: `cd /home/rodrigo/services/evolution && docker compose up -d`

## Decisões Confirmadas
- Stack: Next.js 15 + TypeScript + PostgreSQL + Prisma + NextAuth + R2 ✅
- Nome: VetCare ✅
- Domínio: vetcare.rastaful.dev ✅
- Deploy: Cloudflare Tunnel existente, porta 3004 ✅
- Evolution API: latest, docker em /home/rodrigo/services/evolution/ ✅
- Cron: interno via instrumentation.ts + /api/cron/notifications ✅
- Email: noreply@rastaful.dev ✅

## Últimos gates (2026-06-05)
- tsc: PASS (0 errors)
- jest: PASS (178/178, 32 suites)
