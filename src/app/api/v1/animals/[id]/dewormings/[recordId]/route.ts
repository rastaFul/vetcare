import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaDewormingRepository } from '@/modules/preventive/infrastructure/repositories/PrismaDewormingRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'
import { withMetrics } from '@/lib/with-metrics'


const dewormingRepo = new PrismaDewormingRepository()

async function DELETE_impl(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { recordId } = await params
    const session = await getAuthSession()
    const record = await dewormingRepo.findById(recordId, session.tenantId)
    if (!record) throw new NotFoundError('Registro de vermifugação')
    await dewormingRepo.delete(recordId)
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    return apiError(e)
  }
}
export const DELETE = withMetrics("/api/v1/animals/:id/dewormings/:recordId", DELETE_impl)

