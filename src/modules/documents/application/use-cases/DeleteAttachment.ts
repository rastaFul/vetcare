import { IAttachmentRepository } from '../ports/IAttachmentRepository'
import { IStorageService } from '../ports/IStorageService'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class DeleteAttachment {
  constructor(
    private readonly attachmentRepo: IAttachmentRepository,
    private readonly storage: IStorageService
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const attachment = await this.attachmentRepo.findById(id, tenantId)
    if (!attachment) throw new NotFoundError('Arquivo')
    await this.storage.delete(attachment.storageKey)
    await this.attachmentRepo.delete(id)
  }
}
