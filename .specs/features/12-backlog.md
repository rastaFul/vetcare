# Backlog Priorizado — VetCare MVP

## Critérios de Priorização

- **P0** — Blocker: sem isso o sistema não funciona
- **P1** — Core: funcionalidade central do MVP
- **P2** — Important: melhora significativa de UX
- **P3** — Nice-to-have: pode entrar no MVP se houver tempo

---

## Sprint 1 — Fundação (2 semanas)

### P0 — Setup
| ID | Item | Estimativa |
|----|------|-----------|
| S1-01 | Setup Next.js 15 + TypeScript + ESLint + Prettier | 0.5d |
| S1-02 | Setup Prisma + PostgreSQL + migrations iniciais | 0.5d |
| S1-03 | Autenticação NextAuth (Google OAuth) | 1d |
| S1-04 | Middleware de auth + tenant + guards de rota | 0.5d |
| S1-05 | Layout base (sidebar, header, bottom nav mobile) | 1d |
| S1-06 | Design System base (Tailwind + shadcn/ui tokens) | 0.5d |

### P1 — Tutores
| ID | Item | Estimativa |
|----|------|-----------|
| S1-07 | Listagem de tutores (busca + paginação) | 1d |
| S1-08 | Cadastro de tutor (form completo + validação) | 1d |
| S1-09 | Edição de tutor | 0.5d |
| S1-10 | Detalhe do tutor (com lista de animais) | 0.5d |

### P1 — Animais
| ID | Item | Estimativa |
|----|------|-----------|
| S1-11 | Listagem de animais (busca + filtros) | 0.5d |
| S1-12 | Cadastro de animal (form + upload de foto) | 1d |
| S1-13 | Edição de animal | 0.5d |
| S1-14 | Perfil do animal (dados + tabs) | 0.5d |

**Total Sprint 1**: ~9 dias

---

## Sprint 2 — Clínica (2 semanas)

### P1 — Consultas
| ID | Item | Estimativa |
|----|------|-----------|
| S2-01 | Agendamento de consulta (form + validação) | 1d |
| S2-02 | Listagem de consultas (filtros: data, status, animal) | 0.5d |
| S2-03 | Detalhe da consulta | 0.5d |
| S2-04 | Transição de status (SCHEDULED → CONFIRMED → COMPLETED) | 1d |
| S2-05 | Formulário de conclusão (anamnese + diagnóstico) | 1d |
| S2-06 | Cancelamento de consulta | 0.5d |

### P1 — Google Calendar Integration
| ID | Item | Estimativa |
|----|------|-----------|
| S2-07 | OAuth Google Calendar (connect/disconnect) | 1d |
| S2-08 | Criar evento ao agendar consulta | 0.5d |
| S2-09 | Atualizar evento ao editar consulta | 0.5d |
| S2-10 | Deletar evento ao cancelar consulta | 0.5d |
| S2-11 | Lembrete de retorno (criar evento Google Calendar) | 0.5d |

### P1 — Timeline
| ID | Item | Estimativa |
|----|------|-----------|
| S2-12 | Timeline do animal (consultas) | 1d |
| S2-13 | Filtro de timeline por tipo | 0.5d |

**Total Sprint 2**: ~9 dias

---

## Sprint 3 — Preventivo + Receituário (2 semanas)

### P1 — Preventivo
| ID | Item | Estimativa |
|----|------|-----------|
| S3-01 | Registro de vacinação (form + lista) | 1d |
| S3-02 | Lembrete de próxima vacina (Google Calendar) | 0.5d |
| S3-03 | Registro de vermifugação (form + lista) | 0.5d |
| S3-04 | Registro de antipulgas (form + lista) | 0.5d |
| S3-05 | Timeline: vacinas, vermifugações, antipulgas | 0.5d |

### P1 — Receituário
| ID | Item | Estimativa |
|----|------|-----------|
| S3-06 | Form de receita (diagnóstico + items dinâmicos) | 1d |
| S3-07 | Geração de PDF (layout profissional) | 1.5d |
| S3-08 | Upload do PDF para R2 | 0.5d |
| S3-09 | Download/visualização do PDF | 0.5d |
| S3-10 | Lista de receitas do animal na timeline | 0.5d |

### P1 — Arquivos
| ID | Item | Estimativa |
|----|------|-----------|
| S3-11 | Upload de arquivo (presigned URL + R2) | 1d |
| S3-12 | Listagem de arquivos do animal | 0.5d |
| S3-13 | Download de arquivo (presigned URL) | 0.5d |
| S3-14 | Timeline: arquivos | 0.5d |

**Total Sprint 3**: ~9 dias

---

## Sprint 4 — Dashboard + Polimento (1 semana)

### P1 — Dashboard
| ID | Item | Estimativa |
|----|------|-----------|
| S4-01 | Cards: totais (animais, tutores) | 0.5d |
| S4-02 | Consultas do dia (lista com link) | 0.5d |
| S4-03 | Retornos pendentes (próximos 7 dias) | 0.5d |
| S4-04 | Vacinas próximas (próximos 30 dias) | 0.5d |

### P2 — UX Polishment
| ID | Item | Estimativa |
|----|------|-----------|
| S4-05 | Busca global (⌘K) — tutores + animais | 1d |
| S4-06 | Configurações de perfil (nome, CRMV, assinatura) | 0.5d |
| S4-07 | Loading states + Skeleton screens | 0.5d |
| S4-08 | Error boundaries + páginas de erro | 0.5d |

### P1 — Go-live
| ID | Item | Estimativa |
|----|------|-----------|
| S4-09 | Testes E2E completos (5 fluxos críticos) | 1d |
| S4-10 | Deploy produção (VPS + Docker + HTTPS) | 0.5d |
| S4-11 | Monitoramento (Sentry + health check) | 0.5d |

**Total Sprint 4**: ~7 dias

---

## P3 — Backlog Futuro (pós-MVP)

| ID | Item | Fase |
|----|------|------|
| F2-01 | Convite de usuários (assistente) | Fase 2 |
| F2-02 | Roles e permissões na UI | Fase 2 |
| F2-03 | Audit log visível | Fase 2 |
| F2-04 | Export de dados (LGPD) | Fase 2 |
| F3-01 | Relatórios por período | Fase 3 |
| F3-02 | Multi-veterinários | Fase 3 |
| F3-03 | Onboarding self-service | Fase 3 |
| F4-01 | Billing Stripe | Fase 4 |
| F4-02 | Planos e limites | Fase 4 |
| F4-03 | Admin panel | Fase 4 |
| F5-01 | WhatsApp integration | Fase 5 |
| F5-02 | App mobile | Fase 5 |
| F5-03 | IA clínica | Fase 5 |

---

## Resumo de Esforço MVP

| Sprint | Duração | Pontos |
|--------|---------|--------|
| Sprint 1 — Fundação | 2 semanas | ~9d |
| Sprint 2 — Clínica | 2 semanas | ~9d |
| Sprint 3 — Preventivo + Receituário | 2 semanas | ~9d |
| Sprint 4 — Dashboard + Go-live | 1 semana | ~7d |
| **Total** | **7 semanas** | **~34d** |

> Estimativas assumem 1 desenvolvedor full-stack sênior. Com TDD e gates de qualidade.
