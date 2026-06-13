import { Session } from '../../domain/entities/Session'
import { ISessionRepository } from '../ports/ISessionRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'

export interface CancelSessionInput {
  tenantId: string
  sessionId: string
}

export class CancelSession {
  constructor(private readonly repo: ISessionRepository) {}

  async execute(input: CancelSessionInput): Promise<Session> {
    const session = await this.repo.findById(input.sessionId, input.tenantId)
    if (!session) throw new NotFoundError('Sessão')
    session.cancel()
    await this.repo.update(session)
    return session
  }
}
