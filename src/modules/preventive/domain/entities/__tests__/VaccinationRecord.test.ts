import { VaccinationRecord } from '../VaccinationRecord'

describe('VaccinationRecord', () => {
  it('should create with required data', () => {
    const record = VaccinationRecord.create({
      tenantId: 'tenant-1',
      animalId: 'animal-1',
      vaccine: 'V10',
      appliedAt: new Date('2026-01-01'),
    })
    expect(record.vaccine).toBe('V10')
    expect(record.tenantId).toBe('tenant-1')
    expect(record.animalId).toBe('animal-1')
    expect(record.googleCalendarEventId).toBeUndefined()
    expect(record.id).toBeDefined()
    expect(record.createdAt).toBeInstanceOf(Date)
  })

  it('should create with optional fields', () => {
    const record = VaccinationRecord.create({
      tenantId: 't',
      animalId: 'a',
      vaccine: 'V8',
      appliedAt: new Date('2026-01-01'),
      nextDoseAt: new Date('2027-01-01'),
      batchNumber: 'LOT-123',
      manufacturer: 'MSD',
      observations: 'sem reações',
    })
    expect(record.nextDoseAt).toEqual(new Date('2027-01-01'))
    expect(record.batchNumber).toBe('LOT-123')
    expect(record.manufacturer).toBe('MSD')
    expect(record.observations).toBe('sem reações')
  })

  it('should set calendar event id', () => {
    const record = VaccinationRecord.create({
      tenantId: 't',
      animalId: 'a',
      vaccine: 'V10',
      appliedAt: new Date(),
    })
    record.setCalendarEventId('evt-123')
    expect(record.googleCalendarEventId).toBe('evt-123')
  })

  it('should accept provided id', () => {
    const record = VaccinationRecord.create(
      { tenantId: 't', animalId: 'a', vaccine: 'V10', appliedAt: new Date() },
      'specific-id'
    )
    expect(record.id).toBe('specific-id')
  })
})
