import { NotificationLog } from '../../domain/entities/NotificationLog'

export interface INotificationLogRepository {
  save(log: NotificationLog): Promise<void>
  update(log: NotificationLog): Promise<void>
  findByTutor(tutorId: string, tenantId: string, limit?: number): Promise<NotificationLog[]>
  findByAnimal(animalId: string, tenantId: string, limit?: number): Promise<NotificationLog[]>
  findByClient(clientId: string, tenantId: string, limit?: number): Promise<NotificationLog[]>
  existsSentToday(tutorId: string, type: string, referenceId?: string): Promise<boolean>
  existsSentTodayForClient(clientId: string, type: string): Promise<boolean>
}
