import { ApplyVaccination } from '../ApplyVaccination'
import { IVaccinationRepository } from '../../ports/IVaccinationRepository'
import { IAnimalRepository } from '@/modules/patients/application/ports/IAnimalRepository'
import { ICalendarService, CalendarEventDTO } from '@/modules/clinical/application/ports/ICalendarService'
import { VaccinationRecord } from '../../../domain/entities/VaccinationRecord'
import { Animal } from '@/modules/patients/domain/entities/Animal'
import { NotFoundError } from '@/shared/infrastructure/errors'

class InMemoryVaccinationRepository implements IVaccinationRepository {
  records: VaccinationRecord[] = []

  async save(record: VaccinationRecord): Promise<void> {
    const idx = this.records.findIndex((r) => r.id === record.id)
    if (idx >= 0) this.records[idx] = record
    else this.records.push(record)
  }

  async findById(id: string): Promise<VaccinationRecord | null> {
    return this.records.find((r) => r.id === id) ?? null
  }

  async findByAnimal(animalId: string, tenantId: string): Promise<VaccinationRecord[]> {
    return this.records.filter((r) => r.animalId === animalId && r.tenantId === tenantId)
  }

  async delete(id: string): Promise<void> {
    this.records = this.records.filter((r) => r.id !== id)
  }

  async findUpcoming(tenantId: string, daysAhead: number): Promise<VaccinationRecord[]> {
    const now = new Date()
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
    return this.records.filter(
      (r) => r.tenantId === tenantId && r.nextDoseAt && r.nextDoseAt >= now && r.nextDoseAt <= future
    )
  }
}

class InMemoryAnimalRepository implements IAnimalRepository {
  private animals: Animal[] = []

  addAnimal(animal: Animal) {
    this.animals.push(animal)
  }

  async save(animal: Animal): Promise<void> {
    this.animals.push(animal)
  }

  async findById(id: string, tenantId: string): Promise<Animal | null> {
    return this.animals.find((a) => a.id === id && a.tenantId === tenantId) ?? null
  }

  async list(): Promise<{ animals: Animal[]; total: number }> {
    return { animals: this.animals, total: this.animals.length }
  }

  async update(animal: Animal): Promise<void> {
    const i = this.animals.findIndex((a) => a.id === animal.id)
    if (i >= 0) this.animals[i] = animal
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.animals.filter((a) => a.tenantId === tenantId).length
  }
}

class MockCalendarService implements ICalendarService {
  calls: { dto: CalendarEventDTO; token: string }[] = []
  shouldFail = false

  async createEvent(dto: CalendarEventDTO, accessToken: string): Promise<string> {
    this.calls.push({ dto, token: accessToken })
    return 'cal-event-id'
  }

  async updateEvent(): Promise<void> {}

  async deleteEvent(): Promise<void> {}

  async createReminder(dto: CalendarEventDTO, accessToken: string): Promise<string> {
    if (this.shouldFail) throw new Error('Calendar API error')
    this.calls.push({ dto, token: accessToken })
    return 'cal-reminder-id'
  }
}

function makeAnimal(id = 'animal-1', tenantId = 'tenant-1') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (Animal as any)(
    {
      tenantId,
      tutorId: 'tutor-1',
      name: 'Rex',
      species: 'DOG',
      sex: 'MALE',
      castrated: false,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    id
  )
}

describe('ApplyVaccination', () => {
  let vaccinationRepo: InMemoryVaccinationRepository
  let animalRepo: InMemoryAnimalRepository
  let calendarService: MockCalendarService
  let useCase: ApplyVaccination

  beforeEach(() => {
    vaccinationRepo = new InMemoryVaccinationRepository()
    animalRepo = new InMemoryAnimalRepository()
    calendarService = new MockCalendarService()
    useCase = new ApplyVaccination(vaccinationRepo, animalRepo, calendarService)
  })

  it('should create vaccination record for valid animal', async () => {
    animalRepo.addAnimal(makeAnimal())
    const result = await useCase.execute('tenant-1', {
      animalId: 'animal-1',
      vaccine: 'V10',
      appliedAt: '2026-01-01',
      createReminder: false,
    })
    expect(result.vaccine).toBe('V10')
    expect(result.animalId).toBe('animal-1')
    expect(result.tenantId).toBe('tenant-1')
    expect(vaccinationRepo.records).toHaveLength(1)
  })

  it('should throw NotFoundError when animal not found', async () => {
    await expect(
      useCase.execute('tenant-1', {
        animalId: 'nonexistent',
        vaccine: 'V10',
        appliedAt: '2026-01-01',
        createReminder: false,
      })
    ).rejects.toThrow(NotFoundError)
  })

  it('should create calendar reminder when requested with nextDoseAt and token', async () => {
    animalRepo.addAnimal(makeAnimal())
    const result = await useCase.execute(
      'tenant-1',
      {
        animalId: 'animal-1',
        vaccine: 'V10',
        appliedAt: '2026-01-01',
        nextDoseAt: '2027-01-01',
        createReminder: true,
      },
      'cal-token'
    )
    expect(calendarService.calls).toHaveLength(1)
    expect(calendarService.calls[0].token).toBe('cal-token')
    expect(result.googleCalendarEventId).toBe('cal-reminder-id')
  })

  it('should create record even when calendar fails', async () => {
    animalRepo.addAnimal(makeAnimal())
    calendarService.shouldFail = true
    const result = await useCase.execute(
      'tenant-1',
      {
        animalId: 'animal-1',
        vaccine: 'V10',
        appliedAt: '2026-01-01',
        nextDoseAt: '2027-01-01',
        createReminder: true,
      },
      'cal-token'
    )
    expect(result.vaccine).toBe('V10')
    expect(result.googleCalendarEventId).toBeUndefined()
  })

  it('should not call calendar when createReminder is false', async () => {
    animalRepo.addAnimal(makeAnimal())
    await useCase.execute('tenant-1', {
      animalId: 'animal-1',
      vaccine: 'V10',
      appliedAt: '2026-01-01',
      nextDoseAt: '2027-01-01',
      createReminder: false,
    })
    expect(calendarService.calls).toHaveLength(0)
  })

  it('should work with null calendar service', async () => {
    const useCaseNoCalendar = new ApplyVaccination(vaccinationRepo, animalRepo, null)
    animalRepo.addAnimal(makeAnimal())
    const result = await useCaseNoCalendar.execute('tenant-1', {
      animalId: 'animal-1',
      vaccine: 'V8',
      appliedAt: '2026-01-01',
      createReminder: false,
    })
    expect(result.vaccine).toBe('V8')
  })
})
