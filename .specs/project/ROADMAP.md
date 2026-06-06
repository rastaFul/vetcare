# ROADMAP — VetCare

## Fase 1 — MVP (Veterinária Única) [NOW]
**Meta**: Sistema funcional para uma veterinária autônoma

### Sprint 1 — Fundação (2 semanas)
- [ ] Setup Next.js + TypeScript + Prisma + PostgreSQL
- [ ] Autenticação (NextAuth.js + Google OAuth)
- [ ] Layout base + Design System (Tailwind + shadcn/ui)
- [ ] CRUD Tutores
- [ ] CRUD Animais (com foto)

### Sprint 2 — Clínica (2 semanas)
- [ ] Consultas (agendamento + status)
- [ ] Histórico clínico (timeline)
- [ ] Anamnese + Diagnóstico
- [ ] Integração Google Calendar (criar/atualizar/deletar eventos)

### Sprint 3 — Preventivo + Receituário (2 semanas)
- [ ] Vacinação (registro + lembretes Calendar)
- [ ] Vermifugação
- [ ] Antipulgas
- [ ] Receituário + geração PDF
- [ ] Upload de arquivos (R2)

### Sprint 4 — Dashboard + Polimento (1 semana)
- [ ] Dashboard (consultas do dia, retornos, vacinas próximas)
- [ ] Testes E2E
- [ ] Deploy produção

---

## Fase 2 — Multi-usuário (6-12 meses)
- Convite de usuários (secretária, assistente)
- Permissões por role (VETERINARIAN, ASSISTANT, ADMIN)
- Audit log de ações

## Fase 3 — Clínica (12-18 meses)
- Multi-veterinários por tenant
- Agenda unificada por clínica
- Relatórios gerenciais

## Fase 4 — SaaS Multi-tenant (18-24 meses)
- Onboarding self-service
- Billing (Stripe)
- Planos e limites por tenant
- Admin panel

## Fase 5 — Plataforma Completa (24+ meses)
- Financeiro e estoque
- WhatsApp integration
- IA clínica (diagnóstico assistido)
- App mobile (React Native)
- Marketplace de integrações
