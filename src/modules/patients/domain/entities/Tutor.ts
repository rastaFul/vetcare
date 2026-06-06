import { Entity } from '@/shared/domain/Entity'

export interface TutorAddress {
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
}

export interface TutorProps {
  tenantId: string
  name: string
  cpf?: string
  phone: string
  whatsapp?: string
  email?: string
  address?: TutorAddress
  notes?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: Date
  updatedAt: Date
}

export class Tutor extends Entity<TutorProps> {
  get tenantId() {
    return this.props.tenantId
  }
  get name() {
    return this.props.name
  }
  get cpf() {
    return this.props.cpf
  }
  get phone() {
    return this.props.phone
  }
  get whatsapp() {
    return this.props.whatsapp
  }
  get email() {
    return this.props.email
  }
  get address() {
    return this.props.address
  }
  get notes() {
    return this.props.notes
  }
  get status() {
    return this.props.status
  }
  get isActive() {
    return this.props.status === 'ACTIVE'
  }
  get createdAt() {
    return this.props.createdAt
  }
  get updatedAt() {
    return this.props.updatedAt
  }

  static create(
    props: Omit<TutorProps, 'status' | 'createdAt' | 'updatedAt'>,
    id?: string
  ): Tutor {
    return new Tutor(
      {
        ...props,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    )
  }

  deactivate(): void {
    this.props.status = 'INACTIVE'
    this.props.updatedAt = new Date()
  }

  update(
    data: Partial<
      Pick<TutorProps, 'name' | 'phone' | 'whatsapp' | 'email' | 'cpf' | 'address' | 'notes'>
    >
  ): void {
    Object.assign(this.props, data, { updatedAt: new Date() })
  }
}
