# Risk Analysis — VetCare

## Riscos Técnicos

| ID | Risco | Prob | Impacto | Score | Mitigação |
|----|-------|------|---------|-------|-----------|
| R01 | Google Calendar API fora do ar | Média | Alto | 🔴 Alto | Fila local + retry async; UI indica status de sync |
| R02 | Token OAuth Google expira sem refresh | Alta | Alto | 🔴 Alto | Implementar refresh automático; alerta ao usuário |
| R03 | Geração de PDF lenta (> 10s) | Média | Médio | 🟡 Médio | Job assíncrono; polling de status; pre-render ao criar receita |
| R04 | Upload para R2 falha | Baixa | Alto | 🟡 Médio | Retry com backoff; presigned URL com expiração longa |
| R05 | Perda de dados PostgreSQL | Baixa | Crítico | 🔴 Alto | Backup diário; WAL; teste de restore mensal |
| R06 | Vazamento cross-tenant | Baixa | Crítico | 🔴 Alto | Prisma middleware; testes de segurança; code review |
| R07 | VPS cai (single point of failure) | Média | Alto | 🔴 Alto | Snapshot semanal; plano de recovery documentado |
| R08 | Dependência de uma única veterinária não gerar feedback | Alta | Médio | 🟡 Médio | Sessões semanais de feedback; acompanhar uso real |
| R09 | Mudança de escopo durante MVP | Alta | Médio | 🟡 Médio | Backlog congelado; mudanças passam por avaliação de impacto |
| R10 | Google muda API Calendar | Baixa | Médio | 🟢 Baixo | Interface ICalendarService abstrai implementação |
| R11 | Cloudflare R2 descontinua serviço | Muito Baixa | Médio | 🟢 Baixo | S3-compatible; trocar adapter sem refactor |
| R12 | LGPD — dados clínicos expostos | Baixa | Crítico | 🔴 Alto | Criptografia, audit log, tenant isolation, revisão de segurança |
| R13 | PDF com layout incorreto (nome/assinatura) | Média | Médio | 🟡 Médio | Testes de snapshot do PDF; preview antes de salvar |
| R14 | Busca global lenta (muitos registros) | Baixa | Baixo | 🟢 Baixo | Full-text search PostgreSQL (ts_vector) desde o início |

---

## Riscos de Produto

| ID | Risco | Prob | Mitigação |
|----|-------|------|-----------|
| P01 | Usuária não adota o sistema no dia a dia | Média | Treinamento; simplificar fluxos críticos; mobile-first |
| P02 | Funcionalidades não correspondem ao fluxo real de atendimento | Média | Shadowing de 1 atendimento real antes do Sprint 1 |
| P03 | Receituário PDF não atende requisitos do CFV | Baixa | Consultar Conselho Federal de Medicina Veterinária; layout ajustável |
| P04 | Google Calendar conflita com agenda existente | Baixa | Eventos criados em calendário separado "VetCare" (não o principal) |

---

## Planos de Contingência

### R01 + R02: Google Calendar Offline
```
1. Consulta salva localmente com status "pendente sync"
2. Job de retry a cada 5 minutos (até 24h)
3. Se falhar por 24h: notificação no dashboard
4. Fallback: usuária pode criar evento manualmente
```

### R05: Perda de Dados
```
1. Backup diário automático (02:00)
2. Backup testado: restore em ambiente staging mensalmente
3. RTO (Recovery Time Objective): 4 horas
4. RPO (Recovery Point Objective): 24 horas
```

### R07: VPS Cai
```
1. Snapshot semanal do VPS
2. Script de re-deploy documentado (< 30 min)
3. DNS apontado para IP Floating (troca sem downtime)
4. Futura migração: multi-instance com load balancer
```

### R12: Incidente LGPD
```
1. Isolamento imediato do tenant afetado
2. Notificação à ANPD em 72h (exigência legal)
3. Relatório de impacto (DPIA)
4. Audit log como evidência
```

---

## Dívida Técnica Conhecida (Aceitável no MVP)

| Item | Motivo de Aceitar | Quando Pagar |
|------|------------------|--------------|
| Sem cache (Redis) | Volume baixo no MVP | Fase 3 |
| PDF gerado sincrono | Receitas simples; < 5 itens geralmente | Fase 2 (job assíncrono) |
| Sem message broker | Event bus in-process suficiente | Fase 4 |
| Search simples (ILIKE) | Volume baixo; ILIKE suficiente | Fase 3 (ts_vector) |
| Sem 2FA | Autenticação via Google é suficiente | Fase 3 |
| Sem rate limiting sofisticado | Single user no MVP | Fase 2 |
