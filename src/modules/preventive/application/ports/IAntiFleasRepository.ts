import { AntiFleasRecord } from '../../domain/entities/AntiFleasRecord'

export interface IAntiFleasRepository {
  save(record: AntiFleasRecord): Promise<void>
  findById(id: string, tenantId?: string): Promise<AntiFleasRecord | null>
  findByAnimal(animalId: string, tenantId: string): Promise<AntiFleasRecord[]>
  delete(id: string): Promise<void>
  findUpcoming(tenantId: string, daysAhead: number): Promise<AntiFleasRecord[]>
}
