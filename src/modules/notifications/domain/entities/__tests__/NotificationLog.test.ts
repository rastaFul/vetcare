import { NotificationLog } from '../NotificationLog'

describe('NotificationLog', () => {
  const baseProps = {
    tenantId: 'tenant-1',
    tutorId: 'tutor-1',
    animalId: 'animal-1',
    type: 'CONSULTATION_REMINDER' as const,
    channel: 'WHATSAPP' as const,
    recipientPhone: '5511999999999',
    message: 'Olá, lembrete de consulta',
  }

  describe('create()', () => {
    it('creates with PENDING status', () => {
      const log = NotificationLog.create(baseProps)
      expect(log.status).toBe('PENDING')
    })

    it('sets createdAt automatically', () => {
      const before = new Date()
      const log = NotificationLog.create(baseProps)
      expect(log.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    })

    it('generates an id when not provided', () => {
      const log = NotificationLog.create(baseProps)
      expect(log.id).toBeTruthy()
    })

    it('uses provided id', () => {
      const log = NotificationLog.create(baseProps, 'custom-id')
      expect(log.id).toBe('custom-id')
    })

    it('exposes all props correctly', () => {
      const log = NotificationLog.create(baseProps)
      expect(log.tenantId).toBe('tenant-1')
      expect(log.tutorId).toBe('tutor-1')
      expect(log.animalId).toBe('animal-1')
      expect(log.type).toBe('CONSULTATION_REMINDER')
      expect(log.channel).toBe('WHATSAPP')
      expect(log.recipientPhone).toBe('5511999999999')
      expect(log.message).toBe('Olá, lembrete de consulta')
    })
  })

  describe('markSent()', () => {
    it('sets status to SENT', () => {
      const log = NotificationLog.create(baseProps)
      log.markSent()
      expect(log.status).toBe('SENT')
    })

    it('sets sentAt to current time', () => {
      const before = new Date()
      const log = NotificationLog.create(baseProps)
      log.markSent()
      expect(log.sentAt).toBeDefined()
      expect(log.sentAt!.getTime()).toBeGreaterThanOrEqual(before.getTime())
    })
  })

  describe('markFailed()', () => {
    it('sets status to FAILED', () => {
      const log = NotificationLog.create(baseProps)
      log.markFailed('Connection refused')
      expect(log.status).toBe('FAILED')
    })

    it('sets errorMessage', () => {
      const log = NotificationLog.create(baseProps)
      log.markFailed('Connection refused')
      expect(log.errorMessage).toBe('Connection refused')
    })
  })

  describe('markDelivered()', () => {
    it('sets status to DELIVERED', () => {
      const log = NotificationLog.create(baseProps)
      log.markSent()
      log.markDelivered()
      expect(log.status).toBe('DELIVERED')
    })
  })
})
