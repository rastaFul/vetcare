import { CreateService } from '../CreateService'
import { IServiceRepository } from '../../ports/IServiceRepository'
import { Service } from '../../../domain/entities/Service'
import { ValidationError } from '@/shared/infrastructure/errors'

const makeRepo = (): jest.Mocked<IServiceRepository> => ({
  save: jest.fn().mockResolvedValue(undefined),
  update: jest.fn(),
  findById: jest.fn(),
  list: jest.fn(),
})

describe('CreateService use case', () => {
  it('valid data → service created, repo.save called', async () => {
    const repo = makeRepo()
    const useCase = new CreateService(repo)
    const result = await useCase.execute({
      tenantId: 'tenant-1',
      name: 'Massagem Relaxante',
      durationMin: 60,
      price: 150,
    })
    expect(result).toBeInstanceOf(Service)
    expect(result.active).toBe(true)
    expect(repo.save).toHaveBeenCalledWith(result)
  })

  it('negative price → throws ValidationError', async () => {
    const repo = makeRepo()
    const useCase = new CreateService(repo)
    await expect(useCase.execute({ tenantId: 'tenant-1', name: 'Test', durationMin: 60, price: -10 }))
      .rejects.toThrow(ValidationError)
  })
})
