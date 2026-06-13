import { NextRequest } from 'next/server'
import { apiSuccess, apiList, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaSessionRepository } from '@/modules/scheduling/infrastructure/repositories/PrismaSessionRepository'
import { PrismaServiceRepository } from '@/modules/services/infrastructure/repositories/PrismaServiceRepository'
import { ScheduleSession } from '@/modules/scheduling/application/use-cases/ScheduleSession'
import { ListSessions } from '@/modules/scheduling/application/use-cases/ListSessions'
import { ScheduleSessionSchema } from '@/modules/scheduling/application/dtos/SessionDTO'
import { prisma } from '@/lib/prisma'
import { Session } from '@/modules/scheduling/domain/entities/Session'

const sessionRepo = new PrismaSessionRepository()
const serviceRepo = new PrismaServiceRepository()

export async function GET(req: NextRequest) {
  try {
    const authSession = await getAuthSession()
    const { searchParams } = new URL(req.url)

    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined

    const useCase = new ListSessions(sessionRepo)
    const result = await useCase.execute({
      tenantId: authSession.tenantId,
      clientId: searchParams.get('clientId') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      dateFrom,
      dateTo,
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 20),
    })

    // Enrich with client + service names
    const enriched = await enrichSessions(result.sessions, authSession.tenantId)

    return apiList(enriched, {
      total: result.total,
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 20),
    })
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const authSession = await getAuthSession()
    const body = await req.json()
    const input = ScheduleSessionSchema.parse(body)

    const useCase = new ScheduleSession(sessionRepo, serviceRepo, null, prisma)
    const session = await useCase.execute({
      tenantId: authSession.tenantId,
      therapistId: authSession.userId,
      ...input,
      scheduledAt: new Date(input.scheduledAt),
      serviceId: input.serviceId || undefined,
    })

    return apiSuccess(sessionToDTO(session), 201)
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

async function enrichSessions(sessions: Session[], tenantId: string) {
  if (sessions.length === 0) return []

  const clientIds = [...new Set(sessions.map((s) => s.clientId))]
  const serviceIds = [...new Set(sessions.map((s) => s.serviceId).filter(Boolean) as string[])]

  const [clients, services] = await Promise.all([
    prisma.client.findMany({ where: { id: { in: clientIds }, tenantId }, select: { id: true, name: true, phone: true } }),
    serviceIds.length ? prisma.service.findMany({ where: { id: { in: serviceIds }, tenantId }, select: { id: true, name: true, durationMin: true } }) : [],
  ])

  const clientMap = new Map(clients.map((c) => [c.id, c]))
  const serviceMap = new Map(services.map((s) => [s.id, s]))

  return sessions.map((s) => ({
    ...sessionToDTO(s),
    client: clientMap.get(s.clientId) ?? null,
    service: s.serviceId ? serviceMap.get(s.serviceId) ?? null : null,
  }))
}
