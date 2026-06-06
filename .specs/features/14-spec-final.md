# SPEC FINAL — VetCare MVP

**Versão**: 1.0.0
**Data**: 2026-06-04
**Status**: AGUARDANDO APROVAÇÃO

---

## 1. Resumo Executivo

Sistema web para gestão clínica de veterinária autônoma. Centraliza tutores, animais, histórico clínico, agenda, vacinação, receituário e arquivos. Integra com Google Calendar. Arquitetado para evoluir para SaaS multi-tenant sem refactor destrutivo.

---

## 2. Stack Tecnológica Definitiva

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 15.x |
| Linguagem | TypeScript | 5.x |
| ORM | Prisma | 6.x |
| Banco | PostgreSQL | 16.x |
| Auth | NextAuth.js | 5.x |
| UI | Tailwind CSS + shadcn/ui | latest |
| PDF | @react-pdf/renderer | 4.x |
| Storage | Cloudflare R2 (AWS SDK v3) | latest |
| Calendar | Google APIs Node.js Client | latest |
| Testes Unit | Jest + ts-jest | latest |
| Testes E2E | Playwright | latest |
| Deploy | Docker + Docker Compose | latest |
| CI/CD | GitHub Actions | N/A |
| VPS | Hetzner CX22 (4GB RAM, 2 vCPU) | N/A |

---

## 3. Bounded Contexts

| BC | Responsabilidade |
|----|-----------------|
| Identity & Access | Tenant, User, Auth, Roles |
| Patient Management | Tutor, Animal |
| Clinical Management | Consulta, Anamnese, Timeline |
| Preventive Care | Vacinação, Vermifugação, Antipulgas |
| Prescription | Receita, PDF |
| Documents | Upload, Storage |
| Scheduling | Google Calendar sync |

---

## 4. Entidades Principais

```
Tenant → User → Consultation
Tenant → Tutor → Animal → Consultation
                         → VaccinationRecord
                         → DewormingRecord
                         → AntiFleasRecord
                         → Prescription → PrescriptionItem
                         → Attachment
Consultation → Prescription
Consultation → Attachment
```

---

## 5. Funcionalidades do MVP (Confirmadas)

| Código | Feature | Sprint |
|--------|---------|--------|
| F01 | Autenticação Google OAuth | S1 |
| F02 | CRUD Tutores | S1 |
| F03 | CRUD Animais + foto | S1 |
| F04 | Agendamento de consultas | S2 |
| F05 | Conclusão de atendimento (anamnese + diagnóstico) | S2 |
| F06 | Integração Google Calendar (criar/atualizar/deletar) | S2 |
| F07 | Timeline clínica do animal | S2 |
| F08 | Registro de vacinação + lembrete Calendar | S3 |
| F09 | Registro de vermifugação + antipulgas | S3 |
| F10 | Receituário + geração de PDF | S3 |
| F11 | Upload de arquivos (R2) | S3 |
| F12 | Dashboard | S4 |
| F13 | Busca global | S4 |
| F14 | Configurações de perfil e assinatura | S4 |

---

## 6. Fora do Escopo MVP (Explícito)

❌ Financeiro / Cobrança / PIX
❌ Estoque de medicamentos
❌ WhatsApp automático
❌ IA clínica
❌ App mobile nativo
❌ Multi-tenant UI (infra preparada, não exposta)
❌ Relatórios avançados
❌ 2FA
❌ Exportação de dados LGPD

---

## 7. Critérios de Aceite do MVP

- [ ] Veterinária cadastra tutor + animal em < 2 minutos
- [ ] Veterinária registra atendimento completo em < 3 minutos
- [ ] PDF de receita gerado em < 10 segundos
- [ ] Histórico do animal acessível em < 2 cliques
- [ ] Google Calendar sincronizado em cada operação de consulta
- [ ] Sistema acessível e usável em celular (mobile-first)
- [ ] Zero dados perdidos (backup validado)
- [ ] 100% dos fluxos E2E passando

---

## 8. Critérios de Qualidade

| Gate | Meta |
|------|------|
| TypeScript sem erros | 100% |
| ESLint sem warnings | 100% |
| Cobertura Jest (use-cases) | ≥ 80% |
| Cobertura integração | ≥ 60% |
| Testes E2E | 5 fluxos críticos passando |
| npm audit critical | 0 |
| Lighthouse Performance (mobile) | ≥ 75 |

---

## 9. Estrutura de Pastas

```
vetcare/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── modules/             # Bounded Contexts
│   │   ├── identity/
│   │   ├── patients/
│   │   ├── clinical/
│   │   ├── preventive/
│   │   ├── prescriptions/
│   │   ├── documents/
│   │   └── scheduling/
│   ├── shared/              # Shared kernel
│   └── components/          # UI Components
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── integration/
│   └── e2e/
├── .specs/                  # Este diretório
├── public/
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── .github/workflows/ci.yml
```

---

## 10. Documentos de Referência

| Doc | Arquivo |
|-----|---------|
| PRD | `01-prd.md` |
| Domain Model + DDD | `02-domain-model.md` |
| Event Storming | `03-event-storming.md` |
| User Journey + UX | `04-user-journey.md` |
| Arquitetura C4 + ADRs | `05-architecture.md` |
| Database Schema | `06-database.md` |
| API Design | `07-api.md` |
| Security Review | `08-security.md` |
| Test Strategy | `09-test-strategy.md` |
| DevOps | `10-devops.md` |
| SaaS Evolution | `11-saas-evolution.md` |
| Backlog | `12-backlog.md` |
| Risks | `13-risks.md` |

---

## 11. Checklist de Aprovação — PREENCHIDO

- [x] **Stack aprovada**: Next.js 15 + TypeScript + PostgreSQL + Prisma + NextAuth + R2
- [x] **Nome comercial**: VetCare ✅
- [x] **Domínio**: vetcare.rastaful.dev ✅
- [x] **Deploy**: Cloudflare Tunnel existente (sem VPS adicional, sem Nginx) — porta 3001
- [x] **Google OAuth**: será criado app no console quando pronto ✅
- [x] **Cloudflare R2**: conta existente; API Token em `/home/rodrigo/services/tunnel/.env` ✅
- [x] **Escopo MVP confirmado**: features F01-F14 ✅
- [x] **Prazo**: sem pressão (projeto pessoal) ✅
- [x] **PDF layout**: confiar no template padrão; ajustar depois se necessário ✅

---

## 12. Estratégia de Deploy Revisada

Em vez de VPS + Nginx + certbot, o VetCare usará a infraestrutura Cloudflare Tunnel já existente:

```yaml
# Adicionar ao ~/.cloudflared/config.yml
- hostname: vetcare.rastaful.dev
  service: http://localhost:3001
```

**Vantagens sobre VPS tradicional:**
- Zero custo adicional (já rodando)
- HTTPS/SSL automático via Cloudflare
- Sem configuração de Nginx
- Mesma máquina que roda financas.rastaful.dev e grow.rastaful.dev

**Porta escolhida**: 3001 (disponível no tunnel existente)

**Ambiente de desenvolvimento local**: `http://localhost:3001`

---

## 13. Aprovação

**Aprovado por**: Rodrigo
**Data**: 2026-06-04
**Status**: ✅ APROVADO — PRONTO PARA IMPLEMENTAÇÃO

> Implementação iniciará pelo Sprint 1 seguindo TDD obrigatório e gates de qualidade em cada tarefa.
