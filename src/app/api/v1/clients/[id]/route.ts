import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaClientRepository } from '@/modules/clients/infrastructure/repositories/PrismaClientRepository'
import { GetClient } from '@/modules/clients/application/use-cases/GetClient'
import { UpdateClient } from '@/modules/clients/application/use-cases/UpdateClient'
import { UpdateClientSchema } from '@/modules/clients/application/dtos/ClientDTO'
import { Client } from '@/modules/clients/domain/entities/Client'
import { NotFoundError } from '@/shared/infrastructure/errors'
import { withMetrics } from '@/lib/with-metrics'


const repo = new PrismaClientRepository()

async function GET_impl(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params

    const useCase = new GetClient(repo)
    const client = await useCase.execute(id, session.tenantId)

    return apiSuccess(clientToDTO(client))
  } catch (e) {
    return apiError(e)
  }
}
export const GET = withMetrics("/api/v1/clients/:id", GET_impl)


async function PUT_impl(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params
    const body = await req.json()
    const input = UpdateClientSchema.parse(body)

    const useCase = new UpdateClient(repo)
    const client = await useCase.execute(id, session.tenantId, input)

    return apiSuccess(clientToDTO(client))
  } catch (e) {
    return apiError(e)
  }
}
export const PUT = withMetrics("/api/v1/clients/:id", PUT_impl)


async function PATCH_impl(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params
    const body = await req.json()

    const client = await repo.findById(id, session.tenantId)
    if (!client) throw new NotFoundError('Cliente')

    if (body.status === 'INACTIVE') client.deactivate()
    else if (body.status === 'ACTIVE') client.activate()
    await repo.update(client)

    return apiSuccess(clientToDTO(client))
  } catch (e) {
    return apiError(e)
  }
}
export const PATCH = withMetrics("/api/v1/clients/:id", PATCH_impl)


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
