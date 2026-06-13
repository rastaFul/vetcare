import { SendNotification, SendNotificationInput } from '../SendNotification'
import { INotificationLogRepository } from '../../ports/INotificationLogRepository'
import { INotificationService } from '../../ports/INotificationService'

// Minimal mocks for dependencies fetched via prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tutor: {
      findFirst: jest.fn(),
    },
    animal: {
      findFirst: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('SendNotification use case', () => {
  let logRepo: jest.Mocked<INotificationLogRepository>
  let whatsappAdapter: jest.Mocked<INotificationService>
  let emailAdapter: jest.Mocked<INotificationService>
  let useCase: SendNotification

  const baseTutor = {
    id: 'tutor-1',
    name: 'João Silva',
    whatsapp: '5511999999999',
    email: 'joao@email.com',
    notifyWhatsApp: true,
    notifyEmail: false,
    notifyConsultation: true,
    notifyVaccination: true,
    notifyReturn: true,
  }

  const baseAnimal = {
    id: 'animal-1',
    name: 'Rex',
  }

  const baseTenant = {
    id: 'tenant-1',
    name: 'Clínica VetCare',
    evolutionApiUrl: 'http://localhost:8080',
    evolutionApiKey: 'key',
    evolutionInstanceName: 'vetcare',
    resendApiKey: null,
    resendFromEmail: null,
  }

  const baseInput: SendNotificationInput = {
    tenantId: 'tenant-1',
    tutorId: 'tutor-1',
    animalId: 'animal-1',
    type: 'CONSULTATION_REMINDER',
    vars: {
      date: '10/06/2026',
      time: '14:00',
      vetName: 'Dra. Ana Lima',
    },
  }

  beforeEach(() => {
    logRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      findByTutor: jest.fn().mockResolvedValue([]),
      findByAnimal: jest.fn().mockResolvedValue([]),
      findByClient: jest.fn().mockResolvedValue([]),
      existsSentToday: jest.fn().mockResolvedValue(false),
      existsSentTodayForClient: jest.fn().mockResolvedValue(false),
    }

    whatsappAdapter = {
      sendWhatsApp: jest.fn().mockResolvedValue({ status: 'sent', channel: 'WHATSAPP' }),
      sendEmail: jest.fn().mockResolvedValue({ status: 'failed', channel: 'EMAIL', error: 'not supported' }),
      getWhatsAppStatus: jest.fn().mockResolvedValue('connected'),
      getQRCode: jest.fn().mockResolvedValue(null),
    }

    emailAdapter = {
      sendWhatsApp: jest.fn().mockResolvedValue({ status: 'failed', channel: 'WHATSAPP', error: 'not supported' }),
      sendEmail: jest.fn().mockResolvedValue({ status: 'sent', channel: 'EMAIL' }),
      getWhatsAppStatus: jest.fn().mockResolvedValue('unavailable'),
      getQRCode: jest.fn().mockResolvedValue(null),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockPrisma.tutor.findFirst as jest.Mock).mockResolvedValue(baseTutor)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockPrisma.animal.findFirst as jest.Mock).mockResolvedValue(baseAnimal)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockPrisma.tenant.findUnique as jest.Mock).mockResolvedValue(baseTenant)

    useCase = new SendNotification(logRepo, whatsappAdapter, emailAdapter)
  })

  it('sends WhatsApp when tutor has notifyWhatsApp=true', async () => {
    const result = await useCase.execute(baseInput)
    expect(whatsappAdapter.sendWhatsApp).toHaveBeenCalledTimes(1)
    expect(result.status).toBe('sent')
    expect(result.channel).toBe('WHATSAPP')
  })

  it('saves notification log with SENT status after WhatsApp success', async () => {
    await useCase.execute(baseInput)
    expect(logRepo.save).toHaveBeenCalledTimes(1)
    expect(logRepo.update).toHaveBeenCalledTimes(1)
    // The update should have been called with a log that has status SENT
    const updatedLog = (logRepo.update as jest.Mock).mock.calls[0][0]
    expect(updatedLog.status).toBe('SENT')
  })

  it('sends email when tutor has no WhatsApp but has email preference', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockPrisma.tutor.findFirst as jest.Mock).mockResolvedValue({
      ...baseTutor,
      whatsapp: null,
      notifyWhatsApp: false,
      notifyEmail: true,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockPrisma.tenant.findUnique as jest.Mock).mockResolvedValue({
      ...baseTenant,
      resendApiKey: 're_key',
      resendFromEmail: 'noreply@vetcare.dev',
    })

    useCase = new SendNotification(logRepo, null, emailAdapter)
    const result = await useCase.execute(baseInput)
    expect(emailAdapter.sendEmail).toHaveBeenCalledTimes(1)
    expect(result.status).toBe('sent')
    expect(result.channel).toBe('EMAIL')
  })

  it('falls back to email when WhatsApp fails', async () => {
    whatsappAdapter.sendWhatsApp = jest.fn().mockResolvedValue({
      status: 'failed',
      channel: 'WHATSAPP',
      error: 'Connection refused',
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockPrisma.tutor.findFirst as jest.Mock).mockResolvedValue({
      ...baseTutor,
      email: 'joao@email.com',
      notifyWhatsApp: true,
      notifyEmail: true,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockPrisma.tenant.findUnique as jest.Mock).mockResolvedValue({
      ...baseTenant,
      resendApiKey: 're_key',
      resendFromEmail: 'noreply@vetcare.dev',
    })

    useCase = new SendNotification(logRepo, whatsappAdapter, emailAdapter)
    const result = await useCase.execute(baseInput)
    expect(emailAdapter.sendEmail).toHaveBeenCalledTimes(1)
    expect(result.status).toBe('sent')
  })

  it('returns failed when both channels fail', async () => {
    whatsappAdapter.sendWhatsApp = jest.fn().mockResolvedValue({
      status: 'failed',
      channel: 'WHATSAPP',
      error: 'Connection refused',
    })
    emailAdapter.sendEmail = jest.fn().mockResolvedValue({
      status: 'failed',
      channel: 'EMAIL',
      error: 'Invalid API key',
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockPrisma.tutor.findFirst as jest.Mock).mockResolvedValue({
      ...baseTutor,
      notifyEmail: true,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockPrisma.tenant.findUnique as jest.Mock).mockResolvedValue({
      ...baseTenant,
      resendApiKey: 're_key',
      resendFromEmail: 'noreply@vetcare.dev',
    })

    useCase = new SendNotification(logRepo, whatsappAdapter, emailAdapter)
    const result = await useCase.execute(baseInput)
    expect(result.status).toBe('failed')
  })

  it('returns skipped when already sent today (deduplication)', async () => {
    logRepo.existsSentToday = jest.fn().mockResolvedValue(true)

    const result = await useCase.execute(baseInput)
    expect(result.status).toBe('skipped')
    expect(whatsappAdapter.sendWhatsApp).not.toHaveBeenCalled()
  })

  it('bypasses deduplication when skipDuplication=true', async () => {
    logRepo.existsSentToday = jest.fn().mockResolvedValue(true)

    const result = await useCase.execute({ ...baseInput, skipDuplication: true })
    expect(result.status).toBe('sent')
    expect(whatsappAdapter.sendWhatsApp).toHaveBeenCalledTimes(1)
  })

  it('returns skipped when tutor has no notification preferences set', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockPrisma.tutor.findFirst as jest.Mock).mockResolvedValue({
      ...baseTutor,
      notifyWhatsApp: false,
      notifyEmail: false,
    })

    const result = await useCase.execute(baseInput)
    expect(result.status).toBe('skipped')
    expect(whatsappAdapter.sendWhatsApp).not.toHaveBeenCalled()
  })
})
