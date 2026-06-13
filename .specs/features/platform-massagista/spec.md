# Spec: Platform Foundation + Massagista
## VetCare → CareBase Platform

**Versão**: 1.0.0
**Data**: 2026-06-06
**Status**: DRAFT — aguardando aprovação

---

## 1. Contexto e Objetivo

VetCare está arquitetado como monolito modular com `tenant_id` em todas as entidades.
A evolução para SaaS multi-profissão parte desse fundamento, **sem tocar no código VetCare existente**.

Esta spec cobre **duas entregas paralelas**:

| Entrega | O que é | Por que agora |
|---------|---------|---------------|
| **Platform Foundation** | Adicionar `professionType` ao Tenant + abstrações genéricas | Base para todas as profissões futuras |
| **Módulo Massagista** | Clients + Services + Sessions | Demanda real imediata |

---

## 2. Princípios de Design

1. **Zero breaking change no VetCare** — todos os módulos vet funcionam como antes
2. **Additive only** — novos módulos, novas rotas, novo schema additive
3. **Plataforma por módulos** — cada profissão ativa os módulos que precisa
4. **Mesma infraestrutura** — auth, calendar, notifications, storage compartilhados

---

## 3. Arquitetura dos Módulos por Profissão

```
CORE (todos os profissionais)
  ✓ identity/     — tenants, users, auth
  ✓ notifications/ — WhatsApp + email
  ✓ documents/    — upload de arquivos
  + clients/      — [NOVO] clientes humanos genéricos
  + scheduling/   — [NOVO] sessões/agendamentos genéricos

VET (existente, inalterado)
  ✓ patients/     — tutor + animal
  ✓ clinical/     — consultas
  ✓ preventive/   — vacinas, vermífugo, antipulgas
  ✓ prescriptions/ — receituário

MASSAGE (novo)
  + services/     — catálogo de serviços (tipos de massagem)
  + [usa] clients/
  + [usa] scheduling/

FUTURE (psicólogo, fisio, etc)
  + records/      — prontuário específico
  + [usa] clients/
  + [usa] scheduling/
```

---

## 4. Mudanças no Schema — Platform Foundation

### 4.1 Novos Enums

```prisma
enum ProfessionType {
  VETERINARIAN      // padrão atual
  MASSAGE_THERAPIST // massagista
  // PSYCHOLOGIST, PHYSIOTHERAPIST, NUTRITIONIST...
}

enum ClientStatus {
  ACTIVE
  INACTIVE
}

enum SessionStatus {
  SCHEDULED
  CONFIRMED
  COMPLETED
  CANCELLED
}
```

### 4.2 Alterações no Tenant

```prisma
model Tenant {
  // ... campos existentes inalterados ...

  // NOVO:
  professionType        ProfessionType @default(VETERINARIAN)
  professionalRegLabel  String?        // "CRMV", "CRP", "CMT", etc (configurável)

  // novas relações:
  clients  Client[]
  services Service[]
  sessions Session[]
}
```

### 4.3 Alterações no User

```prisma
model User {
  // ... campos existentes inalterados ...

  // crmv já existe — renomear semanticamente para "registro profissional"
  // mas sem migration breaking: manter campo crmv, add alias via app layer
  professionalRegNumber String? // novo campo genérico (CRP, CRMV, CMT...)
}
```

### 4.4 Novos Modelos — Client (genérico)

```prisma
model Client {
  id           String       @id @default(uuid())
  tenantId     String
  name         String
  phone        String
  whatsapp     String?
  email        String?
  birthDate    DateTime?
  street       String?
  number       String?
  complement   String?
  neighborhood String?
  city         String?
  state        String?
  zipCode      String?
  notes        String?      @db.Text
  status       ClientStatus @default(ACTIVE)
  // preferências de notificação (reutiliza padrão do Tutor)
  notifyWhatsApp     Boolean @default(true)
  notifyEmail        Boolean @default(false)
  notifySession      Boolean @default(true)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  tenant       Tenant        @relation(fields: [tenantId], references: [id])
  healthRecord ClientHealthRecord?
  sessions     Session[]
  notificationLogs NotificationLog[] // reutiliza o modelo existente

  @@index([tenantId])
  @@index([tenantId, name])
  @@map("clients")
}

model ClientHealthRecord {
  id                String   @id @default(uuid())
  tenantId          String
  clientId          String   @unique
  pathologies       String?  @db.Text // patologias
  contraindications String?  @db.Text // contraindicações
  medications       String?  @db.Text // medicamentos em uso
  allergies         String?  @db.Text // alergias
  objectives        String?  @db.Text // objetivos do tratamento
  observations      String?  @db.Text
  updatedAt         DateTime @updatedAt

  client Client @relation(fields: [clientId], references: [id])

  @@index([tenantId])
  @@map("client_health_records")
}
```

### 4.5 Novos Modelos — Service (catálogo)

```prisma
model Service {
  id          String   @id @default(uuid())
  tenantId    String
  name        String   // "Massagem Relaxante"
  durationMin Int      // 60
  price       Decimal  @db.Decimal(10, 2)
  description String?
  active      Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())

  tenant   Tenant    @relation(fields: [tenantId], references: [id])
  sessions Session[]

  @@index([tenantId])
  @@index([tenantId, active])
  @@map("services")
}
```

### 4.6 Novos Modelos — Session (agendamento genérico)

```prisma
model Session {
  id                    String        @id @default(uuid())
  tenantId              String
  clientId              String
  serviceId             String?       // opcional (tem profissões sem catálogo)
  therapistId           String        // userId do profissional
  scheduledAt           DateTime
  status                SessionStatus @default(SCHEDULED)
  // endereço domiciliar (mesmo padrão das consultas vet)
  street                String?
  number                String?
  complement            String?
  neighborhood          String?
  city                  String?
  state                 String?
  zipCode               String?
  notes                 String?       @db.Text // anotações pós-sessão
  priceCharged          Decimal?      @db.Decimal(10, 2) // pode diferir do serviço
  googleCalendarEventId String?
  returnDate            DateTime?     // retorno agendado
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  tenant    Tenant  @relation(fields: [tenantId], references: [id])
  client    Client  @relation(fields: [clientId], references: [id])
  service   Service? @relation(fields: [serviceId], references: [id])
  therapist User    @relation(fields: [therapistId], references: [id])

  @@index([tenantId])
  @@index([tenantId, clientId])
  @@index([tenantId, scheduledAt])
  @@index([tenantId, status])
  @@map("sessions")
}
```

### 4.7 Extensão do NotificationLog

Adicionar novos tipos de notificação para sessões:
```prisma
enum NotificationType {
  // existentes inalterados:
  CONSULTATION_REMINDER
  VACCINATION_REMINDER
  RETURN_REMINDER
  CUSTOM
  // novos:
  SESSION_REMINDER
  SESSION_RETURN_REMINDER
}
```

Adicionar relação opcional com Client (além de Tutor):
```prisma
model NotificationLog {
  // campos existentes inalterados...
  tutorId   String?  // nullable: era obrigatório, agora opcional
  clientId  String?  // novo: para notificações de clients (massagista)
  
  tutor  Tutor?  @relation(...)
  client Client? @relation(...)
}
```

> ⚠️ Breaking change menor: `tutorId` em NotificationLog vai de required para optional.
> Requer migration + atualizar PrismaNotificationLogRepository.

---

## 5. Novos Módulos de Código

### 5.1 `src/modules/clients/` — cliente humano genérico

```
clients/
├── domain/
│   ├── entities/
│   │   ├── Client.ts
│   │   └── ClientHealthRecord.ts
│   └── value-objects/
│       └── (reutiliza Phone, Email de patients/)
├── application/
│   ├── dtos/ClientDTO.ts
│   ├── ports/IClientRepository.ts
│   └── use-cases/
│       ├── RegisterClient.ts
│       ├── UpdateClient.ts
│       ├── GetClient.ts
│       ├── ListClients.ts
│       ├── DeactivateClient.ts
│       └── UpdateClientHealthRecord.ts
└── infrastructure/
    └── repositories/PrismaClientRepository.ts
```

### 5.2 `src/modules/scheduling/` — sessões genéricas

```
scheduling/
├── domain/
│   ├── entities/Session.ts
│   └── value-objects/SessionStatus.ts
├── application/
│   ├── dtos/SessionDTO.ts
│   ├── ports/ISessionRepository.ts
│   └── use-cases/
│       ├── ScheduleSession.ts
│       ├── ConfirmSession.ts
│       ├── CompleteSession.ts
│       ├── CancelSession.ts
│       ├── RescheduleSession.ts
│       ├── ListSessions.ts
│       └── GetSession.ts
└── infrastructure/
    └── repositories/PrismaSessionRepository.ts
```

### 5.3 `src/modules/services/` — catálogo de serviços

```
services/
├── domain/
│   └── entities/Service.ts
├── application/
│   ├── dtos/ServiceDTO.ts
│   ├── ports/IServiceRepository.ts
│   └── use-cases/
│       ├── CreateService.ts
│       ├── UpdateService.ts
│       ├── ListServices.ts
│       └── DeactivateService.ts
└── infrastructure/
    └── repositories/PrismaServiceRepository.ts
```

---

## 6. Novas API Routes

```
# Clients
GET    /api/v1/clients                    → lista com busca + paginação
POST   /api/v1/clients                    → cadastrar cliente
GET    /api/v1/clients/[id]               → detalhe + ficha de saúde
PUT    /api/v1/clients/[id]               → atualizar
PATCH  /api/v1/clients/[id]               → status (deactivate)
GET    /api/v1/clients/[id]/health-record → ficha de saúde
PUT    /api/v1/clients/[id]/health-record → atualizar ficha
GET    /api/v1/clients/[id]/sessions      → histórico de sessões

# Services (catálogo)
GET    /api/v1/services                   → lista do tenant
POST   /api/v1/services                   → criar serviço
PUT    /api/v1/services/[id]              → editar
PATCH  /api/v1/services/[id]/status       → ativar/desativar

# Sessions (agendamentos)
GET    /api/v1/sessions                   → lista com filtros
POST   /api/v1/sessions                   → agendar
GET    /api/v1/sessions/[id]              → detalhe
PUT    /api/v1/sessions/[id]              → editar
PATCH  /api/v1/sessions/[id]/status       → confirmar/completar/cancelar

# Settings
GET/PUT /api/v1/settings/profession       → tipo de profissão + registro
```

---

## 7. Novas UI Pages (Massagista)

### 7.1 Sidebar adaptativa por `professionType`

```tsx
// VET (atual, inalterado):
Dashboard → /dashboard
Tutores   → /tutores
Animais   → /animais
Consultas → /consultas
Config    → /configuracoes

// MASSAGE_THERAPIST (novo):
Dashboard → /dashboard     (adaptado)
Clientes  → /clientes
Agenda    → /agenda
Serviços  → /servicos
Config    → /configuracoes
```

### 7.2 Páginas novas

| Rota | Descrição |
|------|-----------|
| `/clientes` | Lista de clientes com busca |
| `/clientes/[id]` | Detalhe: info + ficha de saúde + histórico de sessões |
| `/agenda` | Lista de sessões com filtros (status, data) |
| `/agenda/[id]` | Detalhe da sessão + ações (confirmar, completar, cancelar) |
| `/servicos` | Catálogo de serviços do tenant |

### 7.3 Dashboard adaptado para MASSAGE

Cards iguais em estrutura mas com dados diferentes:
- Sessões hoje
- Próximas sessões (7 dias)
- Retornos pendentes
- Totais: Clientes ativos, Sessões este mês, Faturamento estimado (R$)

### 7.4 Onboarding: Seleção de Profissão

Após primeiro login do Google, se `tenant.professionType` não foi configurado ainda:

```
┌──────────────────────────────────────────┐
│  Bem-vindo ao CareBase!                  │
│  Qual é sua profissão?                   │
│                                          │
│  ○ 🐾 Veterinário(a)                    │
│  ○ 💆 Massoterapeuta                    │
│  ○ 🧠 Psicólogo(a)          [em breve]  │
│  ○ 🦴 Fisioterapeuta         [em breve]  │
│                                          │
│  [Continuar]                             │
└──────────────────────────────────────────┘
```

Também configurável depois em `/configuracoes → Perfil`.

---

## 8. Notificações para Sessões

Reutilizar `SendNotification` use case existente.

Novos templates `MessageFormatter`:
```
SESSION_REMINDER (WhatsApp):
🌿 *[Tenant Name]* — Lembrete de Sessão

Olá *{{clientName}}*!

Sua {{serviceName}} está agendada para:
📅 *{{date}}* às *{{time}}*
📍 {{address}}

Em caso de dúvidas, entre em contato.

_{{therapistName}}_
```

Cron (`notification-cron.ts`) — adicionar busca de sessões próximas:
- Sessão em 24h → SESSION_REMINDER
- Retorno em 3 dias → SESSION_RETURN_REMINDER

---

## 9. Estratégia TDD

### Testes Unitários Novos (Red → Green)

```typescript
// Client entity
- create() com campos obrigatórios → sucesso
- deactivate() → status INACTIVE
- phone normalização

// ClientHealthRecord entity
- create() com campos opcionais
- update() → updatedAt muda

// Session entity
- schedule() → status SCHEDULED
- confirm() → status CONFIRMED
- complete() com notes → status COMPLETED + notas salvas
- cancel() → status CANCELLED
- não pode completar se status != CONFIRMED (regra de negócio)

// ScheduleSession use case
- cliente existe no tenant → cria sessão
- cliente não existe → erro NotFoundError
- serviço inativo → erro BusinessError
- calendário Google cria evento (mock)

// ListClients use case
- filtra por tenantId
- busca por nome/telefone
- paginação

// Service entity
- create() com preço e duração
- deactivate() → active=false
```

### Critérios de Aceite (Playwright — apenas após implementação)

```gherkin
Scenario: Massagista agenda sessão com cliente
  Given professionType = MASSAGE_THERAPIST
  And cliente "João Silva" cadastrado
  And serviço "Massagem Relaxante - 60min - R$150" ativo
  When acessa /agenda → "Nova Sessão"
  Then seleciona cliente e serviço
  And escolhe data/hora
  And salva
  Then sessão aparece na agenda com status "Agendada"

Scenario: Sidebar correta por profissionType
  Given professionType = MASSAGE_THERAPIST
  When navega para /dashboard
  Then sidebar mostra: Clientes, Agenda, Serviços
  And NÃO mostra: Tutores, Animais, Consultas

Scenario: VetCare inalterado
  Given professionType = VETERINARIAN
  When navega para /tutores
  Then sidebar e funcionalidades idênticas ao estado atual
```

---

## 10. Plano de Execução (Sprints)

### Sprint 1 — Schema + Domain + Core (TDD)
- Migration: professionType, Client, ClientHealthRecord, Service, Session
- Entidades domain: Client, ClientHealthRecord, Service, Session
- Use cases com testes: RegisterClient, ScheduleSession, ListClients, ListSessions
- Testes RED → GREEN

### Sprint 2 — API Routes + Infra
- PrismaClientRepository, PrismaSessionRepository, PrismaServiceRepository
- API routes: /clients, /sessions, /services
- Notificação: SESSION_REMINDER no cron + SendNotification

### Sprint 3 — UI (Frontend)
- Sidebar adaptativa por professionType
- Pages: /clientes, /clientes/[id], /agenda, /agenda/[id], /servicos
- Dashboard adaptado para MASSAGE
- Onboarding de profissão (tela inicial)
- Playwright gate: sidebar, agendamento, cliente

### Sprint 4 — Polish + Settings
- /configuracoes → tab "Profissão" (tipo + registro profissional)
- Tutor notifications → opcional (clientId ou tutorId no log)
- Seed data para demo massagista
- Testes finais e gates

---

## 11. Decisões Aprovadas

| # | Decisão | Resposta |
|---|---------|----------|
| 1 | Onboarding profissão | **Ambos**: tela após primeiro login + configurável em /configuracoes |
| 2 | Rota da agenda | `/agenda` (mais genérico) |
| 3 | Google Calendar para sessões | **Sim** — reutilizar GoogleCalendarAdapter existente |
| 4 | Multi-profissional | **Não por enquanto** — 1 profissional autônomo por tenant |
| 5 | Nome da plataforma | **A definir** — candidatos: Officio, Praxis, Nexo, Cuida, Solus |
| 6 | Faturamento | Apenas campo `priceCharged` na sessão — módulo financeiro é fase futura |

**Status**: AGUARDANDO nome da plataforma → pode iniciar implementação em paralelo

---

## 12. Fora do Escopo desta Fase

- Financeiro / controle de caixa
- Planos de assinatura (Stripe)
- Self-service onboarding público
- Psicólogo (prontuário psicológico)
- App mobile
- Multi-profissional no mesmo tenant (secretária de massagista)
