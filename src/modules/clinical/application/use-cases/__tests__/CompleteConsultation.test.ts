import { CompleteConsultation } from '../CompleteConsultation'
import { IConsultationRepository, ListConsultationsOptions } from '../../ports/IConsultationRepository'
import { ICalendarService, CalendarEventDTO } from '../../ports/ICalendarService'
import { Consultation } from '../../../domain/entities/Consultation'
import { NotFoundError } from '@/shared/infrastructure/errors'

class InMemoryConsultationRepository implements IConsultationRepository {
  consultations: Consultation[] = []

  async save(c: Consultation) { this.consultations.push(c) }
  async findById(id: string, tenantId: string) {
    return this.consultations.find(c => c.id === id && c.tenantId === tenantId) ?? null
  }
  async list(_opts: ListConsultationsOptions) {
    return { consultations: this.consultations, total: this.consultations.length }
  }
  async update(c: Consultation) {
    const i = this.consultations.findIndex(x => x.id === c.id)
    if (i >= 0) this.consultations[i] = c
  }
  async findTodayConsultations() { return [] }
  async findUpcomingReturns() { return [] }
}

class MockCalendarService implements ICalendarService {
  createdReminders: { dto: CalendarEventDTO; calendarId: string }[] = []
  shouldFail = false

  async createEvent(_dto: CalendarEventDTO, _calendarId: string): Promise<string> {
    if (this.shouldFail) throw new Error('Calendar error')
    return `event-${Date.now()}`
  }
  async updateEvent() {}
  async deleteEvent() {}
  async createReminder(dto: CalendarEventDTO, calendarId: string): Promise<string> {
    if (this.shouldFail) throw new Error('Calendar error')
    this.createdReminders.push({ dto, calendarId })
    return `reminder-${Date.now()}`
  }
}

function makeScheduledConsultation(id = 'c-1') {
  return Consultation.create(
    {
      tenantId: 'tenant-1',
      animalId: 'animal-1',
      veterinarianId: 'vet-1',
      scheduledAt: new Date(Date.now() + 86400000),
    },
    id
  )
}

describe('CompleteConsultation', () => {
  let repo: InMemoryConsultationRepository
  let calendarService: MockCalendarService
  let useCase: CompleteConsultation

  beforeEach(() => {
    repo = new InMemoryConsultationRepository()
    calendarService = new MockCalendarService()
    useCase = new CompleteConsultation(repo, calendarService)
  })

  it('should complete consultation with valid data', async () => {
    const consultation = makeScheduledConsultation()
    repo.consultations.push(consultation)

    await useCase.execute('c-1', 'tenant-1', {
      anamnesis: 'Animal se apresentou saudável',
      diagnosis: 'Saudável',
      createReturnReminder: false,
    })

    const updated = repo.consultations[0]
    expect(updated.status).toBe('COMPLETED')
    expect(updated.anamnesis).toBe('Animal se apresentou saudável')
    expect(updated.diagnosis).toBe('Saudável')
  })

  it('should throw NotFoundError for non-existent consultation', async () => {
    await expect(
      useCase.execute('non-existent', 'tenant-1', {
        anamnesis: 'OK',
        diagnosis: 'OK',
        createReturnReminder: false,
      })
    ).rejects.toThrow(NotFoundError)
  })

  it('should throw when completing cancelled consultation', async () => {
    const consultation = makeScheduledConsultation()
    consultation.cancel()
    repo.consultations.push(consultation)

    await expect(
      useCase.execute('c-1', 'tenant-1', {
        anamnesis: 'OK',
        diagnosis: 'OK',
        createReturnReminder: false,
      })
    ).rejects.toThrow()
  })

  it('should throw when completing without anamnesis', async () => {
    const consultation = makeScheduledConsultation()
    repo.consultations.push(consultation)

    await expect(
      useCase.execute('c-1', 'tenant-1', {
        anamnesis: '',
        diagnosis: 'OK',
        createReturnReminder: false,
      })
    ).rejects.toThrow()
  })

  it('should create return reminder when returnDate and createReturnReminder=true and calendarId provided', async () => {
    const consultation = makeScheduledConsultation()
    repo.consultations.push(consultation)
    const returnDate = new Date(Date.now() + 7 * 86400000).toISOString()

    await useCase.execute(
      'c-1',
      'tenant-1',
      {
        anamnesis: 'OK',
        diagnosis: 'OK',
        returnDate,
        createReturnReminder: true,
      },
      'tenant-calendar-id'
    )

    expect(calendarService.createdReminders).toHaveLength(1)
    expect(calendarService.createdReminders[0].calendarId).toBe('tenant-calendar-id')
    const updated = repo.consultations[0]
    expect(updated.returnEventId).toBeDefined()
  })

  it('should save consultation even if calendar reminder fails', async () => {
    calendarService.shouldFail = true
    const consultation = makeScheduledConsultation()
    repo.consultations.push(consultation)
    const returnDate = new Date(Date.now() + 7 * 86400000).toISOString()

    await useCase.execute(
      'c-1',
      'tenant-1',
      {
        anamnesis: 'OK',
        diagnosis: 'OK',
        returnDate,
        createReturnReminder: true,
      },
      'tenant-calendar-id'
    )

    expect(repo.consultations[0].status).toBe('COMPLETED')
    expect(repo.consultations[0].returnEventId).toBeUndefined()
  })

  it('should not create reminder when no calendarId provided', async () => {
    const consultation = makeScheduledConsultation()
    repo.consultations.push(consultation)
    const returnDate = new Date(Date.now() + 7 * 86400000).toISOString()

    await useCase.execute('c-1', 'tenant-1', {
      anamnesis: 'OK',
      diagnosis: 'OK',
      returnDate,
      createReturnReminder: true,
    })

    expect(calendarService.createdReminders).toHaveLength(0)
  })
})
