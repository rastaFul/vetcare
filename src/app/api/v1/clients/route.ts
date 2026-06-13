import { NextRequest } from 'next/server'
import { apiSuccess, apiList, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaClientRepository } from '@/modules/clients/infrastructure/repositories/PrismaClientRepository'
import { RegisterClient } from '@/modules/clients/application/use-cases/RegisterClient'
import { ListClients } from '@/modules/clients/application/use-cases/ListClients'
import { CreateClientSchema } from '@/modules/clients/application/dtos/ClientDTO'
import { Client } from '@/modules/clients/domain/entities/Client'

const repo = new PrismaClientRepository()

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const { searchParams } = new URL(req.url)

    const useCase = new ListClients(repo)
    const result = await useCase.execute({
      tenantId: session.tenantId,
      search: searchParams.get('search') ?? undefined,
      status: (searchParams.get('status') as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 20),
    })

    return apiList(result.clients.map(clientToDTO), {
      total: result.total,
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 20),
    })
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const body = await req.json()
    const input = CreateClientSchema.parse(body)

    const useCase = new RegisterClient(repo)
    const client = await useCase.execute({ tenantId: session.tenantId, ...input })

    return apiSuccess(clientToDTO(client), 201)
  } catch (e) {
    return apiError(e)
  }
}

function clientToDTO(client: Client) {
  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    whatsapp: client.whatsapp,
    email: client.email,
    birthDate: client.birthDate?.toISOString(),
    address: client.address,
    notes: client.notes,
    status: client.status,
    notifyWhatsApp: client.notifyWhatsApp,
    notifyEmail: client.notifyEmail,
    notifySession: client.notifySession,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  }
}
