import { prisma } from '@/lib/prisma'
import { IAnimalRepository, ListAnimalsOptions } from '../../application/ports/IAnimalRepository'
import { Animal, AnimalProps, Species, Sex, AnimalStatus } from '../../domain/entities/Animal'

function toEntity(raw: {
  id: string
  tenantId: string
  tutorId: string
  name: string
  species: string
  breed: string | null
  sex: string
  birthDate: Date | null
  weightKg: unknown
  color: string | null
  castrated: boolean
  microchip: string | null
  photoUrl: string | null
  notes: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}): Animal {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (Animal as any)(
    {
      tenantId: raw.tenantId,
      tutorId: raw.tutorId,
      name: raw.name,
      species: raw.species as Species,
      breed: raw.breed ?? undefined,
      sex: raw.sex as Sex,
      birthDate: raw.birthDate ?? undefined,
      weightKg: raw.weightKg !== null && raw.weightKg !== undefined
        ? Number(raw.weightKg)
        : undefined,
      color: raw.color ?? undefined,
      castrated: raw.castrated,
      microchip: raw.microchip ?? undefined,
      photoUrl: raw.photoUrl ?? undefined,
      notes: raw.notes ?? undefined,
      status: raw.status as AnimalStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    } as AnimalProps,
    raw.id
  )
}

export class PrismaAnimalRepository implements IAnimalRepository {
  async save(animal: Animal): Promise<void> {
    await prisma.animal.create({
      data: {
        id: animal.id,
        tenantId: animal.tenantId,
        tutorId: animal.tutorId,
        name: animal.name,
        species: animal.species,
        breed: animal.breed ?? null,
        sex: animal.sex,
        birthDate: animal.birthDate ?? null,
        weightKg: animal.weightKg ?? null,
        color: animal.color ?? null,
        castrated: animal.castrated,
        microchip: animal.microchip ?? null,
        photoUrl: animal.photoUrl ?? null,
        notes: animal.notes ?? null,
        status: animal.status,
      },
    })
  }

  async findById(id: string, tenantId: string): Promise<Animal | null> {
    const raw = await prisma.animal.findFirst({ where: { id, tenantId } })
    return raw ? toEntity(raw) : null
  }

  async list({
    tenantId,
    tutorId,
    species,
    status,
    search,
    page = 1,
    pageSize = 20,
  }: ListAnimalsOptions): Promise<{ animals: Animal[]; total: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { tenantId }
    if (tutorId) where.tutorId = tutorId
    if (species) where.species = species
    if (status) where.status = status
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    const [total, rows] = await Promise.all([
      prisma.animal.count({ where }),
      prisma.animal.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
    ])

    return { animals: rows.map(toEntity), total }
  }

  async update(animal: Animal): Promise<void> {
    await prisma.animal.update({
      where: { id: animal.id },
      data: {
        name: animal.name,
        species: animal.species,
        breed: animal.breed ?? null,
        sex: animal.sex,
        birthDate: animal.birthDate ?? null,
        weightKg: animal.weightKg ?? null,
        color: animal.color ?? null,
        castrated: animal.castrated,
        microchip: animal.microchip ?? null,
        photoUrl: animal.photoUrl ?? null,
        notes: animal.notes ?? null,
        status: animal.status,
        updatedAt: new Date(),
      },
    })
  }

  async countByTenant(tenantId: string): Promise<number> {
    return prisma.animal.count({ where: { tenantId } })
  }
}
