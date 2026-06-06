import { Consultation } from '../Consultation'

describe('Consultation', () => {
  function makeConsultation(overrides = {}) {
    return Consultation.create({
      tenantId: 'tenant-1',
      animalId: 'animal-1',
      veterinarianId: 'vet-1',
      scheduledAt: new Date(Date.now() + 86400000), // tomorrow
      ...overrides,
    })
  }

  it('should create with SCHEDULED status', () => {
    const c = makeConsultation()
    expect(c.status).toBe('SCHEDULED')
  })

  it('should have id after creation', () => {
    const c = makeConsultation()
    expect(c.id).toBeDefined()
    expect(typeof c.id).toBe('string')
  })

  it('should confirm from SCHEDULED', () => {
    const c = makeConsultation()
    c.confirm()
    expect(c.status).toBe('CONFIRMED')
  })

  it('should throw when confirming non-SCHEDULED', () => {
    const c = makeConsultation()
    c.cancel()
    expect(() => c.confirm()).toThrow()
  })

  it('should complete with required fields', () => {
    const c = makeConsultation()
    c.complete({ anamnesis: 'Animal sadio', diagnosis: 'Saudável' })
    expect(c.status).toBe('COMPLETED')
    expect(c.anamnesis).toBe('Animal sadio')
    expect(c.diagnosis).toBe('Saudável')
  })

  it('should throw completing without anamnesis', () => {
    const c = makeConsultation()
    expect(() => c.complete({ anamnesis: '', diagnosis: 'OK' })).toThrow()
  })

  it('should throw completing without diagnosis', () => {
    const c = makeConsultation()
    expect(() => c.complete({ anamnesis: 'OK', diagnosis: '' })).toThrow()
  })

  it('should cancel from SCHEDULED', () => {
    const c = makeConsultation()
    c.cancel()
    expect(c.status).toBe('CANCELLED')
  })

  it('should throw cancelling COMPLETED', () => {
    const c = makeConsultation()
    c.complete({ anamnesis: 'OK', diagnosis: 'OK' })
    expect(() => c.cancel()).toThrow()
  })

  it('should set calendar event id', () => {
    const c = makeConsultation()
    c.setCalendarEventId('event-123')
    expect(c.googleCalendarEventId).toBe('event-123')
  })

  it('should set return event id', () => {
    const c = makeConsultation()
    c.setReturnEventId('return-event-456')
    expect(c.returnEventId).toBe('return-event-456')
  })

  it('should reschedule from SCHEDULED', () => {
    const c = makeConsultation()
    const newDate = new Date(Date.now() + 2 * 86400000)
    c.reschedule(newDate)
    expect(c.scheduledAt).toBe(newDate)
  })

  it('should throw rescheduling COMPLETED consultation', () => {
    const c = makeConsultation()
    c.complete({ anamnesis: 'OK', diagnosis: 'OK' })
    expect(() => c.reschedule(new Date())).toThrow()
  })

  it('should complete with optional returnDate', () => {
    const c = makeConsultation()
    const returnDate = new Date(Date.now() + 7 * 86400000)
    c.complete({ anamnesis: 'OK', diagnosis: 'OK', returnDate })
    expect(c.returnDate).toBe(returnDate)
  })
})
