import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaServiceRepository } from '@/modules/services/infrastructure/repositories/PrismaServiceRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'
import { Service } from '@/modules/services/domain/entities/Service'

const repo = new PrismaServiceRepository()

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params
    const body = await req.json()

    const service = await repo.findById(id, session.tenantId)
    if (!service) throw new NotFoundError('Serviço')

    if (body.active) service.activate()
    else service.deactivate()
    await repo.update(service)

    return apiSuccess(serviceToDTO(service))
  } catch (e) {
    return apiError(e)
  }
}

function serviceToDTO(s: Service) {
  return {
    id: s.id,
    name: s.name,
    durationMin: s.durationMin,
    price: s.price,
    description: s.description,
    active: s.active,
    sortOrder: s.sortOrder,
    createdAt: s.createdAt.toISOString(),
  }
}
