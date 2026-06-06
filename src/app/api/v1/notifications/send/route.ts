import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'
import { SendNotification } from '@/modules/notifications/application/use-cases/SendNotification'
import { PrismaNotificationLogRepository } from '@/modules/notifications/infrastructure/repositories/PrismaNotificationLogRepository'
import { EvolutionApiAdapter } from '@/modules/notifications/infrastructure/whatsapp/EvolutionApiAdapter'
import { ResendAdapter } from '@/modules/notifications/infrastructure/email/ResendAdapter'
import { INotificationService } from '@/modules/notifications/application/ports/INotificationService'

const SendNotificationSchema = z.object({
  tutorId: z.string(),
  animalId: z.string(),
  type: z.enum(['CONSULTATION_REMINDER', 'VACCINATION_REMINDER', 'RETURN_REMINDER', 'CUSTOM']),
  vars: z.object({
    date: z.string(),
    time: z.string().optional(),
    address: z.string().optional(),
    vaccine: z.string().optional(),
    vetName: z.string(),
  }),
  channel: z.enum(['WHATSAPP', 'EMAIL']).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const body = await req.json()
    const input = SendNotificationSchema.parse(body)

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
    })

    const whatsappAdapter: INotificationService | null =
      tenant?.evolutionApiUrl && tenant.evolutionApiKey && tenant.evolutionInstanceName
        ? new EvolutionApiAdapter(
            tenant.evolutionApiUrl,
            tenant.evolutionApiKey,
            tenant.evolutionInstanceName,
          )
        : null

    const emailAdapter: INotificationService | null =
      tenant?.resendApiKey && tenant.resendFromEmail
        ? new ResendAdapter(tenant.resendApiKey, tenant.resendFromEmail)
        : null

    const logRepo = new PrismaNotificationLogRepository()
    const useCase = new SendNotification(logRepo, whatsappAdapter, emailAdapter)

    const result = await useCase.execute({
      tenantId: session.tenantId,
      tutorId: input.tutorId,
      animalId: input.animalId,
      type: input.type,
      vars: input.vars,
      skipDuplication: true,
    })

    return apiSuccess({ status: result.status, channel: result.channel })
  } catch (e) {
    return apiError(e)
  }
}
