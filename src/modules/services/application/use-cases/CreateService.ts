import { Service } from '../../domain/entities/Service'
import { IServiceRepository } from '../ports/IServiceRepository'
import { ValidationError } from '@/shared/infrastructure/errors'

export interface CreateServiceInput {
  tenantId: string
  name: string
  durationMin: number
  price: number
  description?: string
}

export class CreateService {
  constructor(private readonly repo: IServiceRepository) {}

  async execute(input: CreateServiceInput): Promise<Service> {
    if (input.price < 0) {
      throw new ValidationError('Preço não pode ser negativo')
    }

    const service = Service.create({
      tenantId: input.tenantId,
      name: input.name,
      durationMin: input.durationMin,
      price: input.price,
      description: input.description,
    })

    await this.repo.save(service)
    return service
  }
}
