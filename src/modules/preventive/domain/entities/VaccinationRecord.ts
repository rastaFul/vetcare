import { Entity } from '@/shared/domain/Entity'

export interface VaccinationProps {
  tenantId: string
  animalId: string
  vaccine: string
  appliedAt: Date
  nextDoseAt?: Date
  batchNumber?: string
  manufacturer?: string
  observations?: string
  googleCalendarEventId?: string
  createdAt: Date
}

export class VaccinationRecord extends Entity<VaccinationProps> {
  get tenantId() { return this.props.tenantId }
  get animalId() { return this.props.animalId }
  get vaccine() { return this.props.vaccine }
  get appliedAt() { return this.props.appliedAt }
  get nextDoseAt() { return this.props.nextDoseAt }
  get batchNumber() { return this.props.batchNumber }
  get manufacturer() { return this.props.manufacturer }
  get observations() { return this.props.observations }
  get googleCalendarEventId() { return this.props.googleCalendarEventId }
  get createdAt() { return this.props.createdAt }

  static create(props: Omit<VaccinationProps, 'createdAt'>, id?: string): VaccinationRecord {
    return new VaccinationRecord({ ...props, createdAt: new Date() }, id)
  }

  setCalendarEventId(eventId: string): void {
    this.props.googleCalendarEventId = eventId
  }
}
