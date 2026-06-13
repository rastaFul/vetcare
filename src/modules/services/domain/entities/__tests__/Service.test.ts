import { Service } from '../Service'

describe('Service entity', () => {
  const baseProps = {
    tenantId: 'tenant-1',
    name: 'Massagem Relaxante',
    durationMin: 60,
    price: 150,
  }

  it('Service.create() → active true, sortOrder 0', () => {
    const service = Service.create(baseProps)
    expect(service.active).toBe(true)
    expect(service.sortOrder).toBe(0)
    expect(service.name).toBe('Massagem Relaxante')
    expect(service.durationMin).toBe(60)
    expect(service.price).toBe(150)
  })

  it('service.deactivate() → active false', () => {
    const service = Service.create(baseProps)
    service.deactivate()
    expect(service.active).toBe(false)
  })

  it('service.activate() → active true', () => {
    const service = Service.create(baseProps)
    service.deactivate()
    service.activate()
    expect(service.active).toBe(true)
  })
})
