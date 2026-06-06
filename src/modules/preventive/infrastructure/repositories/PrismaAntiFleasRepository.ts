import { prisma } from '@/lib/prisma'
import { IAntiFleasRepository } from '../../application/ports/IAntiFleasRepository'
import { AntiFleasRecord, AntiFleasProps } from '../../domain/entities/AntiFleasRecord'

function toEntity(raw: {
  id: string
  tenantId: string
  animalId: string
  medication: string
  appliedAt: Date
  nextApplicationAt: Date | null
  observations: string | null
  googleCalendarEventId: string | null
  createdAt: Date
}): AntiFleasRecord {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (AntiFleasRecord as any)(
    {
      tenantId: raw.tenantId,
      animalId: raw.animalId,
      medication: raw.medication,
      appliedAt: raw.appliedAt,
      nextApplicationAt: raw.nextApplicationAt ?? undefined,
      observations: raw.observations ?? undefined,
      googleCalendarEventId: raw.googleCalendarEventId ?? undefined,
      createdAt: raw.createdAt,
    } as AntiFleasProps,
    raw.id
  )
}

export class PrismaAntiFleasRepository implements IAntiFleasRepository {
  async save(record: AntiFleasRecord): Promise<void> {
    await prisma.antiFleasRecord.upsert({
      where: { id: record.id },
      create: {
        id: record.id,
        tenantId: record.tenantId,
        animalId: record.animalId,
        medication: record.medication,
        appliedAt: record.appliedAt,
        nextApplicationAt: record.nextApplicationAt ?? null,
        observations: record.observations ?? null,
        googleCalendarEventId: record.googleCalendarEventId ?? null,
      },
      update: {
        medication: record.medication,
        appliedAt: record.appliedAt,
        nextApplicationAt: record.nextApplicationAt ?? null,
        observations: record.observations ?? null,
        googleCalendarEventId: record.googleCalendarEventId ?? null,
      },
    })
  }

  async findById(id: string, tenantId?: string): Promise<AntiFleasRecord | null> {
    const where = tenantId ? { id, tenantId } : { id }
    const raw = await prisma.antiFleasRecord.findFirst({ where })
    return raw ? toEntity(raw) : null
  }

  async findByAnimal(animalId: string, tenantId: string): Promise<AntiFleasRecord[]> {
    const rows = await prisma.antiFleasRecord.findMany({
      where: { animalId, tenantId },
      orderBy: { appliedAt: 'desc' },
    })
    return rows.map(toEntity)
  }

  async delete(id: string): Promise<void> {
    await prisma.antiFleasRecord.delete({ where: { id } })
  }

  async findUpcoming(tenantId: string, daysAhead: number): Promise<AntiFleasRecord[]> {
    const now = new Date()
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
    const rows = await prisma.antiFleasRecord.findMany({
      where: {
        tenantId,
        nextApplicationAt: { gte: now, lte: future },
      },
      orderBy: { nextApplicationAt: 'asc' },
    })
    return rows.map(toEntity)
  }
}
