import { prisma } from '@/lib/prisma'
import { IClientRepository, ListClientsInput } from '../../application/ports/IClientRepository'
import { Client, ClientProps } from '../../domain/entities/Client'
import { ClientHealthRecord } from '../../domain/entities/ClientHealthRecord'

function toEntity(raw: {
  id: string; tenantId: string; name: string; phone: string; whatsapp: string | null
  email: string | null; birthDate: Date | null; street: string | null; number: string | null
  complement: string | null; neighborhood: string | null; city: string | null
  state: string | null; zipCode: string | null; notes: string | null; status: string
  notifyWhatsApp: boolean; notifyEmail: boolean; notifySession: boolean
  createdAt: Date; updatedAt: Date
}): Client {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (Client as any)(
    {
      tenantId: raw.tenantId,
      name: raw.name,
      phone: raw.phone,
      whatsapp: raw.whatsapp ?? undefined,
      email: raw.email ?? undefined,
      birthDate: raw.birthDate ?? undefined,
      street: raw.street ?? undefined,
      number: raw.number ?? undefined,
      complement: raw.complement ?? undefined,
      neighborhood: raw.neighborhood ?? undefined,
      city: raw.city ?? undefined,
      state: raw.state ?? undefined,
      zipCode: raw.zipCode ?? undefined,
      notes: raw.notes ?? undefined,
      status: raw.status as ClientProps['status'],
      notifyWhatsApp: raw.notifyWhatsApp,
      notifyEmail: raw.notifyEmail,
      notifySession: raw.notifySession,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    } as ClientProps,
    raw.id
  )
}

function toHealthRecord(raw: {
  id: string; tenantId: string; clientId: string
  pathologies: string | null; contraindications: string | null; medications: string | null
  allergies: string | null; objectives: string | null; observations: string | null; updatedAt: Date
}): ClientHealthRecord {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (ClientHealthRecord as any)(
    {
      tenantId: raw.tenantId,
      clientId: raw.clientId,
      pathologies: raw.pathologies ?? undefined,
      contraindications: raw.contraindications ?? undefined,
      medications: raw.medications ?? undefined,
      allergies: raw.allergies ?? undefined,
      objectives: raw.objectives ?? undefined,
      observations: raw.observations ?? undefined,
      updatedAt: raw.updatedAt,
    },
    raw.id
  )
}

export class PrismaClientRepository implements IClientRepository {
  async save(client: Client): Promise<void> {
    await prisma.client.create({
      data: {
        id: client.id,
        tenantId: client.tenantId,
        name: client.name,
        phone: client.phone,
        whatsapp: client.whatsapp ?? null,
        email: client.email ?? null,
        birthDate: client.birthDate ?? null,
        street: client.street ?? null,
        number: client.number ?? null,
        complement: client.complement ?? null,
        neighborhood: client.neighborhood ?? null,
        city: client.city ?? null,
        state: client.state ?? null,
        zipCode: client.zipCode ?? null,
        notes: client.notes ?? null,
        status: client.status,
        notifyWhatsApp: client.notifyWhatsApp,
        notifyEmail: client.notifyEmail,
        notifySession: client.notifySession,
      },
    })
  }

  async findById(id: string, tenantId: string): Promise<Client | null> {
    const raw = await prisma.client.findFirst({ where: { id, tenantId } })
    return raw ? toEntity(raw) : null
  }

  async list({ tenantId, search, status, page = 1, pageSize = 20 }: ListClientsInput): Promise<{ clients: Client[]; total: number }> {
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
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
    ])

    return { clients: rows.map(toEntity), total }
  }

  async update(client: Client): Promise<void> {
    await prisma.client.update({
      where: { id: client.id },
      data: {
        name: client.name,
        phone: client.phone,
        whatsapp: client.whatsapp ?? null,
        email: client.email ?? null,
        birthDate: client.birthDate ?? null,
        street: client.street ?? null,
        number: client.number ?? null,
        complement: client.complement ?? null,
        neighborhood: client.neighborhood ?? null,
        city: client.city ?? null,
        state: client.state ?? null,
        zipCode: client.zipCode ?? null,
        notes: client.notes ?? null,
        status: client.status,
        notifyWhatsApp: client.notifyWhatsApp,
        notifyEmail: client.notifyEmail,
        notifySession: client.notifySession,
        updatedAt: new Date(),
      },
    })
  }

  async saveHealthRecord(record: ClientHealthRecord): Promise<void> {
    await prisma.clientHealthRecord.upsert({
      where: { clientId: record.clientId },
      create: {
        id: record.id,
        tenantId: record.tenantId,
        clientId: record.clientId,
        pathologies: record.pathologies ?? null,
        contraindications: record.contraindications ?? null,
        medications: record.medications ?? null,
        allergies: record.allergies ?? null,
        objectives: record.objectives ?? null,
        observations: record.observations ?? null,
      },
      update: {
        pathologies: record.pathologies ?? null,
        contraindications: record.contraindications ?? null,
        medications: record.medications ?? null,
        allergies: record.allergies ?? null,
        objectives: record.objectives ?? null,
        observations: record.observations ?? null,
        updatedAt: new Date(),
      },
    })
  }

  async findHealthRecord(clientId: string, tenantId: string): Promise<ClientHealthRecord | null> {
    const raw = await prisma.clientHealthRecord.findFirst({ where: { clientId, tenantId } })
    return raw ? toHealthRecord(raw) : null
  }
}
