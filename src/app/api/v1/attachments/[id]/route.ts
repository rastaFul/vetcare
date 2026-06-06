import { NextRequest, NextResponse } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaAttachmentRepository } from '@/modules/documents/infrastructure/repositories/PrismaAttachmentRepository'
import { LocalStorageAdapter } from '@/modules/documents/infrastructure/storage/LocalStorageAdapter'
import { GetAttachment } from '@/modules/documents/application/use-cases/GetAttachment'
import { DeleteAttachment } from '@/modules/documents/application/use-cases/DeleteAttachment'
import { Attachment } from '@/modules/documents/domain/entities/Attachment'

const attachmentRepo = new PrismaAttachmentRepository()
const storage = new LocalStorageAdapter()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getAuthSession()
    const useCase = new GetAttachment(attachmentRepo, storage)
    const { attachment, downloadUrl } = await useCase.execute(id, session.tenantId)
    return apiSuccess({ ...attachmentToDTO(attachment), downloadUrl })
  } catch (e) {
    return apiError(e)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getAuthSession()
    const useCase = new DeleteAttachment(attachmentRepo, storage)
    await useCase.execute(id, session.tenantId)
    return new NextResponse(null, { status: 204 })
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
