import fs from 'fs'
import path from 'path'
import { Prescription } from '../../domain/entities/Prescription'
import { IPrescriptionRepository } from '../ports/IPrescriptionRepository'
import { IConsultationRepository } from '@/modules/clinical/application/ports/IConsultationRepository'
import { CreatePrescriptionInput } from '../dtos/PrescriptionDTO'
import { NotFoundError } from '@/shared/infrastructure/errors'
import { generatePrescriptionPdf } from '../../infrastructure/pdf/PrescriptionPdfGenerator'

export class CreatePrescription {
  constructor(
    private readonly prescriptionRepo: IPrescriptionRepository,
    private readonly consultationRepo: IConsultationRepository
  ) {}

  async execute(
    tenantId: string,
    veterinarianId: string,
    input: CreatePrescriptionInput
  ): Promise<Prescription> {
    const consultation = await this.consultationRepo.findById(input.consultationId, tenantId)
    if (!consultation) throw new NotFoundError('Consulta')

    const prescription = Prescription.create({
      tenantId,
      consultationId: input.consultationId,
      animalId: consultation.animalId,
      veterinarianId,
      diagnosis: input.diagnosis,
      observations: input.observations,
      items: input.items,
    })

    await this.prescriptionRepo.save(prescription)

    // best-effort PDF generation
    try {
      const pdfBuffer = await generatePrescriptionPdf({
        prescription: {
          diagnosis: prescription.diagnosis,
          observations: prescription.observations,
          items: prescription.items,
        },
        consultationDate: consultation.scheduledAt,
      })

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'prescriptions')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }
      const filename = `${prescription.id}.pdf`
      fs.writeFileSync(path.join(uploadsDir, filename), pdfBuffer)
      prescription.setPdfUrl(`/uploads/prescriptions/${filename}`)
      await this.prescriptionRepo.update(prescription)
    } catch {
      // best-effort, do not fail
    }

    return prescription
  }
}
