import { prisma } from '@/lib/prisma'
import { IServiceRepository } from '../../application/ports/IServiceRepository'
import { Service, ServiceProps } from '../../domain/entities/Service'

function toEntity(raw: {
  id: string; tenantId: string; name: string; durationMin: number
  price: { toNumber(): number } | number; description: string | null
  active: boolean; sortOrder: number; createdAt: Date
}): Service {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (Service as any)(
    {
      tenantId: raw.tenantId,
      name: raw.name,
      durationMin: raw.durationMin,
      price: typeof raw.price === 'number' ? raw.price : raw.price.toNumber(),
      description: raw.description ?? undefined,
      active: raw.active,
      sortOrder: raw.sortOrder,
      createdAt: raw.createdAt,
    } as ServiceProps,
    raw.id
  )
}

export class PrismaServiceRepository implements IServiceRepository {
  async save(service: Service): Promise<void> {
    await prisma.service.create({
      data: {
        id: service.id,
        tenantId: service.tenantId,
        name: service.name,
        durationMin: service.durationMin,
        price: service.price,
        description: service.description ?? null,
        active: service.active,
        sortOrder: service.sortOrder,
      },
    })
  }

  async findById(id: string, tenantId: string): Promise<Service | null> {
    const raw = await prisma.service.findFirst({ where: { id, tenantId } })
    return raw ? toEntity(raw) : null
  }

  async list(tenantId: string, activeOnly?: boolean): Promise<Service[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { tenantId }
    if (activeOnly) where.active = true

    const rows = await prisma.service.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    return rows.map(toEntity)
  }

  async update(service: Service): Promise<void> {
    await prisma.service.update({
      where: { id: service.id },
      data: {
        name: service.name,
        durationMin: service.durationMin,
        price: service.price,
        description: service.description ?? null,
        active: service.active,
        sortOrder: service.sortOrder,
      },
    })
  }
}
