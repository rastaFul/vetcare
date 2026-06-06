import { INotificationService, SendResult } from '../../application/ports/INotificationService'

export class EvolutionApiAdapter implements INotificationService {
  constructor(
    private readonly apiUrl: string,
    private readonly apiKey: string,
    private readonly instanceName: string,
  ) {}

  async sendWhatsApp(phone: string, message: string): Promise<SendResult> {
    const normalizedPhone = phone.startsWith('55') ? phone : `55${phone}`

    try {
      const response = await fetch(`${this.apiUrl}/message/sendText/${this.instanceName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: this.apiKey },
        body: JSON.stringify({ number: normalizedPhone, text: message }),
      })

      if (!response.ok) {
        const text = await response.text()
        return { status: 'failed', channel: 'WHATSAPP', error: `HTTP ${response.status}: ${text}` }
      }

      return { status: 'sent', channel: 'WHATSAPP' }
    } catch (err) {
      return { status: 'failed', channel: 'WHATSAPP', error: (err as Error).message }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendEmail(_email: string, _subject: string, _html: string): Promise<SendResult> {
    return { status: 'failed', channel: 'EMAIL', error: 'Not supported by EvolutionApiAdapter' }
  }

  async getWhatsAppStatus(): Promise<'connected' | 'disconnected' | 'qr_code' | 'unavailable'> {
    try {
      const response = await fetch(`${this.apiUrl}/instance/connectionState/${this.instanceName}`, {
        headers: { apikey: this.apiKey },
      })

      if (!response.ok) return 'unavailable'

      const data = await response.json() as { instance: { state: string } }
      const state = data.instance?.state

      if (state === 'open') return 'connected'
      if (state === 'close') return 'disconnected'
      if (state === 'connecting') return 'qr_code'
      return 'unavailable'
    } catch {
      return 'unavailable'
    }
  }

  async getQRCode(): Promise<string | null> {
    try {
      const response = await fetch(`${this.apiUrl}/instance/connect/${this.instanceName}`, {
        headers: { apikey: this.apiKey },
      })

      const data = await response.json() as { qrcode?: { base64?: string } }
      return data.qrcode?.base64 ?? null
    } catch {
      return null
    }
  }
}
