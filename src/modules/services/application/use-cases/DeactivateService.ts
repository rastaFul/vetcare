import { IServiceRepository } from '../ports/IServiceRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class DeactivateService {
  constructor(private readonly repo: IServiceRepository) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const service = await this.repo.findById(id, tenantId)
    if (!service) throw new NotFoundError('Serviço')
    service.deactivate()
    await this.repo.update(service)
  }
}
