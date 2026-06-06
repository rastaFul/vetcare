import { CancelConsultation } from '../CancelConsultation'
import { IConsultationRepository, ListConsultationsOptions } from '../../ports/IConsultationRepository'
import { ICalendarService } from '../../ports/ICalendarService'
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
  deletedEvents: string[] = []

  async createEvent(): Promise<string> { return 'event-id' }
  async updateEvent() {}
  async deleteEvent(eventId: string) { this.deletedEvents.push(eventId) }
  async createReminder(): Promise<string> { return 'reminder-id' }
}

function makeScheduledConsultation(id = 'c-1', calendarEventId?: string) {
  const c = Consultation.create(
    {
      tenantId: 'tenant-1',
      animalId: 'animal-1',
      veterinarianId: 'vet-1',
      scheduledAt: new Date(Date.now() + 86400000),
    },
    id
  )
  if (calendarEventId) c.setCalendarEventId(calendarEventId)
  return c
}

describe('CancelConsultation', () => {
  let repo: InMemoryConsultationRepository
  let calendarService: MockCalendarService
  let useCase: CancelConsultation

  beforeEach(() => {
    repo = new InMemoryConsultationRepository()
    calendarService = new MockCalendarService()
    useCase = new CancelConsultation(repo, calendarService)
  })

  it('should cancel SCHEDULED consultation', async () => {
    repo.consultations.push(makeScheduledConsultation())

    await useCase.execute('c-1', 'tenant-1')

    expect(repo.consultations[0].status).toBe('CANCELLED')
  })

  it('should throw when cancelling COMPLETED consultation', async () => {
    const c = makeScheduledConsultation()
    c.complete({ anamnesis: 'OK', diagnosis: 'OK' })
    repo.consultations.push(c)

    await expect(useCase.execute('c-1', 'tenant-1')).rejects.toThrow()
  })

  it('should throw NotFoundError for non-existent consultation', async () => {
    await expect(useCase.execute('non-existent', 'tenant-1')).rejects.toThrow(NotFoundError)
  })

  it('should call deleteEvent on calendar when googleCalendarEventId exists', async () => {
    repo.consultations.push(makeScheduledConsultation('c-1', 'gcal-event-123'))

    await useCase.execute('c-1', 'tenant-1', 'access-token')

    expect(calendarService.deletedEvents).toContain('gcal-event-123')
  })

  it('should not call deleteEvent when no calendar event id', async () => {
    repo.consultations.push(makeScheduledConsultation('c-1'))

    await useCase.execute('c-1', 'tenant-1', 'access-token')

    expect(calendarService.deletedEvents).toHaveLength(0)
  })
})
