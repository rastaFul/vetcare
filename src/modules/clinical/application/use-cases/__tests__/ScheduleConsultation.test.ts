import { ScheduleConsultation } from '../ScheduleConsultation'
import { IConsultationRepository, ListConsultationsOptions } from '../../ports/IConsultationRepository'
import { ICalendarService, CalendarEventDTO } from '../../ports/ICalendarService'
import { IAnimalRepository } from '@/modules/patients/application/ports/IAnimalRepository'
import { Consultation } from '../../../domain/entities/Consultation'
import { Animal } from '@/modules/patients/domain/entities/Animal'
import { NotFoundError, ValidationError } from '@/shared/infrastructure/errors'

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

class InMemoryAnimalRepository implements IAnimalRepository {
  animals: Animal[] = []

  async save(a: Animal) { this.animals.push(a) }
  async findById(id: string, tenantId: string) {
    return this.animals.find(a => a.id === id && a.tenantId === tenantId) ?? null
  }
  async list() { return { animals: this.animals, total: this.animals.length } }
  async update(a: Animal) {
    const i = this.animals.findIndex(x => x.id === a.id)
    if (i >= 0) this.animals[i] = a
  }
  async countByTenant() { return this.animals.length }
}

class MockCalendarService implements ICalendarService {
  createdEvents: { dto: CalendarEventDTO; calendarId: string }[] = []
  shouldFail = false

  async createEvent(dto: CalendarEventDTO, calendarId: string): Promise<string> {
    if (this.shouldFail) throw new Error('Calendar API error')
    this.createdEvents.push({ dto, calendarId })
    return `mock-event-${Date.now()}`
  }
  async updateEvent() {}
  async deleteEvent() {}
  async createReminder(dto: CalendarEventDTO, calendarId: string) {
    return this.createEvent(dto, calendarId)
  }
}

describe('ScheduleConsultation', () => {
  let consultationRepo: InMemoryConsultationRepository
  let animalRepo: InMemoryAnimalRepository
  let calendarService: MockCalendarService
  let useCase: ScheduleConsultation
  let animal: Animal

  beforeEach(() => {
    consultationRepo = new InMemoryConsultationRepository()
    animalRepo = new InMemoryAnimalRepository()
    calendarService = new MockCalendarService()
    useCase = new ScheduleConsultation(consultationRepo, animalRepo, calendarService)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    animal = new (Animal as any)(
      {
        tenantId: 'tenant-1',
        tutorId: 'tutor-1',
        name: 'Rex',
        species: 'DOG',
        sex: 'MALE',
        castrated: false,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'animal-1'
    )
    animalRepo.animals.push(animal)
  })

  it('should schedule consultation with valid animal', async () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    const result = await useCase.execute('tenant-1', 'vet-1', {
      animalId: 'animal-1',
      scheduledAt: future,
      createCalendarEvent: false,
    })
    expect(result.status).toBe('SCHEDULED')
    expect(result.animalId).toBe('animal-1')
    expect(consultationRepo.consultations).toHaveLength(1)
  })

  it('should throw NotFoundError for non-existent animal', async () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    await expect(
      useCase.execute('tenant-1', 'vet-1', {
        animalId: 'non-existent',
        scheduledAt: future,
        createCalendarEvent: false,
      })
    ).rejects.toThrow(NotFoundError)
  })

  it('should throw ValidationError for past date', async () => {
    const past = new Date(Date.now() - 86400000).toISOString()
    await expect(
      useCase.execute('tenant-1', 'vet-1', {
        animalId: 'animal-1',
        scheduledAt: past,
        createCalendarEvent: false,
      })
    ).rejects.toThrow(ValidationError)
  })

  it('should create calendar event when createCalendarEvent=true and calendarId provided', async () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    const result = await useCase.execute(
      'tenant-1',
      'vet-1',
      { animalId: 'animal-1', scheduledAt: future, createCalendarEvent: true },
      'cal-id-123'
    )
    expect(calendarService.createdEvents).toHaveLength(1)
    expect(calendarService.createdEvents[0].calendarId).toBe('cal-id-123')
    expect(result.googleCalendarEventId).toBeDefined()
  })

  it('should save consultation even if calendar fails', async () => {
    calendarService.shouldFail = true
    const future = new Date(Date.now() + 86400000).toISOString()
    const result = await useCase.execute(
      'tenant-1',
      'vet-1',
      { animalId: 'animal-1', scheduledAt: future, createCalendarEvent: true },
      'cal-id-123'
    )
    expect(result.status).toBe('SCHEDULED')
    expect(consultationRepo.consultations).toHaveLength(1)
    expect(result.googleCalendarEventId).toBeUndefined()
  })

  it('should not create calendar event when no calendarId provided', async () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    await useCase.execute('tenant-1', 'vet-1', {
      animalId: 'animal-1',
      scheduledAt: future,
      createCalendarEvent: true,
    })
    expect(calendarService.createdEvents).toHaveLength(0)
  })
})
