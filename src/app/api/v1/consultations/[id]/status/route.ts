import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaConsultationRepository } from '@/modules/clinical/infrastructure/repositories/PrismaConsultationRepository'
import { GoogleCalendarServiceAccountAdapter } from '@/modules/clinical/infrastructure/calendar/GoogleCalendarServiceAccountAdapter'
import { ConfirmConsultation } from '@/modules/clinical/application/use-cases/ConfirmConsultation'
import { CompleteConsultation } from '@/modules/clinical/application/use-cases/CompleteConsultation'
import { CancelConsultation } from '@/modules/clinical/application/use-cases/CancelConsultation'
import { CompleteConsultationSchema } from '@/modules/clinical/application/dtos/ConsultationDTO'
import { ValidationError } from '@/shared/infrastructure/errors'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const consultationRepo = new PrismaConsultationRepository()
const calendarService = new GoogleCalendarServiceAccountAdapter()

const StatusPatchSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('CONFIRMED') }),
  z.object({ status: z.literal('CANCELLED') }),
  CompleteConsultationSchema.extend({ status: z.literal('COMPLETED') }),
])

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params
    const body = await req.json()
    const input = StatusPatchSchema.parse(body)

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { googleCalendarId: true },
    })
    const calendarId = tenant?.googleCalendarId ?? undefined

    switch (input.status) {
      case 'CONFIRMED': {
        const useCase = new ConfirmConsultation(consultationRepo)
        await useCase.execute(id, session.tenantId)
        break
      }
      case 'COMPLETED': {
        const useCase = new CompleteConsultation(consultationRepo, calendarService)
        await useCase.execute(id, session.tenantId, {
          anamnesis: input.anamnesis,
          diagnosis: input.diagnosis,
          observations: input.observations,
          returnDate: input.returnDate,
          createReturnReminder: input.createReturnReminder,
        }, calendarId)
        break
      }
      case 'CANCELLED': {
        const useCase = new CancelConsultation(consultationRepo, calendarService)
        await useCase.execute(id, session.tenantId, calendarId)
        break
      }
      default:
        throw new ValidationError('Status inválido')
    }

    return apiSuccess({ message: 'Status atualizado com sucesso' })
  } catch (e) {
    return apiError(e)
  }
}
