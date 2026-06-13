import { IClientRepository } from '../ports/IClientRepository'
import { ClientHealthRecord } from '../../domain/entities/ClientHealthRecord'

export interface UpdateClientHealthRecordInput {
  tenantId: string
  clientId: string
  pathologies?: string
  contraindications?: string
  medications?: string
  allergies?: string
  objectives?: string
  observations?: string
}

export class UpdateClientHealthRecord {
  constructor(private readonly repo: IClientRepository) {}

  async execute(input: UpdateClientHealthRecordInput): Promise<ClientHealthRecord> {
    const { tenantId, clientId, ...data } = input
    let record = await this.repo.findHealthRecord(clientId, tenantId)

    if (record) {
      record.update(data)
    } else {
      record = ClientHealthRecord.create({ tenantId, clientId, ...data })
    }

    await this.repo.saveHealthRecord(record)
    return record
  }
}
