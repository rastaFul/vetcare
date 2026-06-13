import { IClientRepository } from '../ports/IClientRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class DeactivateClient {
  constructor(private readonly repo: IClientRepository) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const client = await this.repo.findById(id, tenantId)
    if (!client) throw new NotFoundError('Cliente')
    client.deactivate()
    await this.repo.update(client)
  }
}
