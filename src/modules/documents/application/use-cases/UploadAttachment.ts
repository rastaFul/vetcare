import { Attachment } from '../../domain/entities/Attachment'
import { IAttachmentRepository } from '../ports/IAttachmentRepository'
import { IStorageService } from '../ports/IStorageService'
import { IAnimalRepository } from '@/modules/patients/application/ports/IAnimalRepository'
import { UploadAttachmentInput, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '../dtos/AttachmentDTO'
import { NotFoundError, ValidationError } from '@/shared/infrastructure/errors'

export interface FileInput {
  buffer: Buffer
  originalName: string
  mimeType: string
  size: number
}

export class UploadAttachment {
  constructor(
    private readonly attachmentRepo: IAttachmentRepository,
    private readonly animalRepo: IAnimalRepository,
    private readonly storage: IStorageService
  ) {}

  async execute(
    tenantId: string,
    uploadedById: string,
    input: UploadAttachmentInput,
    file: FileInput
  ): Promise<Attachment> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
      throw new ValidationError(`Tipo de arquivo não suportado: ${file.mimeType}`)
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError('Arquivo muito grande. Tamanho máximo: 10MB')
    }

    const animal = await this.animalRepo.findById(input.animalId, tenantId)
    if (!animal) throw new NotFoundError('Animal')

    const ext = file.originalName.split('.').pop() ?? 'bin'
    const key = `att/${tenantId}/${input.animalId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { storageKey } = await this.storage.upload(file.buffer, key, file.mimeType)

    const attachment = Attachment.create({
      tenantId,
      animalId: input.animalId,
      consultationId: input.consultationId,
      type: input.type,
      name: file.originalName,
      storageKey,
      mimeType: file.mimeType,
      sizeBytes: file.size,
      uploadedById,
    })

    await this.attachmentRepo.save(attachment)
    return attachment
  }
}
