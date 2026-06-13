import { RegisterClient } from '../RegisterClient'
import { IClientRepository } from '../../ports/IClientRepository'
import { Client } from '../../../domain/entities/Client'
import { ValidationError } from '@/shared/infrastructure/errors'

const makeRepo = (): jest.Mocked<IClientRepository> => ({
  save: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
  findById: jest.fn(),
  list: jest.fn(),
  saveHealthRecord: jest.fn(),
  findHealthRecord: jest.fn(),
})

describe('RegisterClient use case', () => {
  it('valid data → client created, repo.save called', async () => {
    const repo = makeRepo()
    const useCase = new RegisterClient(repo)
    const result = await useCase.execute({
      tenantId: 'tenant-1',
      name: 'Maria Santos',
      phone: '11988887777',
    })
    expect(result).toBeInstanceOf(Client)
    expect(result.name).toBe('Maria Santos')
    expect(result.status).toBe('ACTIVE')
    expect(repo.save).toHaveBeenCalledWith(result)
  })

  it('missing phone → throws ValidationError', async () => {
    const repo = makeRepo()
    const useCase = new RegisterClient(repo)
    await expect(useCase.execute({ tenantId: 'tenant-1', name: 'Maria', phone: '' }))
      .rejects.toThrow(ValidationError)
  })

  it('missing name → throws ValidationError', async () => {
    const repo = makeRepo()
    const useCase = new RegisterClient(repo)
    await expect(useCase.execute({ tenantId: 'tenant-1', name: '', phone: '11988887777' }))
      .rejects.toThrow(ValidationError)
  })
})
