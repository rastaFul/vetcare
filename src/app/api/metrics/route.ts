import { NextRequest, NextResponse } from 'next/server'
import { registry } from '@/lib/metrics'

// GET /api/metrics -- formato Prometheus, protegido por Bearer token.
// Mesmo padrão dos outros 3 produtos (rastafinancas/apps/api/src/plugins/metrics.ts,
// microgrow/api/src/plugins/prom-metrics.ts): token, não IP allowlist -- tráfego via
// host.docker.internal (Prometheus rodando em Docker) é NAT'd pra parecer 127.0.0.1
// no WSL2/Docker Desktop, então qualquer container no host poderia ler isso sem o
// token. Bypass do NextAuth em src/lib/auth.config.ts (isPublicPath) -- a rota é
// pública pro middleware, mas exige o token abaixo, é ela quem decide 401/200.
export async function GET(req: NextRequest) {
  const metricsToken = process.env.METRICS_TOKEN
  const authHeader = req.headers.get('authorization')
  const providedToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

  if (!metricsToken || providedToken !== metricsToken) {
    return NextResponse.json({ error: 'forbidden' }, { status: 401 })
  }

  const metrics = await registry.metrics()
  return new NextResponse(metrics, {
    status: 200,
    headers: { 'Content-Type': registry.contentType },
  })
}
