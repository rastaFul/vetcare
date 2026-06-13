# Spec: Google Calendar via Service Account

## Status: APPROVED
## Data: 2026-06-13
## Projeto: VetCare — `/home/rodrigo/projects/vetcare`

---

## Problema

O fluxo OAuth atual solicita o escopo `calendar.events` no login, o que exige verificação OAuth do Google para apps externos. Isso gera a tela "O Google não verificou este app" para todos os usuários.

## Solução

Substituir OAuth de calendário por **Google Service Account**. O app usa uma conta de serviço para escrever eventos em um calendário dedicado por tenant. O usuário faz login apenas com `openid email profile` — zero aviso.

---

## Arquitetura

### Antes
```
Login → OAuth (openid + email + profile + calendar.events)
       → salva googleCalendarToken no User
       → GoogleCalendarAdapter usa accessToken do usuário
```

### Depois
```
Login → OAuth (openid + email + profile) ← sem aviso
       → sem token de calendário

Evento → GoogleCalendarServiceAccountAdapter
       → autentica com Service Account (JWT privado)
       → escreve em calendar dedicado por tenant (googleCalendarId no Tenant)
```

---

## Impacto no Banco de Dados

### Remover
- `User.googleCalendarToken` — campo não mais necessário

### Adicionar no Tenant
- `googleCalendarId String?` — ID do Google Calendar dedicado ao tenant
- `googleCalendarShareUrl String?` — URL pública de inscrição no calendário (para o profissional assinar no app pessoal)

---

## Variáveis de Ambiente (novas)

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=vetcare@projeto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
GOOGLE_CALENDAR_TIMEZONE=America/Sao_Paulo
```

**Removida:** nenhuma (GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET permanecem para o login)

---

## Tarefas

### Task 1 — Migration Prisma
- Remover `googleCalendarToken` do model `User`
- Adicionar `googleCalendarId String?` e `googleCalendarShareUrl String?` ao model `Tenant`
- Criar migration: `remove_calendar_token_add_calendar_id`

### Task 2 — GoogleCalendarServiceAccountAdapter
**Arquivo:** `src/modules/clinical/infrastructure/calendar/GoogleCalendarServiceAccountAdapter.ts`

Interface mantida: `ICalendarService` (sem `accessToken` nos métodos — usa Service Account internamente)

```typescript
interface ICalendarService {
  createEvent(dto: CalendarEventDTO, calendarId: string): Promise<string>
  updateEvent(eventId: string, dto: Partial<CalendarEventDTO>, calendarId: string): Promise<void>
  deleteEvent(eventId: string, calendarId: string): Promise<void>
  createReminder(dto: CalendarEventDTO, calendarId: string): Promise<string>
  createTenantCalendar(tenantName: string): Promise<{ calendarId: string; shareUrl: string }>
}
```

**Autenticação:** JWT assinado com chave privada da service account. Usar `googleapis` ou fetch puro com JWT.

**`createTenantCalendar`:** Cria um calendário Google com nome do tenant, compartilha com todos (`reader` público ou link), retorna calendarId + shareUrl.

### Task 3 — Atualizar use cases clínicos

Arquivos a alterar (remover parâmetro `calendarToken`, usar `calendarId` do tenant):
- `src/modules/clinical/application/use-cases/ScheduleConsultation.ts`
- `src/modules/clinical/application/use-cases/CancelConsultation.ts`
- `src/modules/clinical/application/use-cases/RescheduleConsultation.ts`

**Padrão:** o use case recebe `tenantId`, busca `tenant.googleCalendarId`, passa para o adapter.

### Task 4 — Atualizar use case de agendamento de sessões (Massagista)

Arquivo: `src/modules/scheduling/application/use-cases/ScheduleSession.ts`
- Mesmo padrão: remover `calendarToken`, usar `tenant.googleCalendarId`

### Task 5 — Limpar auth.ts

Arquivo: `src/lib/auth.ts`
- Remover `calendar.events` do scope authorization
- Remover bloco que salva `googleCalendarToken` no User
- Remover `token.calendarConnected`

### Task 6 — API: calendar status + setup

**Atualizar:** `src/app/api/v1/settings/calendar/status/route.ts`
- Retornar `{ connected: boolean, calendarId, shareUrl }` baseado em `tenant.googleCalendarId`

**Criar:** `POST /api/v1/settings/calendar/setup`
- Cria o calendário Google via service account para o tenant
- Salva `googleCalendarId` e `googleCalendarShareUrl` no Tenant
- Idempotente (se já existe, retorna o existente)

### Task 7 — Atualizar rotas de consultas e sessões

Arquivos a alterar (remover busca de `googleCalendarToken` do user, buscar `googleCalendarId` do tenant):
- `src/app/api/v1/consultations/route.ts`
- `src/app/api/v1/consultations/[id]/status/route.ts`
- `src/app/api/v1/consultations/[id]/route.ts`
- `src/app/api/v1/sessions/route.ts`
- `src/app/api/v1/sessions/[id]/route.ts`

### Task 8 — UI: Configurações

Arquivo: `src/app/(dashboard)/configuracoes/page.tsx`

**Antes:** "Conectar Google Calendar" (OAuth button)
**Depois:** 
- Se `!googleCalendarId`: botão "Criar Calendário VetCare" → chama `POST /api/v1/settings/calendar/setup`
- Se `googleCalendarId`: status "Calendário ativo ✓" + link de inscrição (`shareUrl`) + botão "Ver no Google Calendar"

### Task 9 — Atualizar testes

- Atualizar mocks de `ICalendarService` (remover `accessToken`, adicionar `calendarId`)
- Atualizar testes de `ScheduleConsultation`, `CancelConsultation`, `RescheduleConsultation`
- Atualizar `ScheduleSession.test.ts`
- Adicionar testes para `GoogleCalendarServiceAccountAdapter` (mock do fetch)

---

## Critérios de Conclusão (Done)

- [ ] Login funciona com `openid email profile` apenas — sem `calendar.events`
- [ ] Nenhum warning do Google no login
- [ ] `POST /api/v1/settings/calendar/setup` cria calendário via service account
- [ ] Consultas agendadas aparecem no calendário do tenant
- [ ] Cancelamento remove o evento do calendário
- [ ] Reagendamento atualiza o evento
- [ ] UI de configurações mostra status do calendário + link de inscrição
- [ ] `tsc`: 0 errors
- [ ] `jest`: todos os testes passando

---

## Setup Manual Necessário (fora do código)

O desenvolvedor precisa fazer isso no Google Cloud antes de executar:

1. Google Cloud Console → IAM → Service Accounts → Criar conta de serviço
2. Criar chave JSON → baixar
3. Google Calendar API → Habilitar no projeto
4. Adicionar ao `.env`:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` = email da service account
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` = chave privada do JSON (com `\n`)
5. Remover do OAuth consent screen o escopo `calendar.events` após deploy

---

## Notas de Implementação

- **Sem dependência externa de `googleapis`** se possível — implementar JWT/fetch puro para manter bundle pequeno. Se complexity alta, usar `googleapis` como devDependency.
- **Best-effort no calendário** — falha de calendário não bloqueia criação de consulta/sessão (já é o comportamento atual).
- **Migração de dados:** usuários existentes com `googleCalendarToken` perdem a conexão (campo removido). Precisarão usar "Criar Calendário VetCare" nas configurações. Isso é aceitável — são poucos usuários.
- **harness-dev deve delegar tasks ao task-executor** conforme necessário.
