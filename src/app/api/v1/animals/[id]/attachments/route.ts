import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaAttachmentRepository } from '@/modules/documents/infrastructure/repositories/PrismaAttachmentRepository'
import { PrismaAnimalRepository } from '@/modules/patients/infrastructure/repositories/PrismaAnimalRepository'
import { LocalStorageAdapter } from '@/modules/documents/infrastructure/storage/LocalStorageAdapter'
import { UploadAttachment } from '@/modules/documents/application/use-cases/UploadAttachment'
import { ListAttachments } from '@/modules/documents/application/use-cases/ListAttachments'
import { UploadAttachmentSchema } from '@/modules/documents/application/dtos/AttachmentDTO'
import { ValidationError } from '@/shared/infrastructure/errors'
import { Attachment } from '@/modules/documents/domain/entities/Attachment'

const attachmentRepo = new PrismaAttachmentRepository()
const animalRepo = new PrismaAnimalRepository()
const storage = new LocalStorageAdapter()

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: animalId } = await params
    const session = await getAuthSession()
    const { searchParams } = new URL(req.url)

    const useCase = new ListAttachments(attachmentRepo)
    const attachments = await useCase.execute({
      animalId,
      tenantId: session.tenantId,
      consultationId: searchParams.get('consultationId') ?? undefined,
      type: searchParams.get('type') ?? undefined,
    })
    return apiSuccess(attachments.map(attachmentToDTO))
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: animalId } = await params
    const session = await getAuthSession()
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) throw new ValidationError('Arquivo é obrigatório')

    const buffer = Buffer.from(await file.arrayBuffer())
    const input = UploadAttachmentSchema.parse({
      animalId,
      consultationId: formData.get('consultationId') ?? undefined,
      type: formData.get('type') ?? 'OTHER',
    })

    const useCase = new UploadAttachment(attachmentRepo, animalRepo, storage)
    const attachment = await useCase.execute(session.tenantId, session.userId, input, {
      buffer,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    })

    return apiSuccess(attachmentToDTO(attachment), 201)
  } catch (e) {
    return apiError(e)
  }
}

function attachmentToDTO(attachment: Attachment) {
  return {
    id: attachment.id,
    tenantId: attachment.tenantId,
    animalId: attachment.animalId,
    consultationId: attachment.consultationId,
    type: attachment.type,
    name: attachment.name,
    storageKey: attachment.storageKey,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
    fileSizeFormatted: attachment.fileSizeFormatted,
    isImage: attachment.isImage,
    isPdf: attachment.isPdf,
    uploadedById: attachment.uploadedById,
    createdAt: attachment.createdAt.toISOString(),
  }
}
