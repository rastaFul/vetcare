import { ListServices } from '../ListServices'
import { IServiceRepository } from '../../ports/IServiceRepository'

const makeRepo = (): jest.Mocked<IServiceRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  list: jest.fn().mockResolvedValue([]),
})

describe('ListServices use case', () => {
  it('execute → calls repo.list with tenantId', async () => {
    const repo = makeRepo()
    const useCase = new ListServices(repo)
    await useCase.execute('tenant-1')
    expect(repo.list).toHaveBeenCalledWith('tenant-1', undefined)
  })

  it('execute activeOnly → passes activeOnly=true', async () => {
    const repo = makeRepo()
    const useCase = new ListServices(repo)
    await useCase.execute('tenant-1', true)
    expect(repo.list).toHaveBeenCalledWith('tenant-1', true)
  })
})
