import { NextRequest } from 'next/server'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const q = new URL(req.url).searchParams.get('q') ?? ''
    if (q.length < 2) return apiSuccess({ tutors: [], animals: [] })

    const [tutors, animals] = await Promise.all([
      prisma.tutor.findMany({
        where: {
          tenantId: session.tenantId,
          status: 'ACTIVE',
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q.replace(/\D/g, '') } },
          ],
        },
        take: 5,
        select: { id: true, name: true, phone: true },
      }),
      prisma.animal.findMany({
        where: {
          tenantId: session.tenantId,
          status: 'ACTIVE',
          name: { contains: q, mode: 'insensitive' },
        },
        take: 5,
        select: { id: true, name: true, species: true, tutor: { select: { name: true } } },
      }),
    ])

    return apiSuccess({ tutors, animals })
  } catch (e) {
    return apiError(e)
  }
}
