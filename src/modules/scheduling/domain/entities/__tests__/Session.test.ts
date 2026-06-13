import { Session } from '../Session'

describe('Session entity', () => {
  const baseProps = {
    tenantId: 'tenant-1',
    clientId: 'client-1',
    therapistId: 'user-1',
    scheduledAt: new Date('2026-07-01T10:00:00Z'),
  }

  it('Session.create() → status SCHEDULED', () => {
    const session = Session.create(baseProps)
    expect(session.status).toBe('SCHEDULED')
    expect(session.clientId).toBe('client-1')
    expect(session.therapistId).toBe('user-1')
  })

  it('session.confirm() → status CONFIRMED', () => {
    const session = Session.create(baseProps)
    session.confirm()
    expect(session.status).toBe('CONFIRMED')
  })

  it('session.confirm() throws if not SCHEDULED', () => {
    const session = Session.create(baseProps)
    session.confirm()
    expect(() => session.confirm()).toThrow('Session must be SCHEDULED to confirm')
  })

  it('session.complete() → status COMPLETED with notes and price', () => {
    const session = Session.create(baseProps)
    session.complete('Sessão excelente', 150)
    expect(session.status).toBe('COMPLETED')
    expect(session.notes).toBe('Sessão excelente')
    expect(session.priceCharged).toBe(150)
  })

  it('session.complete() throws if CANCELLED', () => {
    const session = Session.create(baseProps)
    session.cancel()
    expect(() => session.complete()).toThrow('Cannot complete a cancelled session')
  })

  it('session.cancel() → status CANCELLED', () => {
    const session = Session.create(baseProps)
    session.cancel()
    expect(session.status).toBe('CANCELLED')
  })

  it('session.cancel() throws if COMPLETED', () => {
    const session = Session.create(baseProps)
    session.complete()
    expect(() => session.cancel()).toThrow('Cannot cancel a completed session')
  })

  it('session.reschedule() → updates scheduledAt, back to SCHEDULED', () => {
    const session = Session.create(baseProps)
    session.confirm()
    const newDate = new Date('2026-07-15T10:00:00Z')
    session.reschedule(newDate)
    expect(session.scheduledAt).toEqual(newDate)
    expect(session.status).toBe('SCHEDULED')
  })

  it('session.reschedule() throws if CANCELLED', () => {
    const session = Session.create(baseProps)
    session.cancel()
    expect(() => session.reschedule(new Date())).toThrow('Cannot reschedule a cancelled or completed session')
  })

  it('session.address → returns address object', () => {
    const session = Session.create({ ...baseProps, street: 'Rua A', city: 'SP' })
    expect(session.address).toMatchObject({ street: 'Rua A', city: 'SP' })
  })
})
