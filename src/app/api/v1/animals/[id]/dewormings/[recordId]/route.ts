import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaDewormingRepository } from '@/modules/preventive/infrastructure/repositories/PrismaDewormingRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'

const dewormingRepo = new PrismaDewormingRepository()

export async function DELETE(
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
