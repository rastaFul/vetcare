import { Prescription } from '../../domain/entities/Prescription'

export interface IPrescriptionRepository {
  save(prescription: Prescription): Promise<void>
  findById(id: string, tenantId: string): Promise<Prescription | null>
  findByAnimal(animalId: string, tenantId: string): Promise<Prescription[]>
  findByConsultation(consultationId: string, tenantId: string): Promise<Prescription[]>
  update(prescription: Prescription): Promise<void>
}
