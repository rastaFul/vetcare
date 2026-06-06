# VetCare — Project Overview

## Visão
Plataforma web para gestão clínica de veterinários autônomos e clínicas veterinárias.
Começa simples para uma única profissional. Arquitetado para evoluir para SaaS multi-tenant.

## Missão MVP
Centralizar o dia a dia clínico de uma veterinária autônoma que realiza atendimentos domiciliares:
tutores, animais, histórico, agenda, vacinação, receituário e arquivos — tudo em um único sistema.

## Stack Definida
| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5 |
| ORM | Prisma 6 |
| Banco | PostgreSQL 16 |
| Auth | NextAuth.js v5 |
| Storage | Cloudflare R2 (S3-compatible) |
| PDF | @react-pdf/renderer |
| Calendar | Google Calendar API v3 |
| UI | Tailwind CSS + shadcn/ui |
| Deploy | VPS (Docker) — avaliado Vercel |
| CI/CD | GitHub Actions |

## Personas
- **Primary**: Dra. [Nome] — Veterinária autônoma, MEI, atendimento domiciliar
- **Future**: Clínicas, hospitais veterinários, equipes

## Restrições MVP
- Sem financeiro / cobrança / PIX
- Sem WhatsApp automático
- Sem IA clínica
- Sem mobile nativo
- Sem multi-tenant (mas arquitetura preparada)

## Princípios Arquiteturais
1. Monolito Modular (Modular Monolith) — Bounded Contexts isolados
2. Domain-Driven Design — Entidades ricas, Aggregates, Domain Events
3. API First — todas as features acessíveis via API documentada
4. SaaS-Ready — tenant_id em todas as entidades desde o dia 1
5. LGPD — dados sensíveis de tutores e pacientes protegidos
