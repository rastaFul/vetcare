// Prometheus metrics registry — GET /api/metrics (src/app/api/metrics/route.ts)
//
// Sem prefixo (nem nas métricas de processo default, nem em http_requests_total/
// duration) -- alinhado com artists-api/microgrow-api e com rastafinancas-api
// (que usava prefixo `rasta_` até 2026-09-09, corrigido pelo mesmo motivo: o
// dashboard compartilhado "Golden Signals" (infra-platform
// platform/dashboards/platform/golden-signals.json) e o job Prometheus
// `$service` dependem de `http_requests_total`/`process_resident_memory_bytes`
// SEM prefixo. Ver infra-platform .specs/audit/execution.md (2026-09-09).
//
// HTTP metrics — preenchidas por src/lib/with-metrics.ts, aplicado em cada
// route handler (App Router não tem hook central tipo Fastify onResponse;
// middleware roda antes do handler e não vê o status/duração reais -- ver
// nota histórica em .specs/features/observability-metrics/spec.md).
//
// Módulo Node cacheado pelo processo -- roda uma única vez por processo mesmo
// se importado em vários route handlers.
import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client'

export const registry = new Registry()
collectDefaultMetrics({ register: registry })

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
})

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [registry],
})
