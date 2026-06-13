import { prisma } from '@/lib/prisma'
import { INotificationLogRepository } from '../ports/INotificationLogRepository'
import { INotificationService } from '../ports/INotificationService'
import { NotificationLog } from '../../domain/entities/NotificationLog'
import { MessageFormatter } from '../MessageFormatter'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface SendSessionNotificationInput {
  tenantId: string
  clientId: string
  sessionId: string
  type: 'SESSION_REMINDER' | 'SESSION_RETURN_REMINDER'
  scheduledAt: Date
  returnDate?: Date
  serviceName: string
  therapistName: string
  tenantName: string
  address?: string
}

export interface SendSessionNotificationOutput {
  status: 'sent' | 'failed' | 'skipped'
  channel?: 'WHATSAPP' | 'EMAIL'
  error?: string
}

export class SendSessionNotification {
  constructor(
    private readonly logRepo: INotificationLogRepository,
    private readonly whatsappAdapter: INotificationService | null,
    private readonly emailAdapter: INotificationService | null,
  ) {}

  async execute(input: SendSessionNotificationInput): Promise<SendSessionNotificationOutput> {
    const { tenantId, clientId, type } = input

    const alreadySent = await this.logRepo.existsSentTodayForClient(clientId, type)
    if (alreadySent) return { status: 'skipped' }

    const client = await prisma.client.findFirst({ where: { id: clientId, tenantId } })
    if (!client) return { status: 'failed', error: 'Client not found' }

    if (!client.notifySession) return { status: 'skipped' }
    if (!client.notifyWhatsApp && !client.notifyEmail) return { status: 'skipped' }

    const date = format(
      type === 'SESSION_REMINDER' ? input.scheduledAt : (input.returnDate ?? input.scheduledAt),
      'dd/MM/yyyy',
      { locale: ptBR }
    )
    const time = format(input.scheduledAt, 'HH:mm')

    const vars = {
      clientName: client.name,
      serviceName: input.serviceName,
      date,
      time,
      address: input.address,
      therapistName: input.therapistName,
      tenantName: input.tenantName,
    }

    const channel = client.notifyWhatsApp && client.whatsapp ? 'WHATSAPP' as const : 'EMAIL' as const

    const sessionType = type === 'SESSION_REMINDER' ? 'session' as const : 'session_return' as const
    const message = channel === 'WHATSAPP'
      ? (type === 'SESSION_REMINDER' ? MessageFormatter.sessionWhatsApp(vars) : MessageFormatter.sessionReturnWhatsApp(vars))
      : MessageFormatter.sessionEmailHtml({ ...vars, type: sessionType })

    const log = NotificationLog.create({
      tenantId,
      clientId,
      type,
      channel,
      recipientPhone: client.whatsapp ?? undefined,
      recipientEmail: client.email ?? undefined,
      message,
    })

    await this.logRepo.save(log)

    if (channel === 'WHATSAPP' && client.whatsapp && this.whatsappAdapter) {
      const result = await this.whatsappAdapter.sendWhatsApp(client.whatsapp, message)
      if (result.status === 'sent') {
        log.markSent()
        await this.logRepo.update(log)
        return { status: 'sent', channel: 'WHATSAPP' }
      }
      if (client.notifyEmail && client.email && this.emailAdapter) {
        return this.sendEmail(client.email, input, vars, log)
      }
      log.markFailed(result.error ?? 'WhatsApp failed')
      await this.logRepo.update(log)
      return { status: 'failed', error: result.error }
    }

    if (client.notifyEmail && client.email && this.emailAdapter) {
      return this.sendEmail(client.email, input, vars, log)
    }

    return { status: 'skipped' }
  }

  private async sendEmail(
    email: string,
    input: SendSessionNotificationInput,
    vars: Omit<Parameters<typeof MessageFormatter.sessionEmailHtml>[0], 'type'>,
    log: NotificationLog,
  ): Promise<SendSessionNotificationOutput> {
    if (!this.emailAdapter) return { status: 'failed', error: 'No email adapter' }

    const subject = MessageFormatter.sessionEmailSubject(vars.clientName, vars.serviceName)
    const sessionType = input.type === 'SESSION_REMINDER' ? 'session' as const : 'session_return' as const
    const html = MessageFormatter.sessionEmailHtml({
      ...vars,
      type: sessionType,
    })

    const result = await this.emailAdapter.sendEmail(email, subject, html)
    if (result.status === 'sent') {
      log.markSent()
      await this.logRepo.update(log)
      return { status: 'sent', channel: 'EMAIL' }
    }

    log.markFailed(result.error ?? 'Email failed')
    await this.logRepo.update(log)
    return { status: 'failed', error: result.error }
  }
}
