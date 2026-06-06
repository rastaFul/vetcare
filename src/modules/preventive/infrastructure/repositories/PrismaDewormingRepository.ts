import { prisma } from '@/lib/prisma'
import { IDewormingRepository } from '../../application/ports/IDewormingRepository'
import { DewormingRecord, DewormingProps } from '../../domain/entities/DewormingRecord'

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
}): DewormingRecord {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (DewormingRecord as any)(
    {
      tenantId: raw.tenantId,
      animalId: raw.animalId,
      medication: raw.medication,
      appliedAt: raw.appliedAt,
      nextApplicationAt: raw.nextApplicationAt ?? undefined,
      observations: raw.observations ?? undefined,
      googleCalendarEventId: raw.googleCalendarEventId ?? undefined,
      createdAt: raw.createdAt,
    } as DewormingProps,
    raw.id
  )
}

export class PrismaDewormingRepository implements IDewormingRepository {
  async save(record: DewormingRecord): Promise<void> {
    await prisma.dewormingRecord.upsert({
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

  async findById(id: string, tenantId?: string): Promise<DewormingRecord | null> {
    const where = tenantId ? { id, tenantId } : { id }
    const raw = await prisma.dewormingRecord.findFirst({ where })
    return raw ? toEntity(raw) : null
  }

  async findByAnimal(animalId: string, tenantId: string): Promise<DewormingRecord[]> {
    const rows = await prisma.dewormingRecord.findMany({
      where: { animalId, tenantId },
      orderBy: { appliedAt: 'desc' },
    })
    return rows.map(toEntity)
  }

  async delete(id: string): Promise<void> {
    await prisma.dewormingRecord.delete({ where: { id } })
  }

  async findUpcoming(tenantId: string, daysAhead: number): Promise<DewormingRecord[]> {
    const now = new Date()
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
    const rows = await prisma.dewormingRecord.findMany({
      where: {
        tenantId,
        nextApplicationAt: { gte: now, lte: future },
      },
      orderBy: { nextApplicationAt: 'asc' },
    })
    return rows.map(toEntity)
  }
}
