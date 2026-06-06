import { prisma } from '@/lib/prisma'
import { IAttachmentRepository, ListAttachmentsOptions } from '../../application/ports/IAttachmentRepository'
import { Attachment, AttachmentProps, AttachmentType } from '../../domain/entities/Attachment'

type PrismaAttachment = {
  id: string
  tenantId: string
  animalId: string
  consultationId: string | null
  type: string
  name: string
  storageKey: string
  mimeType: string
  sizeBytes: number
  uploadedById: string
  createdAt: Date
}

function toEntity(raw: PrismaAttachment): Attachment {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (Attachment as any)(
    {
      tenantId: raw.tenantId,
      animalId: raw.animalId,
      consultationId: raw.consultationId ?? undefined,
      type: raw.type as AttachmentType,
      name: raw.name,
      storageKey: raw.storageKey,
      mimeType: raw.mimeType,
      sizeBytes: raw.sizeBytes,
      uploadedById: raw.uploadedById,
      createdAt: raw.createdAt,
    } as AttachmentProps,
    raw.id
  )
}

export class PrismaAttachmentRepository implements IAttachmentRepository {
  async save(attachment: Attachment): Promise<void> {
    await prisma.attachment.create({
      data: {
        id: attachment.id,
        tenantId: attachment.tenantId,
        animalId: attachment.animalId,
        consultationId: attachment.consultationId ?? null,
        type: attachment.type,
        name: attachment.name,
        storageKey: attachment.storageKey,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
        uploadedById: attachment.uploadedById,
      },
    })
  }

  async findById(id: string, tenantId: string): Promise<Attachment | null> {
    const raw = await prisma.attachment.findFirst({ where: { id, tenantId } })
    return raw ? toEntity(raw) : null
  }

  async list({ animalId, tenantId, consultationId, type }: ListAttachmentsOptions): Promise<Attachment[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { animalId, tenantId }
    if (consultationId) where.consultationId = consultationId
    if (type) where.type = type

    const rows = await prisma.attachment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toEntity)
  }

  async delete(id: string): Promise<void> {
    await prisma.attachment.delete({ where: { id } })
  }
}
