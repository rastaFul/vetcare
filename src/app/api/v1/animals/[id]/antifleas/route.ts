import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaAntiFleasRepository } from '@/modules/preventive/infrastructure/repositories/PrismaAntiFleasRepository'
import { PrismaAnimalRepository } from '@/modules/patients/infrastructure/repositories/PrismaAnimalRepository'
import { ApplyAntiFleas } from '@/modules/preventive/application/use-cases/ApplyAntiFleas'
import { ListAntiFleas } from '@/modules/preventive/application/use-cases/ListAntiFleas'
import { ApplyAntiFleasSchema } from '@/modules/preventive/application/dtos/PreventiveDTO'
import { AntiFleasRecord } from '@/modules/preventive/domain/entities/AntiFleasRecord'

const antiFleasRepo = new PrismaAntiFleasRepository()
const animalRepo = new PrismaAnimalRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: animalId } = await params
    const session = await getAuthSession()
    const useCase = new ListAntiFleas(antiFleasRepo)
    const records = await useCase.execute(animalId, session.tenantId)
    return apiSuccess(records.map(antiFleasToDTO))
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: animalId } = await params
    const session = await getAuthSession()
    const body = await req.json()
    const input = ApplyAntiFleasSchema.parse({ ...body, animalId })
    const useCase = new ApplyAntiFleas(antiFleasRepo, animalRepo, null)
    const record = await useCase.execute(session.tenantId, input)
    return apiSuccess(antiFleasToDTO(record), 201)
  } catch (e) {
    return apiError(e)
  }
}

function antiFleasToDTO(record: AntiFleasRecord) {
  return {
    id: record.id,
    animalId: record.animalId,
    tenantId: record.tenantId,
    medication: record.medication,
    appliedAt: record.appliedAt.toISOString(),
    nextApplicationAt: record.nextApplicationAt?.toISOString(),
    observations: record.observations,
    googleCalendarEventId: record.googleCalendarEventId,
    createdAt: record.createdAt.toISOString(),
  }
}
