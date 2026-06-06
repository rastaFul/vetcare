export interface NotificationRecipient {
  phone?: string
  email?: string
  name: string
}

export type NotificationChannel = 'WHATSAPP' | 'EMAIL' | 'AUTO'

export interface SendResult {
  status: 'sent' | 'failed'
  channel: 'WHATSAPP' | 'EMAIL'
  error?: string
}

export interface INotificationService {
  sendWhatsApp(phone: string, message: string): Promise<SendResult>
  sendEmail(email: string, subject: string, html: string): Promise<SendResult>
  getWhatsAppStatus(): Promise<'connected' | 'disconnected' | 'qr_code' | 'unavailable'>
  getQRCode(): Promise<string | null>
}
