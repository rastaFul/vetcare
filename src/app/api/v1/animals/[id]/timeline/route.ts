import { NextRequest } from 'next/server'
import { apiError } from '@/shared/infrastructure/api-response'
import { NextResponse } from 'next/server'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'
import { NotFoundError } from '@/shared/infrastructure/errors'

interface TimelineEntry {
  id: string
  type: 'CONSULTATION' | 'VACCINATION' | 'DEWORMING' | 'ANTI_FLEAS' | 'PRESCRIPTION' | 'ATTACHMENT'
  date: string
  title: string
  summary?: string
  metadata?: Record<string, unknown>
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id: animalId } = await params
    const { searchParams } = new URL(req.url)

    const typeFilter = searchParams.get('type') ?? undefined
    const page = Number(searchParams.get('page') ?? 1)
    const pageSize = Number(searchParams.get('pageSize') ?? 20)

    // Verify animal belongs to tenant
    const animal = await prisma.animal.findFirst({ where: { id: animalId, tenantId: session.tenantId } })
    if (!animal) throw new NotFoundError('Animal')

    const entries: TimelineEntry[] = []

    const validTypes = ['CONSULTATION', 'VACCINATION', 'DEWORMING', 'ANTI_FLEAS', 'PRESCRIPTION', 'ATTACHMENT']
    const shouldInclude = (type: string) => !typeFilter || typeFilter === type

    if (shouldInclude('CONSULTATION') && (!typeFilter || validTypes.includes(typeFilter))) {
      const consultations = await prisma.consultation.findMany({
        where: { animalId, tenantId: session.tenantId },
        include: { veterinarian: true },
        orderBy: { scheduledAt: 'desc' },
      })
      for (const c of consultations) {
        entries.push({
          id: c.id,
          type: 'CONSULTATION',
          date: c.scheduledAt.toISOString(),
          title: `Consulta — ${c.status}`,
          summary: c.diagnosis ?? c.observations ?? undefined,
          metadata: {
            status: c.status,
            veterinarianId: c.veterinarianId,
            veterinarianName: c.veterinarian?.name,
            diagnosis: c.diagnosis,
          },
        })
      }
    }

    if (shouldInclude('VACCINATION')) {
      const records = await prisma.vaccinationRecord.findMany({
        where: { animalId, tenantId: session.tenantId },
        orderBy: { appliedAt: 'desc' },
      })
      for (const r of records) {
        entries.push({
          id: r.id,
          type: 'VACCINATION',
          date: r.appliedAt.toISOString(),
          title: `Vacinação — ${r.vaccine}`,
          summary: r.observations ?? undefined,
          metadata: {
            vaccine: r.vaccine,
            batchNumber: r.batchNumber,
            manufacturer: r.manufacturer,
            nextDoseAt: r.nextDoseAt?.toISOString(),
          },
        })
      }
    }

    if (shouldInclude('DEWORMING')) {
      const records = await prisma.dewormingRecord.findMany({
        where: { animalId, tenantId: session.tenantId },
        orderBy: { appliedAt: 'desc' },
      })
      for (const r of records) {
        entries.push({
          id: r.id,
          type: 'DEWORMING',
          date: r.appliedAt.toISOString(),
          title: `Vermifugação — ${r.medication}`,
          summary: r.observations ?? undefined,
          metadata: {
            medication: r.medication,
            nextApplicationAt: r.nextApplicationAt?.toISOString(),
          },
        })
      }
    }

    if (shouldInclude('ANTI_FLEAS')) {
      const records = await prisma.antiFleasRecord.findMany({
        where: { animalId, tenantId: session.tenantId },
        orderBy: { appliedAt: 'desc' },
      })
      for (const r of records) {
        entries.push({
          id: r.id,
          type: 'ANTI_FLEAS',
          date: r.appliedAt.toISOString(),
          title: `Anti-pulgas — ${r.medication}`,
          summary: r.observations ?? undefined,
          metadata: {
            medication: r.medication,
            nextApplicationAt: r.nextApplicationAt?.toISOString(),
          },
        })
      }
    }

    if (shouldInclude('PRESCRIPTION')) {
      const records = await prisma.prescription.findMany({
        where: { animalId, tenantId: session.tenantId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      })
      for (const r of records) {
        entries.push({
          id: r.id,
          type: 'PRESCRIPTION',
          date: r.createdAt.toISOString(),
          title: 'Receita Médica',
          summary: r.diagnosis,
          metadata: {
            consultationId: r.consultationId,
            itemCount: r.items.length,
          },
        })
      }
    }

    if (shouldInclude('ATTACHMENT')) {
      const records = await prisma.attachment.findMany({
        where: { animalId, tenantId: session.tenantId },
        orderBy: { createdAt: 'desc' },
      })
      for (const r of records) {
        entries.push({
          id: r.id,
          type: 'ATTACHMENT',
          date: r.createdAt.toISOString(),
          title: r.name,
          metadata: {
            type: r.type,
            mimeType: r.mimeType,
            sizeBytes: r.sizeBytes,
            consultationId: r.consultationId,
          },
        })
      }
    }

    // Sort by date desc
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Paginate
    const total = entries.length
    const paginated = entries.slice((page - 1) * pageSize, page * pageSize)

    return NextResponse.json({
      data: paginated,
      meta: { total, page, pageSize },
    })
  } catch (e) {
    return apiError(e)
  }
}
