import { ISessionRepository, ListSessionsInput } from '../ports/ISessionRepository'
import { Session } from '../../domain/entities/Session'

export interface ListSessionsOutput {
  sessions: Session[]
  total: number
}

export class ListSessions {
  constructor(private readonly repo: ISessionRepository) {}

  async execute(input: ListSessionsInput): Promise<ListSessionsOutput> {
    return this.repo.list(input)
  }
}
