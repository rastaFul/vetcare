import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaAttachmentRepository } from '@/modules/documents/infrastructure/repositories/PrismaAttachmentRepository'
import { LocalStorageAdapter } from '@/modules/documents/infrastructure/storage/LocalStorageAdapter'
import { GetAttachment } from '@/modules/documents/application/use-cases/GetAttachment'

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
    const { downloadUrl } = await useCase.execute(id, session.tenantId)
    return NextResponse.redirect(downloadUrl)
  } catch (e) {
    return apiError(e)
  }
}
