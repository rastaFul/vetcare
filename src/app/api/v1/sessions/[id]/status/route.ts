import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaSessionRepository } from '@/modules/scheduling/infrastructure/repositories/PrismaSessionRepository'
import { ConfirmSession } from '@/modules/scheduling/application/use-cases/ConfirmSession'
import { CompleteSession } from '@/modules/scheduling/application/use-cases/CompleteSession'
import { CancelSession } from '@/modules/scheduling/application/use-cases/CancelSession'
import { Session } from '@/modules/scheduling/domain/entities/Session'
import { withMetrics } from '@/lib/with-metrics'


const repo = new PrismaSessionRepository()

async function PATCH_impl(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authSession = await getAuthSession()
    const { id } = await params
    const body = await req.json()
    const { status, notes, priceCharged, returnDate } = body

    let session: Session

    if (status === 'CONFIRMED') {
      const useCase = new ConfirmSession(repo)
      session = await useCase.execute(id, authSession.tenantId)
    } else if (status === 'COMPLETED') {
      const useCase = new CompleteSession(repo)
      session = await useCase.execute({
        sessionId: id,
        tenantId: authSession.tenantId,
        notes,
        priceCharged,
      })
      if (returnDate) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(session as any).props.returnDate = new Date(returnDate)
        await repo.update(session)
      }
    } else if (status === 'CANCELLED') {
      const useCase = new CancelSession(repo)
      session = await useCase.execute({ sessionId: id, tenantId: authSession.tenantId })
    } else {
      return apiError(new Error('Invalid status'))
    }

    return apiSuccess({
      id: session.id,
      status: session.status,
      notes: session.notes,
      priceCharged: session.priceCharged,
      returnDate: session.returnDate?.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    })
  } catch (e) {
    return apiError(e)
  }
}
export const PATCH = withMetrics("/api/v1/sessions/:id/status", PATCH_impl)

