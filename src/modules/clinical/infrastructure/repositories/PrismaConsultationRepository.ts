import { prisma } from '@/lib/prisma'
import { IConsultationRepository, ListConsultationsOptions } from '../../application/ports/IConsultationRepository'
import { Consultation, ConsultationProps, ConsultationStatus } from '../../domain/entities/Consultation'

function toEntity(raw: {
  id: string
  tenantId: string
  animalId: string
  veterinarianId: string
  scheduledAt: Date
  street: string | null
  number: string | null
  complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  status: string
  googleCalendarEventId: string | null
  anamnesis: string | null
  diagnosis: string | null
  observations: string | null
  returnDate: Date | null
  returnEventId: string | null
  createdAt: Date
  updatedAt: Date
}): Consultation {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (Consultation as any)(
    {
      tenantId: raw.tenantId,
      animalId: raw.animalId,
      veterinarianId: raw.veterinarianId,
      scheduledAt: raw.scheduledAt,
      address: {
        street: raw.street ?? undefined,
        number: raw.number ?? undefined,
        complement: raw.complement ?? undefined,
        neighborhood: raw.neighborhood ?? undefined,
        city: raw.city ?? undefined,
        state: raw.state ?? undefined,
        zipCode: raw.zipCode ?? undefined,
      },
      status: raw.status as ConsultationStatus,
      googleCalendarEventId: raw.googleCalendarEventId ?? undefined,
      anamnesis: raw.anamnesis ?? undefined,
      diagnosis: raw.diagnosis ?? undefined,
      observations: raw.observations ?? undefined,
      returnDate: raw.returnDate ?? undefined,
      returnEventId: raw.returnEventId ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    } as ConsultationProps,
    raw.id
  )
}

export class PrismaConsultationRepository implements IConsultationRepository {
  async save(consultation: Consultation): Promise<void> {
    await prisma.consultation.create({
      data: {
        id: consultation.id,
        tenantId: consultation.tenantId,
        animalId: consultation.animalId,
        veterinarianId: consultation.veterinarianId,
        scheduledAt: consultation.scheduledAt,
        street: consultation.address?.street ?? null,
        number: consultation.address?.number ?? null,
        complement: consultation.address?.complement ?? null,
        neighborhood: consultation.address?.neighborhood ?? null,
        city: consultation.address?.city ?? null,
        state: consultation.address?.state ?? null,
        zipCode: consultation.address?.zipCode ?? null,
        status: consultation.status,
        googleCalendarEventId: consultation.googleCalendarEventId ?? null,
        anamnesis: consultation.anamnesis ?? null,
        diagnosis: consultation.diagnosis ?? null,
        observations: consultation.observations ?? null,
        returnDate: consultation.returnDate ?? null,
        returnEventId: consultation.returnEventId ?? null,
      },
    })
  }

  async findById(id: string, tenantId: string): Promise<Consultation | null> {
    const raw = await prisma.consultation.findFirst({ where: { id, tenantId } })
    return raw ? toEntity(raw) : null
  }

  async list({
    tenantId,
    animalId,
    veterinarianId,
    status,
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 20,
  }: ListConsultationsOptions): Promise<{ consultations: Consultation[]; total: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { tenantId }
    if (animalId) where.animalId = animalId
    if (veterinarianId) where.veterinarianId = veterinarianId
    if (status) where.status = status
    if (dateFrom || dateTo) {
      where.scheduledAt = {}
      if (dateFrom) where.scheduledAt.gte = dateFrom
      if (dateTo) where.scheduledAt.lte = dateTo
    }

    const [total, rows] = await Promise.all([
      prisma.consultation.count({ where }),
      prisma.consultation.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { scheduledAt: 'desc' },
      }),
    ])

    return { consultations: rows.map(toEntity), total }
  }

  async update(consultation: Consultation): Promise<void> {
    await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        scheduledAt: consultation.scheduledAt,
        street: consultation.address?.street ?? null,
        number: consultation.address?.number ?? null,
        complement: consultation.address?.complement ?? null,
        neighborhood: consultation.address?.neighborhood ?? null,
        city: consultation.address?.city ?? null,
        state: consultation.address?.state ?? null,
        zipCode: consultation.address?.zipCode ?? null,
        status: consultation.status,
        googleCalendarEventId: consultation.googleCalendarEventId ?? null,
        anamnesis: consultation.anamnesis ?? null,
        diagnosis: consultation.diagnosis ?? null,
        observations: consultation.observations ?? null,
        returnDate: consultation.returnDate ?? null,
        returnEventId: consultation.returnEventId ?? null,
        updatedAt: new Date(),
      },
    })
  }

  async findTodayConsultations(tenantId: string, veterinarianId: string): Promise<Consultation[]> {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    const rows = await prisma.consultation.findMany({
      where: {
        tenantId,
        veterinarianId,
        scheduledAt: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    return rows.map(toEntity)
  }

  async findUpcomingReturns(tenantId: string, daysAhead: number): Promise<Consultation[]> {
    const now = new Date()
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)

    const rows = await prisma.consultation.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        returnDate: { gte: now, lte: future },
      },
      orderBy: { returnDate: 'asc' },
    })

    return rows.map(toEntity)
  }
}
