import { Session } from '../../domain/entities/Session'
import { ISessionRepository } from '../ports/ISessionRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class ConfirmSession {
  constructor(private readonly repo: ISessionRepository) {}

  async execute(sessionId: string, tenantId: string): Promise<Session> {
    const session = await this.repo.findById(sessionId, tenantId)
    if (!session) throw new NotFoundError('Sessão')
    session.confirm()
    await this.repo.update(session)
    return session
  }
}
