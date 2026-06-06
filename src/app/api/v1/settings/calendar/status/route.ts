import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getAuthSession()
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { googleCalendarToken: true, email: true },
    })
    const connected = Boolean(user?.googleCalendarToken)
    return apiSuccess({
      connected,
      email: connected ? user?.email : undefined,
    })
  } catch (e) {
    return apiError(e)
  }
}
