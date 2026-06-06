import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaVaccinationRepository } from '@/modules/preventive/infrastructure/repositories/PrismaVaccinationRepository'
import { VaccinationRecord } from '@/modules/preventive/domain/entities/VaccinationRecord'

const vaccinationRepo = new PrismaVaccinationRepository()

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const { searchParams } = new URL(req.url)
    const days = Number(searchParams.get('days') ?? 30)
    const records = await vaccinationRepo.findUpcoming(session.tenantId, days)
    return apiSuccess(records.map(vaccinationToDTO))
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
    createdAt: record.createdAt.toISOString(),
  }
}
