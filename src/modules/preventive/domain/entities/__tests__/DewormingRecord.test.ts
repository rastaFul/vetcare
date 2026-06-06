import { DewormingRecord } from '../DewormingRecord'

describe('DewormingRecord', () => {
  it('should create with required data', () => {
    const record = DewormingRecord.create({
      tenantId: 'tenant-1',
      animalId: 'animal-1',
      medication: 'Drontal Plus',
      appliedAt: new Date('2026-01-01'),
    })
    expect(record.medication).toBe('Drontal Plus')
    expect(record.tenantId).toBe('tenant-1')
    expect(record.animalId).toBe('animal-1')
    expect(record.googleCalendarEventId).toBeUndefined()
    expect(record.id).toBeDefined()
    expect(record.createdAt).toBeInstanceOf(Date)
  })

  it('should create with optional fields', () => {
    const record = DewormingRecord.create({
      tenantId: 't',
      animalId: 'a',
      medication: 'Milbemax',
      appliedAt: new Date('2026-01-01'),
      nextApplicationAt: new Date('2026-04-01'),
      observations: 'aplicado em jejum',
    })
    expect(record.nextApplicationAt).toEqual(new Date('2026-04-01'))
    expect(record.observations).toBe('aplicado em jejum')
  })

  it('should set calendar event id', () => {
    const record = DewormingRecord.create({
      tenantId: 't',
      animalId: 'a',
      medication: 'Drontal',
      appliedAt: new Date(),
    })
    record.setCalendarEventId('evt-456')
    expect(record.googleCalendarEventId).toBe('evt-456')
  })
})
