import { ListSessions } from '../ListSessions'
import { ISessionRepository } from '../../ports/ISessionRepository'

const makeRepo = (): jest.Mocked<ISessionRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  list: jest.fn().mockResolvedValue({ sessions: [], total: 0 }),
  findUpcoming: jest.fn(),
})

describe('ListSessions use case', () => {
  it('execute({ tenantId }) → calls repo.list with tenantId', async () => {
    const repo = makeRepo()
    const useCase = new ListSessions(repo)
    await useCase.execute({ tenantId: 'tenant-1' })
    expect(repo.list).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tenant-1' }))
  })

  it('execute with filters → passes all filters to repo', async () => {
    const repo = makeRepo()
    const useCase = new ListSessions(repo)
    const dateFrom = new Date('2026-07-01')
    await useCase.execute({ tenantId: 'tenant-1', clientId: 'client-1', status: 'SCHEDULED', dateFrom })
    expect(repo.list).toHaveBeenCalledWith(expect.objectContaining({ clientId: 'client-1', status: 'SCHEDULED', dateFrom }))
  })
})
