import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaPrescriptionRepository } from '@/modules/prescriptions/infrastructure/repositories/PrismaPrescriptionRepository'
import { GetPrescription } from '@/modules/prescriptions/application/use-cases/GetPrescription'
import { Prescription } from '@/modules/prescriptions/domain/entities/Prescription'

const prescriptionRepo = new PrismaPrescriptionRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getAuthSession()
    const useCase = new GetPrescription(prescriptionRepo)
    const prescription = await useCase.execute(id, session.tenantId)
    return apiSuccess(prescriptionToDTO(prescription))
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
