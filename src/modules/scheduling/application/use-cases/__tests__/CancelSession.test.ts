import { CancelSession } from '../CancelSession'
import { ISessionRepository } from '../../ports/ISessionRepository'
import { Session } from '../../../domain/entities/Session'
import { NotFoundError } from '@/shared/infrastructure/errors'

const makeRepo = (): jest.Mocked<ISessionRepository> => ({
  save: jest.fn(),
  update: jest.fn().mockResolvedValue(undefined),
  findById: jest.fn(),
  list: jest.fn(),
  findUpcoming: jest.fn(),
})

const makeSession = () =>
  Session.create({
    tenantId: 'tenant-1',
    clientId: 'client-1',
    therapistId: 'user-1',
    scheduledAt: new Date('2026-07-01T10:00:00Z'),
  })

describe('CancelSession use case', () => {
  it('session found → cancels and updates', async () => {
    const repo = makeRepo()
    const session = makeSession()
    repo.findById.mockResolvedValue(session)
    const useCase = new CancelSession(repo)
    await useCase.execute({ tenantId: 'tenant-1', sessionId: session.id })
    expect(session.status).toBe('CANCELLED')
    expect(repo.update).toHaveBeenCalledWith(session)
  })

  it('session not found → throws NotFoundError', async () => {
    const repo = makeRepo()
    repo.findById.mockResolvedValue(null)
    const useCase = new CancelSession(repo)
    await expect(useCase.execute({ tenantId: 'tenant-1', sessionId: 'missing' })).rejects.toThrow(NotFoundError)
  })
})
