import { IClientRepository, ListClientsInput } from '../ports/IClientRepository'
import { Client } from '../../domain/entities/Client'

export interface ListClientsOutput {
  clients: Client[]
  total: number
}

export class ListClients {
  constructor(private readonly repo: IClientRepository) {}

  async execute(input: ListClientsInput): Promise<ListClientsOutput> {
    return this.repo.list(input)
  }
}
