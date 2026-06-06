import { Entity } from '@/shared/domain/Entity'

export type ConsultationStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export interface ConsultationAddress {
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
}

export interface ConsultationProps {
  tenantId: string
  animalId: string
  veterinarianId: string
  scheduledAt: Date
  address?: ConsultationAddress
  status: ConsultationStatus
  googleCalendarEventId?: string
  anamnesis?: string
  diagnosis?: string
  observations?: string
  returnDate?: Date
  returnEventId?: string
  createdAt: Date
  updatedAt: Date
}

export class Consultation extends Entity<ConsultationProps> {
  get tenantId() { return this.props.tenantId }
  get animalId() { return this.props.animalId }
  get veterinarianId() { return this.props.veterinarianId }
  get scheduledAt() { return this.props.scheduledAt }
  get address() { return this.props.address }
  get status() { return this.props.status }
  get googleCalendarEventId() { return this.props.googleCalendarEventId }
  get anamnesis() { return this.props.anamnesis }
  get diagnosis() { return this.props.diagnosis }
  get observations() { return this.props.observations }
  get returnDate() { return this.props.returnDate }
  get returnEventId() { return this.props.returnEventId }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  static create(props: Omit<ConsultationProps, 'status' | 'createdAt' | 'updatedAt'>, id?: string): Consultation {
    return new Consultation({
      ...props,
      status: 'SCHEDULED',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id)
  }

  confirm(): void {
    if (this.props.status !== 'SCHEDULED') {
      throw new Error(`Não é possível confirmar consulta com status ${this.props.status}`)
    }
    this.props.status = 'CONFIRMED'
    this.props.updatedAt = new Date()
  }

  complete(data: { anamnesis: string; diagnosis: string; observations?: string; returnDate?: Date }): void {
    if (this.props.status === 'CANCELLED') {
      throw new Error('Não é possível concluir consulta cancelada')
    }
    if (!data.anamnesis?.trim()) throw new Error('Anamnese é obrigatória')
    if (!data.diagnosis?.trim()) throw new Error('Diagnóstico é obrigatório')

    this.props.status = 'COMPLETED'
    this.props.anamnesis = data.anamnesis
    this.props.diagnosis = data.diagnosis
    this.props.observations = data.observations
    this.props.returnDate = data.returnDate
    this.props.updatedAt = new Date()
  }

  cancel(): void {
    if (this.props.status === 'COMPLETED') {
      throw new Error('Não é possível cancelar consulta concluída')
    }
    this.props.status = 'CANCELLED'
    this.props.updatedAt = new Date()
  }

  setCalendarEventId(eventId: string): void {
    this.props.googleCalendarEventId = eventId
    this.props.updatedAt = new Date()
  }

  setReturnEventId(eventId: string): void {
    this.props.returnEventId = eventId
    this.props.updatedAt = new Date()
  }

  reschedule(scheduledAt: Date, address?: ConsultationAddress): void {
    if (this.props.status === 'COMPLETED' || this.props.status === 'CANCELLED') {
      throw new Error('Não é possível reagendar consulta neste status')
    }
    this.props.scheduledAt = scheduledAt
    if (address) this.props.address = address
    this.props.updatedAt = new Date()
  }
}
