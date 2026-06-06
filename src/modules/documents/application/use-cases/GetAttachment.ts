import { Attachment } from '../../domain/entities/Attachment'
import { IAttachmentRepository } from '../ports/IAttachmentRepository'
import { IStorageService } from '../ports/IStorageService'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class GetAttachment {
  constructor(
    private readonly attachmentRepo: IAttachmentRepository,
    private readonly storage: IStorageService
  ) {}

  async execute(id: string, tenantId: string): Promise<{ attachment: Attachment; downloadUrl: string }> {
    const attachment = await this.attachmentRepo.findById(id, tenantId)
    if (!attachment) throw new NotFoundError('Arquivo')
    const downloadUrl = await this.storage.getDownloadUrl(attachment.storageKey)
    return { attachment, downloadUrl }
  }
}
