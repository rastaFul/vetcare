import { prisma } from '@/lib/prisma'
import { IVaccinationRepository } from '../../application/ports/IVaccinationRepository'
import { VaccinationRecord, VaccinationProps } from '../../domain/entities/VaccinationRecord'

function toEntity(raw: {
  id: string
  tenantId: string
  animalId: string
  vaccine: string
  appliedAt: Date
  nextDoseAt: Date | null
  batchNumber: string | null
  manufacturer: string | null
  observations: string | null
  googleCalendarEventId: string | null
  createdAt: Date
}): VaccinationRecord {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (VaccinationRecord as any)(
    {
      tenantId: raw.tenantId,
      animalId: raw.animalId,
      vaccine: raw.vaccine,
      appliedAt: raw.appliedAt,
      nextDoseAt: raw.nextDoseAt ?? undefined,
      batchNumber: raw.batchNumber ?? undefined,
      manufacturer: raw.manufacturer ?? undefined,
      observations: raw.observations ?? undefined,
      googleCalendarEventId: raw.googleCalendarEventId ?? undefined,
      createdAt: raw.createdAt,
    } as VaccinationProps,
    raw.id
  )
}

export class PrismaVaccinationRepository implements IVaccinationRepository {
  async save(record: VaccinationRecord): Promise<void> {
    await prisma.vaccinationRecord.upsert({
      where: { id: record.id },
      create: {
        id: record.id,
        tenantId: record.tenantId,
        animalId: record.animalId,
        vaccine: record.vaccine,
        appliedAt: record.appliedAt,
        nextDoseAt: record.nextDoseAt ?? null,
        batchNumber: record.batchNumber ?? null,
        manufacturer: record.manufacturer ?? null,
        observations: record.observations ?? null,
        googleCalendarEventId: record.googleCalendarEventId ?? null,
      },
      update: {
        vaccine: record.vaccine,
        appliedAt: record.appliedAt,
        nextDoseAt: record.nextDoseAt ?? null,
        batchNumber: record.batchNumber ?? null,
        manufacturer: record.manufacturer ?? null,
        observations: record.observations ?? null,
        googleCalendarEventId: record.googleCalendarEventId ?? null,
      },
    })
  }

  async findById(id: string, tenantId?: string): Promise<VaccinationRecord | null> {
    const where = tenantId ? { id, tenantId } : { id }
    const raw = await prisma.vaccinationRecord.findFirst({ where })
    return raw ? toEntity(raw) : null
  }

  async findByAnimal(animalId: string, tenantId: string): Promise<VaccinationRecord[]> {
    const rows = await prisma.vaccinationRecord.findMany({
      where: { animalId, tenantId },
      orderBy: { appliedAt: 'desc' },
    })
    return rows.map(toEntity)
  }

  async delete(id: string): Promise<void> {
    await prisma.vaccinationRecord.delete({ where: { id } })
  }

  async findUpcoming(tenantId: string, daysAhead: number): Promise<VaccinationRecord[]> {
    const now = new Date()
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
    const rows = await prisma.vaccinationRecord.findMany({
      where: {
        tenantId,
        nextDoseAt: { gte: now, lte: future },
      },
      orderBy: { nextDoseAt: 'asc' },
    })
    return rows.map(toEntity)
  }
}
