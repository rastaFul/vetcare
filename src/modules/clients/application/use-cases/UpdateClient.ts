import { IClientRepository } from '../ports/IClientRepository'
import { Client } from '../../domain/entities/Client'
import { NotFoundError } from '@/shared/infrastructure/errors'
import { UpdateClientInput } from '../dtos/ClientDTO'

export class UpdateClient {
  constructor(private readonly repo: IClientRepository) {}

  async execute(id: string, tenantId: string, input: UpdateClientInput): Promise<Client> {
    const client = await this.repo.findById(id, tenantId)
    if (!client) throw new NotFoundError('Cliente')
    Object.assign(client['props'], { ...input, updatedAt: new Date() })
    await this.repo.update(client)
    return client
  }
}
