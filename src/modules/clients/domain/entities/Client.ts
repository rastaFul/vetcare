import { Entity } from '@/shared/domain/Entity'

export type ClientStatus = 'ACTIVE' | 'INACTIVE'

export interface ClientProps {
  tenantId: string
  name: string
  phone: string
  whatsapp?: string
  email?: string
  birthDate?: Date
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  notes?: string
  status: ClientStatus
  notifyWhatsApp: boolean
  notifyEmail: boolean
  notifySession: boolean
  createdAt: Date
  updatedAt: Date
}

export class Client extends Entity<ClientProps> {
  get tenantId() { return this.props.tenantId }
  get name() { return this.props.name }
  get phone() { return this.props.phone }
  get whatsapp() { return this.props.whatsapp }
  get email() { return this.props.email }
  get birthDate() { return this.props.birthDate }
  get notes() { return this.props.notes }
  get status() { return this.props.status }
  get notifyWhatsApp() { return this.props.notifyWhatsApp }
  get notifyEmail() { return this.props.notifyEmail }
  get notifySession() { return this.props.notifySession }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  get street() { return this.props.street }
  get number() { return this.props.number }
  get complement() { return this.props.complement }
  get neighborhood() { return this.props.neighborhood }
  get city() { return this.props.city }
  get state() { return this.props.state }
  get zipCode() { return this.props.zipCode }

  get address() {
    return {
      street: this.props.street,
      number: this.props.number,
      complement: this.props.complement,
      neighborhood: this.props.neighborhood,
      city: this.props.city,
      state: this.props.state,
      zipCode: this.props.zipCode,
    }
  }

  static create(
    props: Omit<ClientProps, 'status' | 'notifyWhatsApp' | 'notifyEmail' | 'notifySession' | 'createdAt' | 'updatedAt'>,
    id?: string
  ): Client {
    return new Client(
      {
        ...props,
        status: 'ACTIVE',
        notifyWhatsApp: true,
        notifyEmail: false,
        notifySession: true,
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

  activate(): void {
    this.props.status = 'ACTIVE'
    this.props.updatedAt = new Date()
  }
}
