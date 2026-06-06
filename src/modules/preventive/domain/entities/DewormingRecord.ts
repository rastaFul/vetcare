import { Entity } from '@/shared/domain/Entity'

export interface DewormingProps {
  tenantId: string
  animalId: string
  medication: string
  appliedAt: Date
  nextApplicationAt?: Date
  observations?: string
  googleCalendarEventId?: string
  createdAt: Date
}

export class DewormingRecord extends Entity<DewormingProps> {
  get tenantId() { return this.props.tenantId }
  get animalId() { return this.props.animalId }
  get medication() { return this.props.medication }
  get appliedAt() { return this.props.appliedAt }
  get nextApplicationAt() { return this.props.nextApplicationAt }
  get observations() { return this.props.observations }
  get googleCalendarEventId() { return this.props.googleCalendarEventId }
  get createdAt() { return this.props.createdAt }

  static create(props: Omit<DewormingProps, 'createdAt'>, id?: string): DewormingRecord {
    return new DewormingRecord({ ...props, createdAt: new Date() }, id)
  }

  setCalendarEventId(eventId: string): void {
    this.props.googleCalendarEventId = eventId
  }
}
