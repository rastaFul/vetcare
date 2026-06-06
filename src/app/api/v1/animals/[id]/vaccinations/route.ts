import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaVaccinationRepository } from '@/modules/preventive/infrastructure/repositories/PrismaVaccinationRepository'
import { PrismaAnimalRepository } from '@/modules/patients/infrastructure/repositories/PrismaAnimalRepository'
import { ApplyVaccination } from '@/modules/preventive/application/use-cases/ApplyVaccination'
import { ListVaccinations } from '@/modules/preventive/application/use-cases/ListVaccinations'
import { ApplyVaccinationSchema } from '@/modules/preventive/application/dtos/PreventiveDTO'
import { VaccinationRecord } from '@/modules/preventive/domain/entities/VaccinationRecord'

const vaccinationRepo = new PrismaVaccinationRepository()
const animalRepo = new PrismaAnimalRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: animalId } = await params
    const session = await getAuthSession()
    const useCase = new ListVaccinations(vaccinationRepo)
    const records = await useCase.execute(animalId, session.tenantId)
    return apiSuccess(records.map(vaccinationToDTO))
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
    const input = ApplyVaccinationSchema.parse({ ...body, animalId })
    const useCase = new ApplyVaccination(vaccinationRepo, animalRepo, null)
    const record = await useCase.execute(session.tenantId, input)
    return apiSuccess(vaccinationToDTO(record), 201)
  } catch (e) {
    return apiError(e)
  }
}

function vaccinationToDTO(record: VaccinationRecord) {
  return {
    id: record.id,
    animalId: record.animalId,
    tenantId: record.tenantId,
    vaccine: record.vaccine,
    appliedAt: record.appliedAt.toISOString(),
    nextDoseAt: record.nextDoseAt?.toISOString(),
    batchNumber: record.batchNumber,
    manufacturer: record.manufacturer,
    observations: record.observations,
    googleCalendarEventId: record.googleCalendarEventId,
    createdAt: record.createdAt.toISOString(),
  }
}
