# Feature — Observability: /metrics endpoint (Prometheus)

Status: APPROVED
Criado: 2026-08-28
Origem: infra-platform Batch 2 (ROADMAP.md) — artists-booking, rastafinancas e microgrow já têm `/metrics` (prom-client) e já aparecem no dashboard "Golden Signals — All Services" no Grafana (`platform/dashboards/platform/golden-signals.json`, datasource Prometheus, confirmado com dado real 2026-08-28). vetcare é o único dos 4 sem instrumentação — fica fora do dashboard até isso existir.

---

## Contexto

`infra-platform/platform/prometheus/prometheus.yml` já tem o job `apis-host` fazendo scrape de `host.docker.internal:{3001,3006,4000}/metrics` (rastafinancas/artists/microgrow). Falta só adicionar vetcare (`:3004/metrics`) — mas o endpoint não existe no código ainda.

## Referência (microgrow, `api/src/plugins/prom-metrics.ts`)

Padrão já usado nos outros 3 (adaptar pra Next.js — vetcare não é Fastify):
- `prom-client`: `Registry`, `collectDefaultMetrics`, `Counter` (`http_requests_total`), `Histogram` (`http_request_duration_ms`)
- Labels: `method`, `route`, `status_code` — **importante**: o dashboard golden-signals usa `service=~"$service"` (label injetado pelo Prometheus via `static_configs.labels`, não pelo app) + `route`/`status_code` vindos do app
- Autenticação: `Authorization: Bearer $METRICS_TOKEN` — mesmo padrão dos outros 3, ver `infra-platform docs/reference` e o achado de segurança de 2026-08-27 (`security-hardening-phase1`) sobre por que não dá pra confiar só em allowlist de IP

## T1 — Instrumentação básica

Next.js (App Router) não tem um "hook" central tipo Fastify `onRequest`/`onResponse` — precisa de [middleware.ts](vetcare/src/middleware.ts) (já existe, usado pelo NextAuth) pra medir duração, ou instrumentar por rota via wrapper. Investigar qual abordagem se encaixa melhor na estrutura atual antes de implementar (App Router + middleware vs instrumentation.ts do Next 15).

## T2 — Rota `/api/metrics`

`route.ts` em `src/app/api/metrics/route.ts`, protegida por `METRICS_TOKEN` (mesmo padrão Bearer dos outros 3 — já existe uma variável `METRICS_TOKEN`? **Não** — precisa adicionar ao `.env` e ao Vault (`infra-platform/scripts/vault-push-env.sh vetcare .env` depois de adicionar a chave, ver `docs/how-to/vault-secrets-workflow.md`).

## T3 — Registrar no infra-platform

Depois que `/api/metrics` existir e responder: adicionar ao `prometheus.yml` (`host.docker.internal:3004`, `labels: {service: vetcare}`). **Esse passo é do infra-platform, não deste repo** — avisar quando T1/T2 estiverem prontos.

## Done Criteria

1. `GET /api/metrics` retorna formato Prometheus, 401/403 sem `Authorization: Bearer`, 200 com token correto
2. `METRICS_TOKEN` no `.env` + Vault
3. Prometheus scrape configurado (infra-platform) — vetcare aparece no dashboard "Golden Signals" com dado real
