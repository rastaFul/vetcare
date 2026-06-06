import { Consultation } from '../../domain/entities/Consultation'

export interface ListConsultationsOptions {
  tenantId: string
  animalId?: string
  veterinarianId?: string
  status?: string
  dateFrom?: Date
  dateTo?: Date
  page?: number
  pageSize?: number
}

export interface IConsultationRepository {
  save(consultation: Consultation): Promise<void>
  findById(id: string, tenantId: string): Promise<Consultation | null>
  list(options: ListConsultationsOptions): Promise<{ consultations: Consultation[]; total: number }>
  update(consultation: Consultation): Promise<void>
  findTodayConsultations(tenantId: string, veterinarianId: string): Promise<Consultation[]>
  findUpcomingReturns(tenantId: string, daysAhead: number): Promise<Consultation[]>
}
