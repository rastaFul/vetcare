# Plano de Evolução SaaS — VetCare

## Decisões Arquiteturais do MVP que Suportam Evolução

| Decisão MVP | Benefício para SaaS |
|-------------|---------------------|
| `tenant_id` em todas as entidades | Multi-tenant sem migration destrutiva |
| Monolito Modular (Bounded Contexts) | Extração para microserviços por módulo |
| Prisma Middleware (tenant filter) | Row-Level Security preparado |
| NextAuth com roles | RBAC extensível sem refactor |
| R2 para storage | Isolamento por tenant via path prefix |
| API REST versionada (`/api/v1`) | Breaking changes controlados |
| Domain Events internos | Migração para message broker transparente |

---

## Fase 1 — Veterinária Única (MVP) [ATUAL]

**Usuários**: 1
**Tenants**: 1 (criado automaticamente no onboarding)
**Billing**: N/A

**Funcionalidades**:
- Tudo do PRD MVP
- Auth Google OAuth
- Agenda via Google Calendar
- PDF de receituário

**Infra**: VPS + Docker Compose + PostgreSQL local

**Arquitetura multi-tenant**: `tenant_id` presente, mas não exposto na UI. Toda query já filtra por tenant.

---

## Fase 2 — Multi-usuário (6-12 meses)

**Usuários**: 1-5 por tenant (vet + secretária + assistente)
**Tenants**: 1
**Billing**: N/A ou cobrança manual

### Features Novas
- **Convite de usuários**: `POST /api/v1/settings/users/invite` → email com link
- **Roles expostos na UI**: OWNER pode definir role de cada usuário
  - `VETERINARIAN`: acesso clínico completo
  - `ASSISTANT`: agendar + listar (sem receituário, sem conclusão)
- **Audit log visível**: histórico de ações por usuário
- **Agenda por veterinário**: filtro de consultas por `veterinarianId`

### Mudanças Técnicas
- Tabela `invitations` (id, tenantId, email, role, token, expiresAt)
- Middleware de role check aprimorado
- Dashboard por veterinário (filtro)

### Sem refactor necessário: `tenant_id` e `roles` já existem

---

## Fase 3 — Clínica Veterinária (12-18 meses)

**Usuários**: 5-20 por tenant
**Tenants**: N (cada clínica = 1 tenant)
**Billing**: Plano mensal (manual ou Stripe básico)

### Features Novas
- **Onboarding self-service**: form de cadastro → cria tenant automaticamente
- **Multi-veterinários**: agenda unificada com filtro por profissional
- **Salas/locais de atendimento**: entidade `Location` (clínica, domicílio, parceiro)
- **Relatórios básicos**: consultas por período, animais por espécie
- **Logo e personalização**: logo da clínica no receituário PDF

### Mudanças Técnicas
- Tabela `locations` (tenantId, name, address, type)
- Consulta vinculada a `locationId` (opcional)
- Serviço de relatórios (queries agregadas)
- PDF de receituário com logo do tenant

### Sem refactor necessário: estrutura já suporta N tenants

---

## Fase 4 — SaaS Multi-tenant (18-24 meses)

**Usuários**: escala
**Tenants**: centenas
**Billing**: Stripe com planos

### Features Novas
- **Planos e limites**:
  ```
  FREE:  1 usuário, 50 animais, 1GB storage, sem PDF
  PRO:   5 usuários, ilimitado, 10GB storage, PDF + Calendar
  CLINIC: 20 usuários, ilimitado, 50GB storage, tudo + relatórios
  ```
- **Billing via Stripe**: checkout, cobrança recorrente, webhook de pagamento
- **Admin panel interno**: listagem de tenants, métricas, suporte
- **Limite enforcement**: middleware verifica limites antes de criar recurso
- **Trial de 14 dias**: tenant criado em estado TRIAL

### Mudanças Técnicas
- Tabela `subscriptions` (tenantId, plan, stripeSubscriptionId, status, trialEnd)
- Stripe webhook handler (`/api/webhooks/stripe`)
- Middleware de limite (`TenantLimitMiddleware`)
- Admin panel (`/admin/*`) com role SUPER_ADMIN
- **Possível**: extrair módulo Billing como serviço separado

### Row-Level Security (PostgreSQL)
```sql
-- Habilitar RLS como camada adicional de segurança
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON animals
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

---

## Fase 5 — Plataforma Completa (24+ meses)

### Features Novas
- **Financeiro**: controle de receitas, relatório para MEI/Simples
- **Estoque**: medicamentos, vacinas (alerta de baixo estoque)
- **WhatsApp Business API**: lembretes automáticos para tutores
- **IA Clínica**: sugestão de diagnóstico baseado em histórico (LLM integrado)
- **App Mobile**: React Native (compartilha lógica de domínio)
- **Marketplace**: integrações com laboratórios, planos pet

### Mudanças Técnicas
- Extração de módulos como microserviços (WhatsApp, IA, Financeiro)
- Message broker (Redis Streams ou RabbitMQ) substituindo event bus in-process
- API Gateway (Kong ou AWS API Gateway)
- Cache layer (Redis) para dashboard e timeline
- CDN para assets e PDFs

---

## Roadmap de Extração de Módulos

```
MVP (Monolito)
│
├─► Fase 4: Billing Service (Stripe)
│     └── billing-service (Node.js standalone)
│
├─► Fase 5: PDF Service
│     └── pdf-service (Node.js + worker)
│
├─► Fase 5: Notification Service
│     └── notification-service (WhatsApp + Email + Push)
│
└─► Fase 5: AI Service
      └── ai-service (Python + FastAPI + LLM)
```

**Princípio**: só extrair quando o módulo tiver requisitos de escala ou tecnologia diferentes do monolito.

---

## KPIs por Fase

| KPI | Fase 1 | Fase 2 | Fase 3 | Fase 4 |
|-----|--------|--------|--------|--------|
| Tenants | 1 | 1 | 10-50 | 100+ |
| Usuários/tenant | 1 | 2-5 | 5-20 | 1-50 |
| Animals/tenant | <200 | <500 | <2000 | ilimitado |
| Uptime SLA | 95% | 99% | 99.5% | 99.9% |
| Suporte | Autoatendimento | Email | Chat | Dedicado |
