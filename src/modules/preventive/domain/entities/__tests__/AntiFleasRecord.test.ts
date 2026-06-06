import { AntiFleasRecord } from '../AntiFleasRecord'

describe('AntiFleasRecord', () => {
  it('should create with required data', () => {
    const record = AntiFleasRecord.create({
      tenantId: 'tenant-1',
      animalId: 'animal-1',
      medication: 'Frontline',
      appliedAt: new Date('2026-01-01'),
    })
    expect(record.medication).toBe('Frontline')
    expect(record.tenantId).toBe('tenant-1')
    expect(record.animalId).toBe('animal-1')
    expect(record.googleCalendarEventId).toBeUndefined()
    expect(record.id).toBeDefined()
    expect(record.createdAt).toBeInstanceOf(Date)
  })

  it('should create with optional fields', () => {
    const record = AntiFleasRecord.create({
      tenantId: 't',
      animalId: 'a',
      medication: 'NexGard',
      appliedAt: new Date('2026-01-01'),
      nextApplicationAt: new Date('2026-02-01'),
      observations: 'produto externo',
    })
    expect(record.nextApplicationAt).toEqual(new Date('2026-02-01'))
    expect(record.observations).toBe('produto externo')
  })

  it('should set calendar event id', () => {
    const record = AntiFleasRecord.create({
      tenantId: 't',
      animalId: 'a',
      medication: 'Bravecto',
      appliedAt: new Date(),
    })
    record.setCalendarEventId('evt-789')
    expect(record.googleCalendarEventId).toBe('evt-789')
  })
})
