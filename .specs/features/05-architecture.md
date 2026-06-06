# Architecture — VetCare (C4 + ADRs)

## C4 Level 1 — System Context

```
                    ┌─────────────┐
                    │ Dra. Ana    │
                    │ (Browser /  │
                    │  Mobile)    │
                    └──────┬──────┘
                           │ HTTPS
                    ┌──────▼──────────────┐
                    │    VetCare System   │
                    │  (Next.js Monolith) │
                    └──┬──────┬──────┬───┘
                       │      │      │
          ┌────────────▼─┐  ┌─▼───┐ ┌▼────────────────┐
          │  PostgreSQL  │  │ R2  │ │ Google Calendar │
          │  (Neon/VPS)  │  │     │ │     API v3       │
          └──────────────┘  └─────┘ └─────────────────┘
```

---

## C4 Level 2 — Container

```
Browser
  └── Next.js App (Container)
        ├── App Router (Pages + Layouts)
        ├── Server Components (RSC)
        ├── Client Components (interativos)
        └── API Routes (/api/*)
              ├── Auth (NextAuth)
              ├── Tutors API
              ├── Animals API
              ├── Consultations API
              ├── Preventive API
              ├── Prescriptions API
              ├── Attachments API
              └── Dashboard API
```

---

## C4 Level 3 — Component (Módulos)

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Grupo: rotas de auth
│   ├── (dashboard)/            # Grupo: rotas protegidas
│   │   ├── dashboard/
│   │   ├── tutors/
│   │   ├── animals/
│   │   ├── consultations/
│   │   └── settings/
│   └── api/                    # API Routes
│       ├── auth/[...nextauth]/
│       ├── tutors/
│       ├── animals/
│       ├── consultations/
│       ├── vaccinations/
│       ├── dewormings/
│       ├── antifleas/
│       ├── prescriptions/
│       ├── attachments/
│       └── dashboard/
│
├── modules/                    # Bounded Contexts (Modular Monolith)
│   ├── identity/
│   │   ├── domain/
│   │   │   ├── entities/       Tenant.ts, User.ts
│   │   │   └── value-objects/  Email.ts, UserRole.ts
│   │   ├── application/
│   │   │   └── use-cases/      CreateTenant.ts, GetUser.ts
│   │   └── infrastructure/
│   │       └── repositories/   PrismaTenantRepository.ts
│   │
│   ├── patients/
│   │   ├── domain/
│   │   │   ├── entities/       Tutor.ts, Animal.ts
│   │   │   └── value-objects/  CPF.ts, Address.ts, Weight.ts
│   │   ├── application/
│   │   │   └── use-cases/      RegisterTutor.ts, RegisterAnimal.ts
│   │   └── infrastructure/
│   │       └── repositories/   PrismaTutorRepository.ts
│   │
│   ├── clinical/
│   │   ├── domain/
│   │   │   ├── entities/       Consultation.ts
│   │   │   └── services/       TimelineService.ts
│   │   ├── application/
│   │   │   └── use-cases/      ScheduleConsultation.ts, CompleteConsultation.ts
│   │   └── infrastructure/
│   │       └── repositories/   PrismaConsultationRepository.ts
│   │
│   ├── preventive/
│   │   ├── domain/entities/    VaccinationRecord.ts, DewormingRecord.ts, AntiFleasRecord.ts
│   │   ├── application/use-cases/
│   │   └── infrastructure/repositories/
│   │
│   ├── prescriptions/
│   │   ├── domain/entities/    Prescription.ts
│   │   ├── application/use-cases/
│   │   └── infrastructure/
│   │       ├── repositories/
│   │       └── pdf/            PrescriptionPdfGenerator.ts
│   │
│   ├── documents/
│   │   ├── domain/entities/    Attachment.ts
│   │   ├── application/use-cases/
│   │   └── infrastructure/
│   │       └── storage/        R2StorageAdapter.ts
│   │
│   └── scheduling/
│       ├── domain/
│       │   └── ports/          ICalendarService.ts
│       └── infrastructure/
│           └── calendar/       GoogleCalendarAdapter.ts
│
├── shared/
│   ├── domain/                 BaseEntity.ts, DomainEvent.ts
│   ├── infrastructure/         PrismaClient.ts, Logger.ts
│   └── utils/                  date.ts, format.ts
│
└── components/                 # UI Components (shadcn/ui + custom)
    ├── ui/                     # Base shadcn components
    ├── forms/                  # Form components
    ├── layouts/                # Layout components
    └── features/               # Feature-specific components
```

---

## Estrutura de API Routes

### Padrão de Response

```typescript
// Sucesso
{ data: T, meta?: { total?, page?, pageSize? } }

// Erro
{ error: { code: string, message: string, details?: unknown } }
```

### Middleware Stack (por request)
```
Request → [Auth Middleware] → [Tenant Middleware] → [Rate Limit] → [Handler]
```

### Auth Middleware
- Valida sessão NextAuth
- Injeta `session.user` + `session.tenantId` no request context

### Tenant Middleware
- Garante que `tenantId` é adicionado a todas as queries
- Row-Level Security preparatório (aplicado no Prisma client)

---

## Decisão: Monolito Modular vs. Microserviços

**Escolhido: Monolito Modular**

| Critério | Monolito Modular | Microserviços |
|----------|-----------------|---------------|
| Complexidade operacional | Baixa | Alta |
| Time necessário | 1 dev | 3+ devs |
| Latência inter-módulo | In-process | Rede |
| Deploy | 1 container | N containers |
| Migração futura | Via extração | N/A |
| MVP adequado | ✅ | ❌ |

**Estratégia de extração futura:** cada `module/` pode ser extraído como microserviço independente quando houver necessidade (ex: `prescriptions/` → serviço de PDF standalone).

---

## Event Handling Interno

Para o MVP, domain events são dispatched in-process (sem message broker):

```typescript
// domain/DomainEvent.ts
class DomainEventBus {
  private handlers: Map<string, Handler[]>
  emit(event: DomainEvent): void
  on(eventType: string, handler: Handler): void
}
```

**Futuro:** substituir por Redis Streams ou RabbitMQ sem mudança nos agregados.

---

## Configuração de Ambiente

```
.env
├── DATABASE_URL          (PostgreSQL connection string)
├── NEXTAUTH_SECRET       (JWT secret)
├── NEXTAUTH_URL          (base URL)
├── GOOGLE_CLIENT_ID      (OAuth)
├── GOOGLE_CLIENT_SECRET  (OAuth)
├── R2_ACCOUNT_ID         (Cloudflare)
├── R2_ACCESS_KEY_ID
├── R2_SECRET_ACCESS_KEY
├── R2_BUCKET_NAME
├── R2_PUBLIC_URL         (CDN URL)
└── ENCRYPTION_KEY        (para tokens OAuth em repouso)
```
