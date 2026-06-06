import { DewormingRecord } from '../../domain/entities/DewormingRecord'

export interface IDewormingRepository {
  save(record: DewormingRecord): Promise<void>
  findById(id: string, tenantId?: string): Promise<DewormingRecord | null>
  findByAnimal(animalId: string, tenantId: string): Promise<DewormingRecord[]>
  delete(id: string): Promise<void>
  findUpcoming(tenantId: string, daysAhead: number): Promise<DewormingRecord[]>
}
