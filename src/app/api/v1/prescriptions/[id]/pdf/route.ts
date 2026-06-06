import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaPrescriptionRepository } from '@/modules/prescriptions/infrastructure/repositories/PrismaPrescriptionRepository'
import { GetPrescription } from '@/modules/prescriptions/application/use-cases/GetPrescription'

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

    if (prescription.pdfUrl) {
      return NextResponse.redirect(prescription.pdfUrl)
    }

    return NextResponse.json({ message: 'PDF ainda sendo gerado' }, { status: 202 })
  } catch (e) {
    return apiError(e)
  }
}
