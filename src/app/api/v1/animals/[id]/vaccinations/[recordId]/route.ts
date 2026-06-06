import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaVaccinationRepository } from '@/modules/preventive/infrastructure/repositories/PrismaVaccinationRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'

const vaccinationRepo = new PrismaVaccinationRepository()

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { recordId } = await params
    const session = await getAuthSession()
    const record = await vaccinationRepo.findById(recordId, session.tenantId)
    if (!record) throw new NotFoundError('Registro de vacinação')
    await vaccinationRepo.delete(recordId)
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    return apiError(e)
  }
}
