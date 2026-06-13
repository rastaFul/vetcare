import { IServiceRepository } from '../ports/IServiceRepository'
import { Service } from '../../domain/entities/Service'

export class ListServices {
  constructor(private readonly repo: IServiceRepository) {}

  async execute(tenantId: string, activeOnly?: boolean): Promise<Service[]> {
    return this.repo.list(tenantId, activeOnly)
  }
}
