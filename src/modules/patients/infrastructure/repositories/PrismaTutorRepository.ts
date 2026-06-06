import { prisma } from '@/lib/prisma'
import {
  ITutorRepository,
  ListTutorsOptions,
  ListTutorsResult,
} from '../../application/ports/ITutorRepository'
import { Tutor, TutorProps } from '../../domain/entities/Tutor'

function toEntity(raw: {
  id: string
  tenantId: string
  name: string
  cpf: string | null
  phone: string
  whatsapp: string | null
  email: string | null
  street: string | null
  number: string | null
  complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  notes: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}): Tutor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (Tutor as any)(
    {
      tenantId: raw.tenantId,
      name: raw.name,
      cpf: raw.cpf ?? undefined,
      phone: raw.phone,
      whatsapp: raw.whatsapp ?? undefined,
      email: raw.email ?? undefined,
      address: {
        street: raw.street ?? undefined,
        number: raw.number ?? undefined,
        complement: raw.complement ?? undefined,
        neighborhood: raw.neighborhood ?? undefined,
        city: raw.city ?? undefined,
        state: raw.state ?? undefined,
        zipCode: raw.zipCode ?? undefined,
      },
      notes: raw.notes ?? undefined,
      status: raw.status as TutorProps['status'],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    } as TutorProps,
    raw.id
  )
}

export class PrismaTutorRepository implements ITutorRepository {
  async save(tutor: Tutor): Promise<void> {
    await prisma.tutor.create({
      data: {
        id: tutor.id,
        tenantId: tutor.tenantId,
        name: tutor.name,
        cpf: tutor.cpf ?? null,
        phone: tutor.phone,
        whatsapp: tutor.whatsapp ?? null,
        email: tutor.email ?? null,
        street: tutor.address?.street ?? null,
        number: tutor.address?.number ?? null,
        complement: tutor.address?.complement ?? null,
        neighborhood: tutor.address?.neighborhood ?? null,
        city: tutor.address?.city ?? null,
        state: tutor.address?.state ?? null,
        zipCode: tutor.address?.zipCode ?? null,
        notes: tutor.notes ?? null,
        status: tutor.status,
      },
    })
  }

  async findById(id: string, tenantId: string): Promise<Tutor | null> {
    const raw = await prisma.tutor.findFirst({ where: { id, tenantId } })
    return raw ? toEntity(raw) : null
  }

  async findByCpf(cpf: string, tenantId: string): Promise<Tutor | null> {
    const raw = await prisma.tutor.findFirst({ where: { cpf, tenantId } })
    return raw ? toEntity(raw) : null
  }

  async list({
    tenantId,
    search,
    status,
    page = 1,
    pageSize = 20,
  }: ListTutorsOptions): Promise<ListTutorsResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { tenantId }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search.replace(/\D/g, '') } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, rows] = await Promise.all([
      prisma.tutor.count({ where }),
      prisma.tutor.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
        include: { _count: { select: { animals: true } } },
      }),
    ])

    return { tutors: rows.map(toEntity), total }
  }

  async update(tutor: Tutor): Promise<void> {
    await prisma.tutor.update({
      where: { id: tutor.id },
      data: {
        name: tutor.name,
        cpf: tutor.cpf ?? null,
        phone: tutor.phone,
        whatsapp: tutor.whatsapp ?? null,
        email: tutor.email ?? null,
        street: tutor.address?.street ?? null,
        number: tutor.address?.number ?? null,
        complement: tutor.address?.complement ?? null,
        neighborhood: tutor.address?.neighborhood ?? null,
        city: tutor.address?.city ?? null,
        state: tutor.address?.state ?? null,
        zipCode: tutor.address?.zipCode ?? null,
        notes: tutor.notes ?? null,
        status: tutor.status,
        updatedAt: new Date(),
      },
    })
  }
}
