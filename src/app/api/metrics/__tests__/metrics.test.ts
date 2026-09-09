import { GET } from '../route'
import { NextRequest } from 'next/server'

describe('GET /api/metrics', () => {
  const ORIGINAL_TOKEN = process.env.METRICS_TOKEN

  beforeEach(() => {
    process.env.METRICS_TOKEN = 'test-token-123'
  })

  afterAll(() => {
    process.env.METRICS_TOKEN = ORIGINAL_TOKEN
  })

  function request(authHeader?: string) {
    return new NextRequest('http://localhost:3004/api/metrics', {
      headers: authHeader ? { authorization: authHeader } : undefined,
    })
  }

  it('returns 401 without Authorization header', async () => {
    const res = await GET(request())
    expect(res.status).toBe(401)
  })

  it('returns 401 with wrong token', async () => {
    const res = await GET(request('Bearer wrong-token'))
    expect(res.status).toBe(401)
  })

  it('returns 200 with Prometheus format and correct token', async () => {
    const res = await GET(request('Bearer test-token-123'))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/plain')
    const body = await res.text()
    // Sem prefixo desde 2026-09-09 (alinhado com artists-api/microgrow-api/
    // rastafinancas-api -- o dashboard compartilhado "Golden Signals" depende
    // de nomes sem prefixo). Ver src/lib/metrics.ts.
    expect(body).toContain('http_requests_total')
    expect(body).toContain('process_cpu_user_seconds_total')
  })

  it('returns 401 if METRICS_TOKEN is not configured', async () => {
    delete process.env.METRICS_TOKEN
    const res = await GET(request('Bearer anything'))
    expect(res.status).toBe(401)
  })
})
