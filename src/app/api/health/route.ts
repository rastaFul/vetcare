import { NextResponse } from 'next/server'
import { withMetrics } from '@/lib/with-metrics'


async function GET_impl() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'vetcare-api',
  })
}
export const GET = withMetrics("/api/health", GET_impl)

