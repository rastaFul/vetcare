import { Session } from '../../domain/entities/Session'

export interface ListSessionsInput {
  tenantId: string
  clientId?: string
  status?: string
  dateFrom?: Date
  dateTo?: Date
  page?: number
  pageSize?: number
}

export interface ISessionRepository {
  save(session: Session): Promise<void>
  update(session: Session): Promise<void>
  findById(id: string, tenantId: string): Promise<Session | null>
  list(input: ListSessionsInput): Promise<{ sessions: Session[]; total: number }>
  findUpcoming(tenantId: string, hoursAhead: number): Promise<Session[]>
}
