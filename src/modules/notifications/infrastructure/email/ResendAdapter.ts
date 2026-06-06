import { INotificationService, SendResult } from '../../application/ports/INotificationService'

export class ResendAdapter implements INotificationService {
  constructor(
    private readonly apiKey: string,
    private readonly fromEmail: string,
  ) {}

  async sendEmail(email: string, subject: string, html: string): Promise<SendResult> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: `VetCare <${this.fromEmail}>`,
          to: [email],
          subject,
          html,
        }),
      })

      if (!response.ok) {
        const data = await response.json() as { message?: string }
        return { status: 'failed', channel: 'EMAIL', error: data.message ?? 'Unknown error' }
      }

      return { status: 'sent', channel: 'EMAIL' }
    } catch (err) {
      return { status: 'failed', channel: 'EMAIL', error: (err as Error).message }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendWhatsApp(_phone: string, _message: string): Promise<SendResult> {
    return { status: 'failed', channel: 'WHATSAPP', error: 'Not supported by ResendAdapter' }
  }

  async getWhatsAppStatus(): Promise<'unavailable'> {
    return 'unavailable'
  }

  async getQRCode(): Promise<null> {
    return null
  }
}
