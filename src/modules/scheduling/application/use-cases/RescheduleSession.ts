import { Session } from '../../domain/entities/Session'
import { ISessionRepository } from '../ports/ISessionRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class RescheduleSession {
  constructor(private readonly repo: ISessionRepository) {}

  async execute(sessionId: string, tenantId: string, scheduledAt: Date): Promise<Session> {
    const session = await this.repo.findById(sessionId, tenantId)
    if (!session) throw new NotFoundError('Sessão')
    session.reschedule(scheduledAt)
    await this.repo.update(session)
    return session
  }
}
