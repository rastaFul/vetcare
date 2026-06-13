import { NextRequest } from 'next/server'
import { apiSuccess, apiList, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaServiceRepository } from '@/modules/services/infrastructure/repositories/PrismaServiceRepository'
import { CreateService } from '@/modules/services/application/use-cases/CreateService'
import { ListServices } from '@/modules/services/application/use-cases/ListServices'
import { CreateServiceSchema } from '@/modules/services/application/dtos/ServiceDTO'
import { Service } from '@/modules/services/domain/entities/Service'

const repo = new PrismaServiceRepository()

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get('active') !== 'false'

    const useCase = new ListServices(repo)
    const services = await useCase.execute(session.tenantId, activeOnly)

    return apiList(services.map(serviceToDTO), {
      total: services.length,
      page: 1,
      pageSize: services.length || 20,
    })
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const body = await req.json()
    const input = CreateServiceSchema.parse(body)

    const useCase = new CreateService(repo)
    const service = await useCase.execute({ tenantId: session.tenantId, ...input })

    return apiSuccess(serviceToDTO(service), 201)
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
