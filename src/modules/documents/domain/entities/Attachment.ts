import { Entity } from '@/shared/domain/Entity'

export type AttachmentType = 'EXAM' | 'PHOTO' | 'REPORT' | 'EXTERNAL_PRESCRIPTION' | 'OTHER'

export interface AttachmentProps {
  tenantId: string
  animalId: string
  consultationId?: string
  type: AttachmentType
  name: string
  storageKey: string
  mimeType: string
  sizeBytes: number
  uploadedById: string
  createdAt: Date
}

export class Attachment extends Entity<AttachmentProps> {
  get tenantId() { return this.props.tenantId }
  get animalId() { return this.props.animalId }
  get consultationId() { return this.props.consultationId }
  get type() { return this.props.type }
  get name() { return this.props.name }
  get storageKey() { return this.props.storageKey }
  get mimeType() { return this.props.mimeType }
  get sizeBytes() { return this.props.sizeBytes }
  get uploadedById() { return this.props.uploadedById }
  get createdAt() { return this.props.createdAt }

  static create(props: Omit<AttachmentProps, 'createdAt'>, id?: string): Attachment {
    return new Attachment({ ...props, createdAt: new Date() }, id)
  }

  get isImage() { return this.props.mimeType.startsWith('image/') }
  get isPdf() { return this.props.mimeType === 'application/pdf' }

  get fileSizeFormatted(): string {
    const b = this.props.sizeBytes
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / (1024 * 1024)).toFixed(1)} MB`
  }
}
