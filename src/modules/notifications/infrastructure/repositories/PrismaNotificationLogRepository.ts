import { prisma } from '@/lib/prisma'
import { INotificationLogRepository } from '../../application/ports/INotificationLogRepository'
import { NotificationLog, NotificationChannel, NotificationType, NotificationStatus } from '../../domain/entities/NotificationLog'

export class PrismaNotificationLogRepository implements INotificationLogRepository {
  async save(log: NotificationLog): Promise<void> {
    await prisma.notificationLog.create({
      data: {
        id: log.id,
        tenantId: log.tenantId,
        tutorId: log.tutorId,
        animalId: log.animalId,
        type: log.type,
        channel: log.channel,
        recipientPhone: log.recipientPhone,
        recipientEmail: log.recipientEmail,
        message: log.message,
        status: log.status,
        errorMessage: log.errorMessage,
        sentAt: log.sentAt,
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

    return records.map((r) =>
      new NotificationLog(
        {
          tenantId: r.tenantId,
          tutorId: r.tutorId,
          animalId: r.animalId,
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
      ),
    )
  }

  async findByAnimal(animalId: string, tenantId: string, limit = 50): Promise<NotificationLog[]> {
    const records = await prisma.notificationLog.findMany({
      where: { animalId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return records.map((r) =>
      new NotificationLog(
        {
          tenantId: r.tenantId,
          tutorId: r.tutorId,
          animalId: r.animalId,
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
      ),
    )
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
}
