import { Entity } from '@/shared/domain/Entity'

export interface PrescriptionItem {
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

export interface PrescriptionProps {
  tenantId: string
  consultationId: string
  animalId: string
  veterinarianId: string
  diagnosis: string
  observations?: string
  items: PrescriptionItem[]
  pdfUrl?: string
  pdfGeneratedAt?: Date
  createdAt: Date
}

export class Prescription extends Entity<PrescriptionProps> {
  get tenantId() { return this.props.tenantId }
  get consultationId() { return this.props.consultationId }
  get animalId() { return this.props.animalId }
  get veterinarianId() { return this.props.veterinarianId }
  get diagnosis() { return this.props.diagnosis }
  get observations() { return this.props.observations }
  get items() { return this.props.items }
  get pdfUrl() { return this.props.pdfUrl }
  get pdfGeneratedAt() { return this.props.pdfGeneratedAt }
  get createdAt() { return this.props.createdAt }

  static create(props: Omit<PrescriptionProps, 'createdAt'>, id?: string): Prescription {
    if (!props.items || props.items.length === 0) {
      throw new Error('Receita deve ter pelo menos um item')
    }
    return new Prescription({ ...props, createdAt: new Date() }, id)
  }

  setPdfUrl(url: string): void {
    this.props.pdfUrl = url
    this.props.pdfGeneratedAt = new Date()
  }
}
