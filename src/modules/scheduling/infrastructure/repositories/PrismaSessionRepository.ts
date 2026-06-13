import { prisma } from '@/lib/prisma'
import { ISessionRepository, ListSessionsInput } from '../../application/ports/ISessionRepository'
import { Session, SessionProps, SessionStatus } from '../../domain/entities/Session'

function toEntity(raw: {
  id: string; tenantId: string; clientId: string; serviceId: string | null
  therapistId: string; scheduledAt: Date; status: string
  street: string | null; number: string | null; complement: string | null
  neighborhood: string | null; city: string | null; state: string | null; zipCode: string | null
  notes: string | null; priceCharged: { toNumber(): number } | null
  googleCalendarEventId: string | null; returnDate: Date | null
  createdAt: Date; updatedAt: Date
}): Session {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (Session as any)(
    {
      tenantId: raw.tenantId,
      clientId: raw.clientId,
      serviceId: raw.serviceId ?? undefined,
      therapistId: raw.therapistId,
      scheduledAt: raw.scheduledAt,
      status: raw.status as SessionStatus,
      street: raw.street ?? undefined,
      number: raw.number ?? undefined,
      complement: raw.complement ?? undefined,
      neighborhood: raw.neighborhood ?? undefined,
      city: raw.city ?? undefined,
      state: raw.state ?? undefined,
      zipCode: raw.zipCode ?? undefined,
      notes: raw.notes ?? undefined,
      priceCharged: raw.priceCharged ? raw.priceCharged.toNumber() : undefined,
      googleCalendarEventId: raw.googleCalendarEventId ?? undefined,
      returnDate: raw.returnDate ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    } as SessionProps,
    raw.id
  )
}

export class PrismaSessionRepository implements ISessionRepository {
  async save(session: Session): Promise<void> {
    await prisma.appSession.create({
      data: {
        id: session.id,
        tenantId: session.tenantId,
        clientId: session.clientId,
        serviceId: session.serviceId ?? null,
        therapistId: session.therapistId,
        scheduledAt: session.scheduledAt,
        status: session.status,
        street: session.street ?? null,
        number: session.number ?? null,
        complement: session.complement ?? null,
        neighborhood: session.neighborhood ?? null,
        city: session.city ?? null,
        state: session.state ?? null,
        zipCode: session.zipCode ?? null,
        notes: session.notes ?? null,
        priceCharged: session.priceCharged ?? null,
        googleCalendarEventId: session.googleCalendarEventId ?? null,
        returnDate: session.returnDate ?? null,
      },
    })
  }

  async findById(id: string, tenantId: string): Promise<Session | null> {
    const raw = await prisma.appSession.findFirst({ where: { id, tenantId } })
    return raw ? toEntity(raw) : null
  }

  async list({ tenantId, clientId, status, dateFrom, dateTo, page = 1, pageSize = 20 }: ListSessionsInput): Promise<{ sessions: Session[]; total: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { tenantId }
    if (clientId) where.clientId = clientId
    if (status) where.status = status
    if (dateFrom || dateTo) {
      where.scheduledAt = {}
      if (dateFrom) where.scheduledAt.gte = dateFrom
      if (dateTo) where.scheduledAt.lte = dateTo
    }

    const [total, rows] = await Promise.all([
      prisma.appSession.count({ where }),
      prisma.appSession.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { scheduledAt: 'desc' },
      }),
    ])

    return { sessions: rows.map(toEntity), total }
  }

  async update(session: Session): Promise<void> {
    await prisma.appSession.update({
      where: { id: session.id },
      data: {
        clientId: session.clientId,
        serviceId: session.serviceId ?? null,
        scheduledAt: session.scheduledAt,
        status: session.status,
        street: session.street ?? null,
        number: session.number ?? null,
        complement: session.complement ?? null,
        neighborhood: session.neighborhood ?? null,
        city: session.city ?? null,
        state: session.state ?? null,
        zipCode: session.zipCode ?? null,
        notes: session.notes ?? null,
        priceCharged: session.priceCharged ?? null,
        googleCalendarEventId: session.googleCalendarEventId ?? null,
        returnDate: session.returnDate ?? null,
        updatedAt: new Date(),
      },
    })
  }

  async findUpcoming(tenantId: string, hoursAhead: number): Promise<Session[]> {
    const now = new Date()
    const from = new Date(now.getTime() + (hoursAhead - 1) * 60 * 60 * 1000)
    const to = new Date(now.getTime() + (hoursAhead + 1) * 60 * 60 * 1000)

    const rows = await prisma.appSession.findMany({
      where: {
        tenantId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gte: from, lte: to },
      },
    })

    return rows.map(toEntity)
  }
}
