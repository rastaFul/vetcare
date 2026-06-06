import { Tutor } from '../../domain/entities/Tutor'

export interface ListTutorsOptions {
  tenantId: string
  search?: string
  status?: 'ACTIVE' | 'INACTIVE'
  page?: number
  pageSize?: number
}

export interface ListTutorsResult {
  tutors: Tutor[]
  total: number
}

export interface ITutorRepository {
  save(tutor: Tutor): Promise<void>
  findById(id: string, tenantId: string): Promise<Tutor | null>
  findByCpf(cpf: string, tenantId: string): Promise<Tutor | null>
  list(options: ListTutorsOptions): Promise<ListTutorsResult>
  update(tutor: Tutor): Promise<void>
}
