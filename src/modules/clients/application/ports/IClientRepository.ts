import { Client } from '../../domain/entities/Client'
import { ClientHealthRecord } from '../../domain/entities/ClientHealthRecord'

export interface ListClientsInput {
  tenantId: string
  search?: string
  status?: 'ACTIVE' | 'INACTIVE'
  page?: number
  pageSize?: number
}

export interface IClientRepository {
  save(client: Client): Promise<void>
  update(client: Client): Promise<void>
  findById(id: string, tenantId: string): Promise<Client | null>
  list(input: ListClientsInput): Promise<{ clients: Client[]; total: number }>
  saveHealthRecord(record: ClientHealthRecord): Promise<void>
  findHealthRecord(clientId: string, tenantId: string): Promise<ClientHealthRecord | null>
}
