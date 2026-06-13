import { ListClients } from '../ListClients'
import { IClientRepository } from '../../ports/IClientRepository'

const makeRepo = (): jest.Mocked<IClientRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  list: jest.fn().mockResolvedValue({ clients: [], total: 0 }),
  saveHealthRecord: jest.fn(),
  findHealthRecord: jest.fn(),
})

describe('ListClients use case', () => {
  it('execute({ tenantId }) → calls repo.list with correct tenantId', async () => {
    const repo = makeRepo()
    const useCase = new ListClients(repo)
    await useCase.execute({ tenantId: 'tenant-1' })
    expect(repo.list).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tenant-1' }))
  })

  it('execute with search → passes search to repo', async () => {
    const repo = makeRepo()
    const useCase = new ListClients(repo)
    await useCase.execute({ tenantId: 'tenant-1', search: 'João' })
    expect(repo.list).toHaveBeenCalledWith(expect.objectContaining({ search: 'João' }))
  })
})
