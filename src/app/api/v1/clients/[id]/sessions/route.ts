import { NextRequest } from 'next/server'
import { apiList, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaSessionRepository } from '@/modules/scheduling/infrastructure/repositories/PrismaSessionRepository'
import { ListSessions } from '@/modules/scheduling/application/use-cases/ListSessions'
import { Session } from '@/modules/scheduling/domain/entities/Session'

const repo = new PrismaSessionRepository()

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params
    const { searchParams } = new URL(req.url)

    const useCase = new ListSessions(repo)
    const result = await useCase.execute({
      tenantId: session.tenantId,
      clientId: id,
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 20),
    })

    return apiList(result.sessions.map(sessionToDTO), {
      total: result.total,
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 20),
    })
  } catch (e) {
    return apiError(e)
  }
}

function sessionToDTO(s: Session) {
  return {
    id: s.id,
    clientId: s.clientId,
    serviceId: s.serviceId,
    therapistId: s.therapistId,
    scheduledAt: s.scheduledAt.toISOString(),
    status: s.status,
    address: s.address,
    notes: s.notes,
    priceCharged: s.priceCharged,
    returnDate: s.returnDate?.toISOString(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }
}
