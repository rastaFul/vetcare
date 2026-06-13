import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getAuthSession()
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { googleCalendarId: true, googleCalendarShareUrl: true },
    })
    const connected = Boolean(tenant?.googleCalendarId)
    return apiSuccess({
      connected,
      calendarId: tenant?.googleCalendarId ?? null,
      shareUrl: tenant?.googleCalendarShareUrl ?? null,
    })
  } catch (e) {
    return apiError(e)
  }
}
