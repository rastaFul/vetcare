import { Client } from '../../domain/entities/Client'
import { IClientRepository } from '../ports/IClientRepository'
import { ValidationError } from '@/shared/infrastructure/errors'

export interface RegisterClientInput {
  tenantId: string
  name: string
  phone: string
  whatsapp?: string
  email?: string
  notes?: string
}

export class RegisterClient {
  constructor(private readonly repo: IClientRepository) {}

  async execute(input: RegisterClientInput): Promise<Client> {
    if (!input.name || input.name.trim() === '') {
      throw new ValidationError('Nome é obrigatório')
    }
    if (!input.phone || input.phone.trim() === '') {
      throw new ValidationError('Telefone é obrigatório')
    }

    const client = Client.create({
      tenantId: input.tenantId,
      name: input.name.trim(),
      phone: input.phone.trim(),
      whatsapp: input.whatsapp,
      email: input.email,
      notes: input.notes,
    })

    await this.repo.save(client)
    return client
  }
}
