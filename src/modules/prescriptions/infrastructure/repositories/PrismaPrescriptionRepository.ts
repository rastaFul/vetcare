import { prisma } from '@/lib/prisma'
import { IPrescriptionRepository } from '../../application/ports/IPrescriptionRepository'
import { Prescription, PrescriptionProps, PrescriptionItem } from '../../domain/entities/Prescription'

type PrismaItem = {
  id: string
  prescriptionId: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string | null
  sortOrder: number
}

type PrismaPrescription = {
  id: string
  tenantId: string
  consultationId: string
  animalId: string
  veterinarianId: string
  diagnosis: string
  observations: string | null
  pdfUrl: string | null
  pdfGeneratedAt: Date | null
  createdAt: Date
  items: PrismaItem[]
}

function toEntity(raw: PrismaPrescription): Prescription {
  const items: PrescriptionItem[] = raw.items
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      medication: item.medication,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions ?? undefined,
    }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (Prescription as any)(
    {
      tenantId: raw.tenantId,
      consultationId: raw.consultationId,
      animalId: raw.animalId,
      veterinarianId: raw.veterinarianId,
      diagnosis: raw.diagnosis,
      observations: raw.observations ?? undefined,
      items,
      pdfUrl: raw.pdfUrl ?? undefined,
      pdfGeneratedAt: raw.pdfGeneratedAt ?? undefined,
      createdAt: raw.createdAt,
    } as PrescriptionProps,
    raw.id
  )
}

export class PrismaPrescriptionRepository implements IPrescriptionRepository {
  async save(prescription: Prescription): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.prescription.create({
        data: {
          id: prescription.id,
          tenantId: prescription.tenantId,
          consultationId: prescription.consultationId,
          animalId: prescription.animalId,
          veterinarianId: prescription.veterinarianId,
          diagnosis: prescription.diagnosis,
          observations: prescription.observations ?? null,
          pdfUrl: prescription.pdfUrl ?? null,
          pdfGeneratedAt: prescription.pdfGeneratedAt ?? null,
        },
      })

      await tx.prescriptionItem.createMany({
        data: prescription.items.map((item, idx) => ({
          prescriptionId: prescription.id,
          medication: item.medication,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions ?? null,
          sortOrder: idx,
        })),
      })
    })
  }

  async findById(id: string, tenantId: string): Promise<Prescription | null> {
    const raw = await prisma.prescription.findFirst({
      where: { id, tenantId },
      include: { items: true },
    })
    return raw ? toEntity(raw) : null
  }

  async findByAnimal(animalId: string, tenantId: string): Promise<Prescription[]> {
    const rows = await prisma.prescription.findMany({
      where: { animalId, tenantId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toEntity)
  }

  async findByConsultation(consultationId: string, tenantId: string): Promise<Prescription[]> {
    const rows = await prisma.prescription.findMany({
      where: { consultationId, tenantId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toEntity)
  }

  async update(prescription: Prescription): Promise<void> {
    await prisma.prescription.update({
      where: { id: prescription.id },
      data: {
        diagnosis: prescription.diagnosis,
        observations: prescription.observations ?? null,
        pdfUrl: prescription.pdfUrl ?? null,
        pdfGeneratedAt: prescription.pdfGeneratedAt ?? null,
      },
    })
  }
}
