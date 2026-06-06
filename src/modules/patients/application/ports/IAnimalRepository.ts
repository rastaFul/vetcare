import { Animal } from '../../domain/entities/Animal'

export interface ListAnimalsOptions {
  tenantId: string
  tutorId?: string
  species?: string
  status?: string
  search?: string
  page?: number
  pageSize?: number
}

export interface IAnimalRepository {
  save(animal: Animal): Promise<void>
  findById(id: string, tenantId: string): Promise<Animal | null>
  list(options: ListAnimalsOptions): Promise<{ animals: Animal[]; total: number }>
  update(animal: Animal): Promise<void>
  countByTenant(tenantId: string): Promise<number>
}
