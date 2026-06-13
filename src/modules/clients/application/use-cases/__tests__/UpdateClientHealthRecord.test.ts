import { UpdateClientHealthRecord } from '../UpdateClientHealthRecord'
import { IClientRepository } from '../../ports/IClientRepository'
import { ClientHealthRecord } from '../../../domain/entities/ClientHealthRecord'

const makeRepo = (): jest.Mocked<IClientRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  list: jest.fn(),
  saveHealthRecord: jest.fn().mockResolvedValue(undefined),
  findHealthRecord: jest.fn(),
})

describe('UpdateClientHealthRecord use case', () => {
  it('health record exists → updates via record.update() and saves', async () => {
    const repo = makeRepo()
    const existing = ClientHealthRecord.create({ tenantId: 'tenant-1', clientId: 'client-1', pathologies: 'Old' })
    repo.findHealthRecord.mockResolvedValue(existing)
    const useCase = new UpdateClientHealthRecord(repo)
    await useCase.execute({ tenantId: 'tenant-1', clientId: 'client-1', pathologies: 'Hipertensão' })
    expect(existing.pathologies).toBe('Hipertensão')
    expect(repo.saveHealthRecord).toHaveBeenCalledWith(existing)
  })

  it('health record does not exist → creates new record', async () => {
    const repo = makeRepo()
    repo.findHealthRecord.mockResolvedValue(null)
    const useCase = new UpdateClientHealthRecord(repo)
    await useCase.execute({ tenantId: 'tenant-1', clientId: 'client-1', objectives: 'Relaxamento' })
    expect(repo.saveHealthRecord).toHaveBeenCalledWith(expect.any(ClientHealthRecord))
  })
})
