import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'
import { GoogleCalendarServiceAccountAdapter } from '@/modules/clinical/infrastructure/calendar/GoogleCalendarServiceAccountAdapter'

export async function POST() {
  try {
    const session = await getAuthSession()

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { id: true, name: true, googleCalendarId: true, googleCalendarShareUrl: true },
    })

    if (!tenant) {
      return apiError(new Error('Tenant não encontrado'))
    }

    // Idempotent: return existing if already set up
    if (tenant.googleCalendarId) {
      return apiSuccess({
        calendarId: tenant.googleCalendarId,
        shareUrl: tenant.googleCalendarShareUrl,
      })
    }

    const adapter = new GoogleCalendarServiceAccountAdapter()
    const { calendarId, shareUrl } = await adapter.createTenantCalendar(tenant.name)

    await prisma.tenant.update({
      where: { id: session.tenantId },
      data: { googleCalendarId: calendarId, googleCalendarShareUrl: shareUrl },
    })

    return apiSuccess({ calendarId, shareUrl }, 201)
  } catch (e) {
    return apiError(e)
  }
}
