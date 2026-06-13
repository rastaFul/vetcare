import { ScheduleSession } from '../ScheduleSession'
import { ISessionRepository } from '../../ports/ISessionRepository'
import { IServiceRepository } from '@/modules/services/application/ports/IServiceRepository'
import { ICalendarService } from '@/modules/clinical/application/ports/ICalendarService'
import { Session } from '../../../domain/entities/Session'
import { Service } from '@/modules/services/domain/entities/Service'
import { AppError } from '@/shared/infrastructure/errors'

const makeSessionRepo = (): jest.Mocked<ISessionRepository> => ({
  save: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
  findById: jest.fn(),
  list: jest.fn(),
  findUpcoming: jest.fn(),
})

const makeServiceRepo = (): jest.Mocked<IServiceRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  list: jest.fn(),
})

const makeCalendarService = (): jest.Mocked<ICalendarService> => ({
  createEvent: jest.fn().mockResolvedValue('event-id-123'),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  createReminder: jest.fn(),
})

const makePrismaClient = (clientExists: boolean) => ({
  client: {
    findFirst: jest.fn().mockResolvedValue(clientExists ? { id: 'client-1', tenantId: 'tenant-1' } : null),
  },
})

describe('ScheduleSession use case', () => {
  const baseInput = {
    tenantId: 'tenant-1',
    clientId: 'client-1',
    therapistId: 'user-1',
    scheduledAt: new Date('2026-07-01T10:00:00Z'),
  }

  it('client exists, no service → creates session SCHEDULED', async () => {
    const sessionRepo = makeSessionRepo()
    const serviceRepo = makeServiceRepo()
    const prisma = makePrismaClient(true)
    const useCase = new ScheduleSession(sessionRepo, serviceRepo, null, prisma as never)
    const result = await useCase.execute(baseInput)
    expect(result).toBeInstanceOf(Session)
    expect(result.status).toBe('SCHEDULED')
    expect(sessionRepo.save).toHaveBeenCalledWith(result)
  })

  it('client does not exist → throws error', async () => {
    const sessionRepo = makeSessionRepo()
    const serviceRepo = makeServiceRepo()
    const prisma = makePrismaClient(false)
    const useCase = new ScheduleSession(sessionRepo, serviceRepo, null, prisma as never)
    await expect(useCase.execute(baseInput)).rejects.toThrow()
  })

  it('service inactive → throws BusinessError', async () => {
    const sessionRepo = makeSessionRepo()
    const serviceRepo = makeServiceRepo()
    const inactiveService = Service.create({ tenantId: 'tenant-1', name: 'Massagem', durationMin: 60, price: 100 })
    inactiveService.deactivate()
    serviceRepo.findById.mockResolvedValue(inactiveService)
    const prisma = makePrismaClient(true)
    const useCase = new ScheduleSession(sessionRepo, serviceRepo, null, prisma as never)
    await expect(useCase.execute({ ...baseInput, serviceId: 'service-1' })).rejects.toThrow(AppError)
  })

  it('active service → creates session with serviceId', async () => {
    const sessionRepo = makeSessionRepo()
    const serviceRepo = makeServiceRepo()
    const activeService = Service.create({ tenantId: 'tenant-1', name: 'Massagem', durationMin: 60, price: 100 })
    serviceRepo.findById.mockResolvedValue(activeService)
    const prisma = makePrismaClient(true)
    const useCase = new ScheduleSession(sessionRepo, serviceRepo, null, prisma as never)
    const result = await useCase.execute({ ...baseInput, serviceId: activeService.id })
    expect(result.serviceId).toBe(activeService.id)
  })

  it('createCalendarEvent=true → calendar.createEvent called', async () => {
    const sessionRepo = makeSessionRepo()
    const serviceRepo = makeServiceRepo()
    const calendar = makeCalendarService()
    const prisma = makePrismaClient(true)
    const useCase = new ScheduleSession(sessionRepo, serviceRepo, calendar, prisma as never)
    const result = await useCase.execute({ ...baseInput, createCalendarEvent: true, calendarToken: 'tok' })
    expect(calendar.createEvent).toHaveBeenCalled()
    expect(result.googleCalendarEventId).toBe('event-id-123')
  })
})
