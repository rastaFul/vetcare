import { Entity } from '@/shared/domain/Entity'

export type SessionStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export interface SessionProps {
  tenantId: string
  clientId: string
  serviceId?: string
  therapistId: string
  scheduledAt: Date
  status: SessionStatus
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  notes?: string
  priceCharged?: number
  googleCalendarEventId?: string
  returnDate?: Date
  createdAt: Date
  updatedAt: Date
}

export class Session extends Entity<SessionProps> {
  get tenantId() { return this.props.tenantId }
  get clientId() { return this.props.clientId }
  get serviceId() { return this.props.serviceId }
  get therapistId() { return this.props.therapistId }
  get scheduledAt() { return this.props.scheduledAt }
  get status() { return this.props.status }
  get notes() { return this.props.notes }
  get priceCharged() { return this.props.priceCharged }
  get googleCalendarEventId() { return this.props.googleCalendarEventId }
  get returnDate() { return this.props.returnDate }
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

  static create(props: Omit<SessionProps, 'status' | 'createdAt' | 'updatedAt'>, id?: string): Session {
    return new Session(
      { ...props, status: 'SCHEDULED', createdAt: new Date(), updatedAt: new Date() },
      id
    )
  }

  confirm(): void {
    if (this.props.status !== 'SCHEDULED') throw new Error('Session must be SCHEDULED to confirm')
    this.props.status = 'CONFIRMED'
    this.props.updatedAt = new Date()
  }

  complete(notes?: string, priceCharged?: number): void {
    if (this.props.status === 'CANCELLED') throw new Error('Cannot complete a cancelled session')
    this.props.status = 'COMPLETED'
    if (notes) this.props.notes = notes
    if (priceCharged !== undefined) this.props.priceCharged = priceCharged
    this.props.updatedAt = new Date()
  }

  cancel(): void {
    if (this.props.status === 'COMPLETED') throw new Error('Cannot cancel a completed session')
    this.props.status = 'CANCELLED'
    this.props.updatedAt = new Date()
  }

  reschedule(scheduledAt: Date): void {
    if (this.props.status === 'CANCELLED' || this.props.status === 'COMPLETED') {
      throw new Error('Cannot reschedule a cancelled or completed session')
    }
    this.props.scheduledAt = scheduledAt
    this.props.status = 'SCHEDULED'
    this.props.updatedAt = new Date()
  }

  setCalendarEventId(id: string): void {
    this.props.googleCalendarEventId = id
  }
}
