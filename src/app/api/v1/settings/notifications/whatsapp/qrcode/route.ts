import { NextResponse } from 'next/server'
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
      },
    })

    if (!tenant?.evolutionApiUrl || !tenant.evolutionApiKey || !tenant.evolutionInstanceName) {
      return NextResponse.json(
        { error: { code: 'NOT_CONFIGURED', message: 'WhatsApp não configurado' } },
        { status: 400 },
      )
    }

    const adapter = new EvolutionApiAdapter(
      tenant.evolutionApiUrl,
      tenant.evolutionApiKey,
      tenant.evolutionInstanceName,
    )

    const status = await adapter.getWhatsAppStatus()

    if (status === 'unavailable') {
      return NextResponse.json(
        { error: { code: 'UNAVAILABLE', message: 'Evolution API indisponível' } },
        { status: 503 },
      )
    }

    if (status === 'connected') {
      return apiSuccess({ connected: true, qrcode: null })
    }

    // For disconnected or qr_code status, fetch QR code
    // getQRCode internally calls /instance/connect which triggers QR generation
    const qrcode = await adapter.getQRCode()

    return apiSuccess({ connected: false, qrcode })
  } catch (e) {
    return apiError(e)
  }
}
