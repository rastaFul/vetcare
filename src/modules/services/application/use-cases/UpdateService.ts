import { IServiceRepository } from '../ports/IServiceRepository'
import { Service } from '../../domain/entities/Service'
import { NotFoundError, ValidationError } from '@/shared/infrastructure/errors'
import { UpdateServiceInput } from '../dtos/ServiceDTO'

export class UpdateService {
  constructor(private readonly repo: IServiceRepository) {}

  async execute(id: string, tenantId: string, input: UpdateServiceInput): Promise<Service> {
    const service = await this.repo.findById(id, tenantId)
    if (!service) throw new NotFoundError('Serviço')
    if (input.price !== undefined && input.price < 0) {
      throw new ValidationError('Preço não pode ser negativo')
    }
    Object.assign(service['props'], input)
    await this.repo.update(service)
    return service
  }
}
