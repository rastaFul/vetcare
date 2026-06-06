import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'

const UpdateNotificationSettingsSchema = z.object({
  evolutionApiUrl: z.string().optional(),
  evolutionApiKey: z.string().optional(),
  evolutionInstanceName: z.string().optional(),
  resendApiKey: z.string().optional(),
  resendFromEmail: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getAuthSession()

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: {
        evolutionApiUrl: true,
        evolutionApiKey: true,
        evolutionInstanceName: true,
        resendApiKey: true,
        resendFromEmail: true,
      },
    })

    return apiSuccess({
      evolutionApiUrl: tenant?.evolutionApiUrl ?? null,
      evolutionApiKey: tenant?.evolutionApiKey ?? null,
      evolutionInstanceName: tenant?.evolutionInstanceName ?? null,
      resendApiKey: tenant?.resendApiKey ?? null,
      resendFromEmail: tenant?.resendFromEmail ?? null,
    })
  } catch (e) {
    return apiError(e)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const body = await req.json()
    const input = UpdateNotificationSettingsSchema.parse(body)

    await prisma.tenant.update({
      where: { id: session.tenantId },
      data: { ...input },
    })

    return apiSuccess({ updated: true })
  } catch (e) {
    return apiError(e)
  }
}
