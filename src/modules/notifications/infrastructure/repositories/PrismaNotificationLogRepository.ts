import { prisma } from '@/lib/prisma'
import { INotificationLogRepository } from '../../application/ports/INotificationLogRepository'
import { NotificationLog, NotificationChannel, NotificationType, NotificationStatus } from '../../domain/entities/NotificationLog'

export class PrismaNotificationLogRepository implements INotificationLogRepository {
  async save(log: NotificationLog): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.notificationLog.create as any)({
      data: {
        id: log.id,
        tenantId: log.tenantId,
        tutorId: log.tutorId ?? null,
        clientId: log.clientId ?? null,
        animalId: log.animalId ?? null,
        type: log.type,
        channel: log.channel,
        recipientPhone: log.recipientPhone ?? null,
        recipientEmail: log.recipientEmail ?? null,
        message: log.message,
        status: log.status,
        errorMessage: log.errorMessage ?? null,
        sentAt: log.sentAt ?? null,
        createdAt: log.createdAt,
      },
    })
  }

  async update(log: NotificationLog): Promise<void> {
    await prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        status: log.status,
        errorMessage: log.errorMessage,
        sentAt: log.sentAt,
      },
    })
  }

  async findByTutor(tutorId: string, tenantId: string, limit = 50): Promise<NotificationLog[]> {
    const records = await prisma.notificationLog.findMany({
      where: { tutorId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return records.map((r) => this.toEntity(r))
  }

  async findByAnimal(animalId: string, tenantId: string, limit = 50): Promise<NotificationLog[]> {
    const records = await prisma.notificationLog.findMany({
      where: { animalId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return records.map((r) => this.toEntity(r))
  }

  async findByClient(clientId: string, tenantId: string, limit = 50): Promise<NotificationLog[]> {
    const records = await prisma.notificationLog.findMany({
      where: { clientId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return records.map((r) => this.toEntity(r))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async existsSentToday(tutorId: string, type: string, _referenceId?: string): Promise<boolean> {
    const startOfDay = new Date()
    startOfDay.setUTCHours(0, 0, 0, 0)

    const count = await prisma.notificationLog.count({
      where: {
        tutorId,
        type: type as NotificationType,
        status: 'SENT',
        createdAt: { gte: startOfDay },
      },
    })

    return count > 0
  }

  async existsSentTodayForClient(clientId: string, type: string): Promise<boolean> {
    const startOfDay = new Date()
    startOfDay.setUTCHours(0, 0, 0, 0)

    const count = await prisma.notificationLog.count({
      where: {
        clientId,
        type: type as NotificationType,
        status: 'SENT',
        createdAt: { gte: startOfDay },
      },
    })

    return count > 0
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toEntity(r: Record<string, any>): NotificationLog {
    return new NotificationLog(
      {
        tenantId: r.tenantId,
        tutorId: r.tutorId ?? undefined,
        clientId: r.clientId ?? undefined,
        animalId: r.animalId ?? undefined,
        type: r.type as NotificationType,
        channel: r.channel as NotificationChannel,
        recipientPhone: r.recipientPhone ?? undefined,
        recipientEmail: r.recipientEmail ?? undefined,
        message: r.message,
        status: r.status as NotificationStatus,
        errorMessage: r.errorMessage ?? undefined,
        sentAt: r.sentAt ?? undefined,
        createdAt: r.createdAt,
      },
      r.id,
    )
  }
}
