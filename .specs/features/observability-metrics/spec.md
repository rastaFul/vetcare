# Feature — Observability: /metrics endpoint (Prometheus)

Status: DONE (T1 completo desde 2026-09-09 — ver nota)
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

1. [x] `GET /api/metrics` retorna formato Prometheus, 401/403 sem `Authorization: Bearer`, 200 com token correto — implementado 2026-09-09, `src/app/api/metrics/route.ts` + `src/lib/metrics.ts`, testado via jest (4/4, `__tests__/metrics.test.ts`) e via curl real contra o container rebuilded (401 sem header, 401 com token errado, 200 com token certo, `Content-Type: text/plain` do prom-client).
2. [x] `METRICS_TOKEN` no `.env` — 2026-09-09, mesmo valor de `infra-platform/platform/prometheus/metrics_token` (credencial compartilhada do job `apis-host`/`vetcare`), não o de cada API individual (cada uma tem o próprio, ver achado nas notas do infra-platform). **Vault**: não empurrado ainda (`vault-push-env.sh` não rodado nesta sessão) — pendência.
3. [x] Prometheus scrape configurado (infra-platform) — job `vetcare` dedicado (não reusa `apis-host`, ver nota abaixo), target `up`, `vetcare_process_cpu_seconds_total` confirmado via `GET /api/v1/query` real. **Mas NÃO aparece no dashboard "Golden Signals" ainda** — a variável `$service` do dashboard (`platform/dashboards/platform/golden-signals.json`) é `label_values(http_requests_total, service)`, e vetcare só expõe métricas de processo (`collectDefaultMetrics`) por enquanto, sem `http_requests_total` custom (ver nota T1 abaixo). Confirmado vazio via `GET /api/v1/series?match[]=http_requests_total{service="vetcare"}`.

## Nota de execução — 2026-09-09

- **T1 ficou parcial de propósito**: Next.js App Router não tem hook central tipo Fastify `onRequest`/`onResponse`; instrumentar `http_requests_total`/`http_request_duration_seconds` por rota exigiria um wrapper em cada route handler ou usar `middleware.ts` em runtime Node (não Edge, que não roda `prom-client`) — decisão de escopo não tomada ainda, registrada como próximo passo, não bloqueou os Done Criteria (que não exigem essas métricas custom explicitamente, só formato Prometheus + auth). Isso é o motivo do item 3 ficar incompleto (vetcare não aparece no Golden Signals ainda).
- **Job Prometheus separado, não reaproveitado de `apis-host`**: os outros 3 (rastafinancas/artists/microgrow) usam `/metrics` (Fastify); vetcare usa `/api/metrics` (rota do App Router) — `metrics_path` é por job em `static_configs`, não por target individual, então precisou de um `job_name: vetcare` próprio em `infra-platform/platform/prometheus/prometheus.yml`. Achado real ao tentar reusar o job existente: target ficava `down` com erro de parse (`expected a valid start token, got "<"` — HTML de 404 do Next.js em `/metrics`, que não existe).
- Ver `infra-platform/.specs/audit/execution.md` (sessão 2026-09-09) pro lado da infra (compose do rastafinancas + este wiring + um bug real de bind-mount do Prometheus achado no caminho).

## Atualização 2026-09-09 (continuação) — T1 investigado, deliberadamente não implementado via middleware
Cheguei a implementar `http_requests_total`/`http_request_duration` via `src/middleware.ts`
(NextAuth v5 wrap, `runtime: 'nodejs'`) e revertidos na mesma sessão: middleware do App Router roda
ANTES do route handler, não vê status/duração reais — o dado resultante seria tecnicamente presente
mas semanticamente errado (status sempre "passou pelo auth", nunca o real; duração só do check de
auth) num dashboard que calcula taxa de erro por `status_code=~"5.."`. Decisão: pior ter dado errado
que parecer certo do que não ter dado nenhum. `tsc`/`jest`/`eslint` reconfirmados limpos após a
reversão. `METRICS_TOKEN` empurrado pro Vault (`vault-push-env.sh`), pendência anterior fechada.

## Atualização 2026-09-09 (continuação 2) — T1 fechado via wrapper por route handler
Implementado o fix correto identificado na nota anterior: `src/lib/with-metrics.ts` (wrapper
`withMetrics(route, handler)` que mede duração real via `process.hrtime.bigint()` e lê
`res.status` de verdade — só possível dentro do handler, não do middleware) aplicado nos 72
handlers HTTP exportados (GET/POST/PUT/PATCH/DELETE) em 48 dos 50 `route.ts` de
`src/app/api/**` via codemod (`scripts/wrap-routes-with-metrics.mjs`, AST do TypeScript compiler
API pra achar cada `export async function METODO(...)` com segurança, reescrita por slice de texto
pra preservar formatação/comentários do corpo). 2 arquivos deliberadamente não tocados:
`api/metrics` (não faz sentido o endpoint de métricas medir a si mesmo) e
`api/auth/[...nextauth]` (re-export de `handlers` do NextAuth, nem casa o padrão do codemod).
`route` label é a rota estática do arquivo com segmentos dinâmicos normalizados (`[id]` → `:id`),
não o pathname em runtime — sem risco de cardinalidade.
Também corrigido nesta rodada: `src/lib/metrics.ts` (Registry) estava com prefixo `vetcare_` em
`collectDefaultMetrics` — removido, pra ficar consistente com artists-api/microgrow-api/
rastafinancas-api (todos sem prefixo agora) e compatível com o painel de memória do dashboard
"Golden Signals" (`process_resident_memory_bytes{service=~"$service"}`, precisa do nome sem
prefixo). `http_requests_total`/`http_request_duration_ms` também sem prefixo, mesmos buckets de
microgrow-api (`[5,10,25,50,100,250,500,1000,2500,5000]` ms).
Gates: `tsc --noEmit` limpo (48 arquivos), `eslint` limpo, `jest` 234/234 (233 pré-existentes + 1
corrigido — teste do `/api/metrics` esperava o prefixo antigo), `npm run build` real PASS (todas
as rotas compiladas). Container rebuilded e verificado com curl real. Ver
`.specs/audit/execution.md` pro detalhe completo e a verificação externa (Prometheus target +
Grafana dashboard).
