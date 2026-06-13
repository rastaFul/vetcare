import { IClientRepository } from '../ports/IClientRepository'
import { Client } from '../../domain/entities/Client'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class GetClient {
  constructor(private readonly repo: IClientRepository) {}

  async execute(id: string, tenantId: string): Promise<Client> {
    const client = await this.repo.findById(id, tenantId)
    if (!client) throw new NotFoundError('Cliente')
    return client
  }
}
