import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaPrescriptionRepository } from '@/modules/prescriptions/infrastructure/repositories/PrismaPrescriptionRepository'
import { ListPrescriptions } from '@/modules/prescriptions/application/use-cases/ListPrescriptions'
import { Prescription } from '@/modules/prescriptions/domain/entities/Prescription'

const prescriptionRepo = new PrismaPrescriptionRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: animalId } = await params
    const session = await getAuthSession()
    const useCase = new ListPrescriptions(prescriptionRepo)
    const prescriptions = await useCase.executeByAnimal(animalId, session.tenantId)
    return apiSuccess(prescriptions.map(prescriptionToDTO))
  } catch (e) {
    return apiError(e)
  }
}

function prescriptionToDTO(prescription: Prescription) {
  return {
    id: prescription.id,
    tenantId: prescription.tenantId,
    consultationId: prescription.consultationId,
    animalId: prescription.animalId,
    veterinarianId: prescription.veterinarianId,
    diagnosis: prescription.diagnosis,
    observations: prescription.observations,
    items: prescription.items,
    pdfUrl: prescription.pdfUrl,
    pdfGeneratedAt: prescription.pdfGeneratedAt?.toISOString(),
    createdAt: prescription.createdAt.toISOString(),
  }
}
