import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'
import { EvolutionApiAdapter } from '@/modules/notifications/infrastructure/whatsapp/EvolutionApiAdapter'

export async function GET() {
  try {
    const session = await getAuthSession()

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: {
        evolutionApiUrl: true,
        evolutionApiKey: true,
        evolutionInstanceName: true,
        resendApiKey: true,
        resendFromEmail: true,
      },
    })

    const whatsappConfigured = Boolean(
      tenant?.evolutionApiUrl && tenant.evolutionApiKey && tenant.evolutionInstanceName,
    )

    let whatsappStatus: 'connected' | 'disconnected' | 'qr_code' | 'unavailable' = 'unavailable'

    if (whatsappConfigured && tenant?.evolutionApiUrl && tenant.evolutionApiKey && tenant.evolutionInstanceName) {
      const adapter = new EvolutionApiAdapter(
        tenant.evolutionApiUrl,
        tenant.evolutionApiKey,
        tenant.evolutionInstanceName,
      )
      whatsappStatus = await adapter.getWhatsAppStatus()
    }

    const emailConfigured = Boolean(tenant?.resendApiKey && tenant.resendFromEmail)

    return apiSuccess({
      whatsapp: {
        configured: whatsappConfigured,
        status: whatsappStatus,
      },
      email: {
        configured: emailConfigured,
        fromEmail: emailConfigured ? (tenant?.resendFromEmail ?? undefined) : undefined,
      },
    })
  } catch (e) {
    return apiError(e)
  }
}
