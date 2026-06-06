import { Prescription } from '../../domain/entities/Prescription'
import { IPrescriptionRepository } from '../ports/IPrescriptionRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class GetPrescription {
  constructor(private readonly prescriptionRepo: IPrescriptionRepository) {}

  async execute(id: string, tenantId: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepo.findById(id, tenantId)
    if (!prescription) throw new NotFoundError('Receita')
    return prescription
  }
}
