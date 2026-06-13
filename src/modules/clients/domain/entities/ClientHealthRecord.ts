import { Entity } from '@/shared/domain/Entity'

export interface ClientHealthRecordProps {
  tenantId: string
  clientId: string
  pathologies?: string
  contraindications?: string
  medications?: string
  allergies?: string
  objectives?: string
  observations?: string
  updatedAt: Date
}

export class ClientHealthRecord extends Entity<ClientHealthRecordProps> {
  get tenantId() { return this.props.tenantId }
  get clientId() { return this.props.clientId }
  get pathologies() { return this.props.pathologies }
  get contraindications() { return this.props.contraindications }
  get medications() { return this.props.medications }
  get allergies() { return this.props.allergies }
  get objectives() { return this.props.objectives }
  get observations() { return this.props.observations }
  get updatedAt() { return this.props.updatedAt }

  static create(props: Omit<ClientHealthRecordProps, 'updatedAt'>, id?: string): ClientHealthRecord {
    return new ClientHealthRecord({ ...props, updatedAt: new Date() }, id)
  }

  update(data: Partial<Omit<ClientHealthRecordProps, 'tenantId' | 'clientId' | 'updatedAt'>>): void {
    Object.assign(this.props, data)
    this.props.updatedAt = new Date()
  }
}
