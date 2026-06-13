import { GetClient } from '../GetClient'
import { IClientRepository } from '../../ports/IClientRepository'
import { Client } from '../../../domain/entities/Client'
import { NotFoundError } from '@/shared/infrastructure/errors'

const makeRepo = (): jest.Mocked<IClientRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  list: jest.fn(),
  saveHealthRecord: jest.fn(),
  findHealthRecord: jest.fn(),
})

describe('GetClient use case', () => {
  it('client exists → returns client', async () => {
    const repo = makeRepo()
    const client = Client.create({ tenantId: 'tenant-1', name: 'Ana', phone: '11999999999' })
    repo.findById.mockResolvedValue(client)
    const useCase = new GetClient(repo)
    const result = await useCase.execute('some-id', 'tenant-1')
    expect(result).toBe(client)
  })

  it('client not found → throws NotFoundError', async () => {
    const repo = makeRepo()
    repo.findById.mockResolvedValue(null)
    const useCase = new GetClient(repo)
    await expect(useCase.execute('missing-id', 'tenant-1')).rejects.toThrow(NotFoundError)
  })
})
