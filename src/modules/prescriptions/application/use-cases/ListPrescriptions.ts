import { Prescription } from '../../domain/entities/Prescription'
import { IPrescriptionRepository } from '../ports/IPrescriptionRepository'

export class ListPrescriptions {
  constructor(private readonly prescriptionRepo: IPrescriptionRepository) {}

  async executeByAnimal(animalId: string, tenantId: string): Promise<Prescription[]> {
    return this.prescriptionRepo.findByAnimal(animalId, tenantId)
  }

  async executeByConsultation(consultationId: string, tenantId: string): Promise<Prescription[]> {
    return this.prescriptionRepo.findByConsultation(consultationId, tenantId)
  }
}
