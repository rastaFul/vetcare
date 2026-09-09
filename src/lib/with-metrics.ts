// Wrapper de instrumentação HTTP por route handler (App Router).
//
// Por quê existe: Next.js App Router não tem um hook central tipo Fastify
// onRequest/onResponse, e o middleware roda ANTES do route handler (não vê o
// status/duração reais da resposta -- ver histórico em
// .specs/features/observability-metrics/spec.md, tentativa via middleware
// revertida em 2026-09-09 por produzir dado enganoso). Este wrapper é aplicado
// em cada handler exportado (GET/POST/PATCH/PUT/DELETE) por
// scripts/wrap-routes-with-metrics.mjs (codemod, não escrito à mão nos ~50
// arquivos) -- `route` é a string estática do path (com segmentos dinâmicos
// tipo [id] normalizados pra :id), não o pathname em runtime, então não tem
// risco de cardinalidade alta.
import type { NextRequest } from 'next/server'
import { httpRequestDuration, httpRequestsTotal } from './metrics'

type RouteHandler<Ctx> = (req: NextRequest, ctx: Ctx) => Promise<Response> | Response

export function withMetrics<Ctx = unknown>(
  route: string,
  handler: RouteHandler<Ctx>
): RouteHandler<Ctx> {
  return async (req: NextRequest, ctx: Ctx) => {
    const start = process.hrtime.bigint()
    let statusCode = 500
    try {
      const res = await handler(req, ctx)
      statusCode = res.status
      return res
    } finally {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6
      const method = req.method
      const status = String(statusCode)
      httpRequestDuration.labels(method, route, status).observe(durationMs)
      httpRequestsTotal.labels(method, route, status).inc()
    }
  }
}
