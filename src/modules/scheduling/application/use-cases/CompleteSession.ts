import { Session } from '../../domain/entities/Session'
import { ISessionRepository } from '../ports/ISessionRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'

export interface CompleteSessionInput {
  tenantId: string
  sessionId: string
  notes?: string
  priceCharged?: number
}

export class CompleteSession {
  constructor(private readonly repo: ISessionRepository) {}

  async execute(input: CompleteSessionInput): Promise<Session> {
    const session = await this.repo.findById(input.sessionId, input.tenantId)
    if (!session) throw new NotFoundError('Sessão')
    session.complete(input.notes, input.priceCharged)
    await this.repo.update(session)
    return session
  }
}
