import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaSessionRepository } from '@/modules/scheduling/infrastructure/repositories/PrismaSessionRepository'
import { GetSession } from '@/modules/scheduling/application/use-cases/GetSession'
import { RescheduleSession } from '@/modules/scheduling/application/use-cases/RescheduleSession'
import { prisma } from '@/lib/prisma'
import { Session } from '@/modules/scheduling/domain/entities/Session'
import { z } from 'zod'

const sessionRepo = new PrismaSessionRepository()

const UpdateSessionSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  serviceId: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  returnDate: z.string().datetime().optional().nullable(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authSession = await getAuthSession()
    const { id } = await params

    const useCase = new GetSession(sessionRepo)
    const session = await useCase.execute(id, authSession.tenantId)

    // Enrich
    const [client, service] = await Promise.all([
      prisma.client.findFirst({ where: { id: session.clientId, tenantId: authSession.tenantId }, select: { id: true, name: true, phone: true, whatsapp: true, email: true } }),
      session.serviceId ? prisma.service.findFirst({ where: { id: session.serviceId, tenantId: authSession.tenantId }, select: { id: true, name: true, durationMin: true, price: true } }) : null,
    ])

    return apiSuccess({ ...sessionToDTO(session), client, service })
  } catch (e) {
    return apiError(e)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authSession = await getAuthSession()
    const { id } = await params
    const body = await req.json()
    const input = UpdateSessionSchema.parse(body)

    const session = await sessionRepo.findById(id, authSession.tenantId)
    if (!session) return apiError(new Error('Session not found'))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = session as any

    if (input.scheduledAt) {
      const reschedule = new RescheduleSession(sessionRepo)
      const updated = await reschedule.execute(id, authSession.tenantId, new Date(input.scheduledAt))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const u = updated as any
      if (input.notes !== undefined) u.props.notes = input.notes ?? undefined
      if (input.returnDate !== undefined) u.props.returnDate = input.returnDate ? new Date(input.returnDate) : undefined
      await sessionRepo.update(updated)
      return apiSuccess(sessionToDTO(updated))
    }

    // Non-schedule fields update
    if (input.notes !== undefined) s.props.notes = input.notes ?? undefined
    if (input.returnDate !== undefined) s.props.returnDate = input.returnDate ? new Date(input.returnDate) : undefined
    if (input.serviceId !== undefined) s.props.serviceId = input.serviceId ?? undefined
    s.props.updatedAt = new Date()
    await sessionRepo.update(session)

    return apiSuccess(sessionToDTO(session))
  } catch (e) {
    return apiError(e)
  }
}

function sessionToDTO(s: Session) {
  return {
    id: s.id,
    clientId: s.clientId,
    serviceId: s.serviceId,
    therapistId: s.therapistId,
    scheduledAt: s.scheduledAt.toISOString(),
    status: s.status,
    address: s.address,
    notes: s.notes,
    priceCharged: s.priceCharged,
    googleCalendarEventId: s.googleCalendarEventId,
    returnDate: s.returnDate?.toISOString(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }
}
