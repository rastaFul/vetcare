import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  crmv: z.string().optional(),
  specialty: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getAuthSession()
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, crmv: true, specialty: true, signatureUrl: true, image: true },
    })
    if (!user) throw new Error('Usuário não encontrado')
    return apiSuccess(user)
  } catch (e) {
    return apiError(e)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const body = await req.json()
    const input = UpdateProfileSchema.parse(body)
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: input,
      select: { id: true, name: true, email: true, crmv: true, specialty: true, signatureUrl: true },
    })
    return apiSuccess(user)
  } catch (e) {
    return apiError(e)
  }
}
