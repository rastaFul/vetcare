import { IConsultationRepository } from '../ports/IConsultationRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class ConfirmConsultation {
  constructor(private readonly consultationRepo: IConsultationRepository) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const consultation = await this.consultationRepo.findById(id, tenantId)
    if (!consultation) throw new NotFoundError('Consulta')

    consultation.confirm()
    await this.consultationRepo.update(consultation)
  }
}
