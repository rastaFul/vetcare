import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaPrescriptionRepository } from '@/modules/prescriptions/infrastructure/repositories/PrismaPrescriptionRepository'
import { PrismaConsultationRepository } from '@/modules/clinical/infrastructure/repositories/PrismaConsultationRepository'
import { CreatePrescription } from '@/modules/prescriptions/application/use-cases/CreatePrescription'
import { ListPrescriptions } from '@/modules/prescriptions/application/use-cases/ListPrescriptions'
import { CreatePrescriptionSchema } from '@/modules/prescriptions/application/dtos/PrescriptionDTO'
import { Prescription } from '@/modules/prescriptions/domain/entities/Prescription'

const prescriptionRepo = new PrismaPrescriptionRepository()
const consultationRepo = new PrismaConsultationRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: consultationId } = await params
    const session = await getAuthSession()
    const useCase = new ListPrescriptions(prescriptionRepo)
    const prescriptions = await useCase.executeByConsultation(consultationId, session.tenantId)
    return apiSuccess(prescriptions.map(prescriptionToDTO))
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: consultationId } = await params
    const session = await getAuthSession()
    const body = await req.json()
    const input = CreatePrescriptionSchema.parse({ ...body, consultationId })
    const useCase = new CreatePrescription(prescriptionRepo, consultationRepo)
    const prescription = await useCase.execute(session.tenantId, session.userId, input)
    return apiSuccess(prescriptionToDTO(prescription), 201)
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
