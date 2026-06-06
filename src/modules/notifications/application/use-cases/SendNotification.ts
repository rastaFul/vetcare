import { prisma } from '@/lib/prisma'
import { INotificationLogRepository } from '../ports/INotificationLogRepository'
import { INotificationService } from '../ports/INotificationService'
import { NotificationLog, NotificationChannel, NotificationType } from '../../domain/entities/NotificationLog'
import { MessageFormatter, MessageVars } from '../MessageFormatter'

export interface SendNotificationInput {
  tenantId: string
  tutorId: string
  animalId: string
  type: 'CONSULTATION_REMINDER' | 'VACCINATION_REMINDER' | 'RETURN_REMINDER' | 'CUSTOM'
  vars: {
    date: string
    time?: string
    address?: string
    vaccine?: string
    vetName: string
  }
  skipDuplication?: boolean
  referenceId?: string
}

export interface SendNotificationOutput {
  status: 'sent' | 'failed' | 'skipped'
  channel?: 'WHATSAPP' | 'EMAIL'
  error?: string
}

export class SendNotification {
  constructor(
    private readonly logRepo: INotificationLogRepository,
    private readonly whatsappAdapter: INotificationService | null,
    private readonly emailAdapter: INotificationService | null,
  ) {}

  async execute(input: SendNotificationInput): Promise<SendNotificationOutput> {
    const { tenantId, tutorId, animalId, type, vars, skipDuplication, referenceId } = input

    if (!skipDuplication) {
      const alreadySent = await this.logRepo.existsSentToday(tutorId, type, referenceId)
      if (alreadySent) return { status: 'skipped' }
    }

    const [tutor, animal] = await Promise.all([
      prisma.tutor.findFirst({ where: { id: tutorId, tenantId } }),
      prisma.animal.findFirst({ where: { id: animalId, tenantId } }),
    ])

    if (!tutor || !animal) return { status: 'failed', error: 'Tutor or animal not found' }

    const notifyAllowed = this.checkTypePreference(tutor, type)
    if (!notifyAllowed) return { status: 'skipped' }

    const hasChannel = tutor.notifyWhatsApp || tutor.notifyEmail
    if (!hasChannel) return { status: 'skipped' }

    const messageVars: MessageVars = {
      tutorName: tutor.name,
      animalName: animal.name,
      date: vars.date,
      time: vars.time,
      address: vars.address,
      vaccine: vars.vaccine,
      vetName: vars.vetName,
    }

    const channel: NotificationChannel = tutor.notifyWhatsApp && tutor.whatsapp
      ? 'WHATSAPP'
      : 'EMAIL'

    const message = this.formatMessage(type, channel, messageVars)

    const log = NotificationLog.create({
      tenantId,
      tutorId,
      animalId,
      type: type as NotificationType,
      channel,
      recipientPhone: tutor.whatsapp ?? undefined,
      recipientEmail: tutor.email ?? undefined,
      message,
    })

    await this.logRepo.save(log)

    // Try WhatsApp first
    if (tutor.notifyWhatsApp && tutor.whatsapp && this.whatsappAdapter) {
      const result = await this.whatsappAdapter.sendWhatsApp(tutor.whatsapp, message)

      if (result.status === 'sent') {
        log.markSent()
        await this.logRepo.update(log)
        return { status: 'sent', channel: 'WHATSAPP' }
      }

      // Fallback to email
      if (tutor.notifyEmail && tutor.email && this.emailAdapter) {
        const emailResult = await this.sendViaEmail(tutor.email, type, messageVars, animal.name, vars.vaccine)

        if (emailResult.status === 'sent') {
          log.markSent()
          await this.logRepo.update(log)
          return { status: 'sent', channel: 'EMAIL' }
        }

        log.markFailed(emailResult.error ?? 'Email failed')
        await this.logRepo.update(log)
        return { status: 'failed', error: emailResult.error }
      }

      log.markFailed(result.error ?? 'WhatsApp failed')
      await this.logRepo.update(log)
      return { status: 'failed', error: result.error }
    }

    // Email only
    if (tutor.notifyEmail && tutor.email && this.emailAdapter) {
      const emailResult = await this.sendViaEmail(tutor.email, type, messageVars, animal.name, vars.vaccine)

      if (emailResult.status === 'sent') {
        log.markSent()
        await this.logRepo.update(log)
        return { status: 'sent', channel: 'EMAIL' }
      }

      log.markFailed(emailResult.error ?? 'Email failed')
      await this.logRepo.update(log)
      return { status: 'failed', error: emailResult.error }
    }

    return { status: 'skipped' }
  }

  private checkTypePreference(tutor: Record<string, unknown>, type: string): boolean {
    if (type === 'CONSULTATION_REMINDER') return Boolean(tutor.notifyConsultation)
    if (type === 'VACCINATION_REMINDER') return Boolean(tutor.notifyVaccination)
    if (type === 'RETURN_REMINDER') return Boolean(tutor.notifyReturn)
    return true
  }

  private formatMessage(
    type: string,
    channel: NotificationChannel,
    vars: MessageVars,
  ): string {
    if (channel === 'WHATSAPP') {
      if (type === 'CONSULTATION_REMINDER') return MessageFormatter.consultationWhatsApp(vars)
      if (type === 'VACCINATION_REMINDER') return MessageFormatter.vaccinationWhatsApp(vars)
      if (type === 'RETURN_REMINDER') return MessageFormatter.returnWhatsApp(vars)
      return MessageFormatter.consultationWhatsApp(vars)
    }

    if (type === 'CONSULTATION_REMINDER') return MessageFormatter.emailHtml({ ...vars, type: 'consultation' })
    if (type === 'VACCINATION_REMINDER') return MessageFormatter.emailHtml({ ...vars, type: 'vaccination' })
    if (type === 'RETURN_REMINDER') return MessageFormatter.emailHtml({ ...vars, type: 'return' })
    return MessageFormatter.emailHtml({ ...vars, type: 'consultation' })
  }

  private async sendViaEmail(
    email: string,
    type: string,
    vars: MessageVars,
    animalName: string,
    vaccine?: string,
  ) {
    if (!this.emailAdapter) return { status: 'failed' as const, error: 'No email adapter' }

    const subject = type === 'CONSULTATION_REMINDER'
      ? MessageFormatter.consultationEmailSubject(animalName)
      : type === 'VACCINATION_REMINDER'
      ? MessageFormatter.vaccinationEmailSubject(animalName, vaccine ?? '')
      : MessageFormatter.returnEmailSubject(animalName)

    const emailType = type === 'CONSULTATION_REMINDER' ? 'consultation'
      : type === 'VACCINATION_REMINDER' ? 'vaccination'
      : 'return'

    const html = MessageFormatter.emailHtml({ ...vars, type: emailType as 'consultation' | 'vaccination' | 'return' })

    return this.emailAdapter.sendEmail(email, subject, html)
  }
}
