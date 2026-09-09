import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'
import { withMetrics } from '@/lib/with-metrics'


async function GET_impl() {
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
export const GET = withMetrics("/api/v1/settings/calendar/status", GET_impl)

