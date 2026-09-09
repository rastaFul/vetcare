import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaAntiFleasRepository } from '@/modules/preventive/infrastructure/repositories/PrismaAntiFleasRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'
import { withMetrics } from '@/lib/with-metrics'


const antiFleasRepo = new PrismaAntiFleasRepository()

async function DELETE_impl(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { recordId } = await params
    const session = await getAuthSession()
    const record = await antiFleasRepo.findById(recordId, session.tenantId)
    if (!record) throw new NotFoundError('Registro de antipulgas')
    await antiFleasRepo.delete(recordId)
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    return apiError(e)
  }
}
export const DELETE = withMetrics("/api/v1/animals/:id/antifleas/:recordId", DELETE_impl)

