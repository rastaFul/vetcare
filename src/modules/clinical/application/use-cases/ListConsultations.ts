import { Consultation } from '../../domain/entities/Consultation'
import { IConsultationRepository, ListConsultationsOptions } from '../ports/IConsultationRepository'

export class ListConsultations {
  constructor(private readonly consultationRepo: IConsultationRepository) {}

  async execute(options: ListConsultationsOptions): Promise<{ consultations: Consultation[]; total: number }> {
    return this.consultationRepo.list(options)
  }
}
