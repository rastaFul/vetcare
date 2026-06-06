import { Consultation } from '../../domain/entities/Consultation'
import { IConsultationRepository } from '../ports/IConsultationRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class GetConsultation {
  constructor(private readonly consultationRepo: IConsultationRepository) {}

  async execute(id: string, tenantId: string): Promise<Consultation> {
    const consultation = await this.consultationRepo.findById(id, tenantId)
    if (!consultation) throw new NotFoundError('Consulta')
    return consultation
  }
}
