import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { withMetrics } from '@/lib/with-metrics'


const UpdateProfessionSchema = z.object({
  professionType: z.enum(['VETERINARIAN', 'MASSAGE_THERAPIST']),
  professionalRegLabel: z.string().optional(),
})

async function GET_impl() {
  try {
    const session = await getAuthSession()

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { professionType: true, professionalRegLabel: true },
    })

    return apiSuccess(tenant)
  } catch (e) {
    return apiError(e)
  }
}
export const GET = withMetrics("/api/v1/settings/profession", GET_impl)


async function PUT_impl(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const body = await req.json()
    const input = UpdateProfessionSchema.parse(body)

    const tenant = await prisma.tenant.update({
      where: { id: session.tenantId },
      data: {
        professionType: input.professionType,
        professionalRegLabel: input.professionalRegLabel ?? null,
      },
      select: { professionType: true, professionalRegLabel: true },
    })

    return apiSuccess(tenant)
  } catch (e) {
    return apiError(e)
  }
}
export const PUT = withMetrics("/api/v1/settings/profession", PUT_impl)

