import { Entity } from '@/shared/domain/Entity'

export interface ServiceProps {
  tenantId: string
  name: string
  durationMin: number
  price: number
  description?: string
  active: boolean
  sortOrder: number
  createdAt: Date
}

export class Service extends Entity<ServiceProps> {
  get tenantId() { return this.props.tenantId }
  get name() { return this.props.name }
  get durationMin() { return this.props.durationMin }
  get price() { return this.props.price }
  get description() { return this.props.description }
  get active() { return this.props.active }
  get sortOrder() { return this.props.sortOrder }
  get createdAt() { return this.props.createdAt }

  static create(props: Omit<ServiceProps, 'active' | 'sortOrder' | 'createdAt'>, id?: string): Service {
    return new Service({ ...props, active: true, sortOrder: 0, createdAt: new Date() }, id)
  }

  deactivate(): void { this.props.active = false }
  activate(): void { this.props.active = true }
}
