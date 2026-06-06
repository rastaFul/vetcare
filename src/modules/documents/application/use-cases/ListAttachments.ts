import { Attachment } from '../../domain/entities/Attachment'
import { IAttachmentRepository, ListAttachmentsOptions } from '../ports/IAttachmentRepository'

export class ListAttachments {
  constructor(private readonly attachmentRepo: IAttachmentRepository) {}

  async execute(options: ListAttachmentsOptions): Promise<Attachment[]> {
    return this.attachmentRepo.list(options)
  }
}
