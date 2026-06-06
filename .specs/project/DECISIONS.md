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
