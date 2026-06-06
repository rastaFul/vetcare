import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return apiError(new Error('Arquivo não enviado'))
    }

    const ext = file.name.split('.').pop() ?? 'png'
    const filename = `${session.userId}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'signatures')
    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadDir, filename), buffer)

    const signatureUrl = `/uploads/signatures/${filename}`
    await prisma.user.update({
      where: { id: session.userId },
      data: { signatureUrl },
    })

    return apiSuccess({ signatureUrl })
  } catch (e) {
    return apiError(e)
  }
}
