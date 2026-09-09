import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaServiceRepository } from '@/modules/services/infrastructure/repositories/PrismaServiceRepository'
import { UpdateService } from '@/modules/services/application/use-cases/UpdateService'
import { UpdateServiceSchema } from '@/modules/services/application/dtos/ServiceDTO'
import { Service } from '@/modules/services/domain/entities/Service'
import { withMetrics } from '@/lib/with-metrics'


const repo = new PrismaServiceRepository()

async function PUT_impl(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params
    const body = await req.json()
    const input = UpdateServiceSchema.parse(body)

    const useCase = new UpdateService(repo)
    const service = await useCase.execute(id, session.tenantId, input)

    return apiSuccess(serviceToDTO(service))
  } catch (e) {
    return apiError(e)
  }
}
export const PUT = withMetrics("/api/v1/services/:id", PUT_impl)


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
