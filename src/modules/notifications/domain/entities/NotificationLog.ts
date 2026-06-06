import { Entity } from '@/shared/domain/Entity'

export type NotificationType = 'CONSULTATION_REMINDER' | 'VACCINATION_REMINDER' | 'RETURN_REMINDER' | 'CUSTOM'
export type NotificationChannel = 'WHATSAPP' | 'EMAIL'
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED'

export interface NotificationLogProps {
  tenantId: string
  tutorId: string
  animalId: string
  type: NotificationType
  channel: NotificationChannel
  recipientPhone?: string
  recipientEmail?: string
  message: string
  status: NotificationStatus
  errorMessage?: string
  sentAt?: Date
  createdAt: Date
}

export class NotificationLog extends Entity<NotificationLogProps> {
  get tenantId() { return this.props.tenantId }
  get tutorId() { return this.props.tutorId }
  get animalId() { return this.props.animalId }
  get type() { return this.props.type }
  get channel() { return this.props.channel }
  get recipientPhone() { return this.props.recipientPhone }
  get recipientEmail() { return this.props.recipientEmail }
  get message() { return this.props.message }
  get status() { return this.props.status }
  get errorMessage() { return this.props.errorMessage }
  get sentAt() { return this.props.sentAt }
  get createdAt() { return this.props.createdAt }

  static create(props: Omit<NotificationLogProps, 'status' | 'createdAt'>, id?: string): NotificationLog {
    return new NotificationLog({ ...props, status: 'PENDING', createdAt: new Date() }, id)
  }

  markSent(): void {
    this.props.status = 'SENT'
    this.props.sentAt = new Date()
  }

  markFailed(error: string): void {
    this.props.status = 'FAILED'
    this.props.errorMessage = error
  }

  markDelivered(): void {
    this.props.status = 'DELIVERED'
  }
}
