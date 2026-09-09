import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'
import { withMetrics } from '@/lib/with-metrics'


async function DELETE_impl() {
  try {
    const session = await getAuthSession()

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: {
        evolutionApiUrl: true,
        evolutionApiKey: true,
        evolutionInstanceName: true,
      },
    })

    if (tenant?.evolutionApiUrl && tenant.evolutionApiKey && tenant.evolutionInstanceName) {
      try {
        await fetch(`${tenant.evolutionApiUrl}/instance/${tenant.evolutionInstanceName}`, {
          method: 'DELETE',
          headers: { apikey: tenant.evolutionApiKey },
        })
      } catch {
        // Graceful — ignore fetch errors
      }
    }

    return apiSuccess({ disconnected: true })
  } catch (e) {
    return apiError(e)
  }
}
export const DELETE = withMetrics("/api/v1/settings/notifications/whatsapp/disconnect", DELETE_impl)

