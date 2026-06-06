import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const { searchParams } = new URL(req.url)

    const tutorId = searchParams.get('tutorId') ?? undefined
    const animalId = searchParams.get('animalId') ?? undefined
    const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100)

    const logs = await prisma.notificationLog.findMany({
      where: {
        tenantId: session.tenantId,
        ...(tutorId ? { tutorId } : {}),
        ...(animalId ? { animalId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return apiSuccess(
      logs.map((log) => ({
        id: log.id,
        type: log.type,
        channel: log.channel,
        status: log.status,
        sentAt: log.sentAt?.toISOString() ?? null,
        errorMessage: log.errorMessage ?? null,
        createdAt: log.createdAt.toISOString(),
        message: log.message.slice(0, 100),
      })),
    )
  } catch (e) {
    return apiError(e)
  }
}
