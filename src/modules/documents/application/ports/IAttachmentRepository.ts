import { Attachment } from '../../domain/entities/Attachment'

export interface ListAttachmentsOptions {
  animalId: string
  tenantId: string
  consultationId?: string
  type?: string
}

export interface IAttachmentRepository {
  save(attachment: Attachment): Promise<void>
  findById(id: string, tenantId: string): Promise<Attachment | null>
  list(options: ListAttachmentsOptions): Promise<Attachment[]>
  delete(id: string): Promise<void>
}
