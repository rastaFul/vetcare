import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaDewormingRepository } from '@/modules/preventive/infrastructure/repositories/PrismaDewormingRepository'
import { PrismaAnimalRepository } from '@/modules/patients/infrastructure/repositories/PrismaAnimalRepository'
import { ApplyDeworming } from '@/modules/preventive/application/use-cases/ApplyDeworming'
import { ListDewormings } from '@/modules/preventive/application/use-cases/ListDewormings'
import { ApplyDewormingSchema } from '@/modules/preventive/application/dtos/PreventiveDTO'
import { DewormingRecord } from '@/modules/preventive/domain/entities/DewormingRecord'
import { withMetrics } from '@/lib/with-metrics'


const dewormingRepo = new PrismaDewormingRepository()
const animalRepo = new PrismaAnimalRepository()

async function GET_impl(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: animalId } = await params
    const session = await getAuthSession()
    const useCase = new ListDewormings(dewormingRepo)
    const records = await useCase.execute(animalId, session.tenantId)
    return apiSuccess(records.map(dewormingToDTO))
  } catch (e) {
    return apiError(e)
  }
}
export const GET = withMetrics("/api/v1/animals/:id/dewormings", GET_impl)


async function POST_impl(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: animalId } = await params
    const session = await getAuthSession()
    const body = await req.json()
    const input = ApplyDewormingSchema.parse({ ...body, animalId })
    const useCase = new ApplyDeworming(dewormingRepo, animalRepo, null)
    const record = await useCase.execute(session.tenantId, input)
    return apiSuccess(dewormingToDTO(record), 201)
  } catch (e) {
    return apiError(e)
  }
}
export const POST = withMetrics("/api/v1/animals/:id/dewormings", POST_impl)


function dewormingToDTO(record: DewormingRecord) {
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
