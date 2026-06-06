# Napkin — VetCare

## Session 2026-06-04

### Contexto
- Projeto novo: veterinária autônoma, domiciliar, MEI
- SPEC completa produzida antes de qualquer código
- 14 documentos gerados em `.specs/features/`

### Padrões Identificados
- tenant_id em todas as entidades desde o início (SaaS-ready)
- Prisma middleware para tenant isolation em todas as queries
- Domain Events dispatched in-process (migração futura para broker transparente)
- Google Calendar: ICalendarService port → GoogleCalendarAdapter (infra)
- PDF: geração síncrona no MVP (< 5 itens geralmente); assíncrona na Fase 2

### Decisões Críticas a Não Reverter
- Monolito Modular (não microserviços no MVP)
- R2 para storage (não local filesystem)
- Google OAuth como auth primário (não credenciais no MVP)
- VPS + Docker (não Vercel) → PostgreSQL local evita cold start

### Pontos de Atenção
- Token refresh Google OAuth: implementar logo no Sprint 2 (evita surpresa em produção)
- PDF layout: validar com a veterinária antes de implementar (CRMV, assinatura, logotipo)
- Fuso horário: America/Sao_Paulo default; configurável por tenant

### Deploy — Cloudflare Tunnel (NÃO VPS tradicional)
- Tunnel já existe: ~/.cloudflared/config.yml
- API Token: /home/rodrigo/services/tunnel/.env
- Adicionar entrada: vetcare.rastaful.dev → localhost:3001
- Porta da app: 3001

### SPEC APROVADA em 2026-06-04
- Próximo: Sprint 1 — Setup + Auth + CRUD Tutores + Animais
