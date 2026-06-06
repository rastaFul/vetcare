import { VaccinationRecord } from '../../domain/entities/VaccinationRecord'

export interface IVaccinationRepository {
  save(record: VaccinationRecord): Promise<void>
  findById(id: string, tenantId?: string): Promise<VaccinationRecord | null>
  findByAnimal(animalId: string, tenantId: string): Promise<VaccinationRecord[]>
  delete(id: string): Promise<void>
  findUpcoming(tenantId: string, daysAhead: number): Promise<VaccinationRecord[]>
}
