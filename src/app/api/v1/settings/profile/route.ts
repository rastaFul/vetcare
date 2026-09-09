import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { withMetrics } from '@/lib/with-metrics'


const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  crmv: z.string().optional(),
  specialty: z.string().optional(),
})

async function GET_impl() {
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
export const GET = withMetrics("/api/v1/settings/profile", GET_impl)


async function PUT_impl(req: NextRequest) {
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
export const PUT = withMetrics("/api/v1/settings/profile", PUT_impl)

