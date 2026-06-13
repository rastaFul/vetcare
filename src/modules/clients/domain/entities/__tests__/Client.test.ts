import { Client } from '../Client'

describe('Client entity', () => {
  const minimalProps = {
    tenantId: 'tenant-1',
    name: 'João Silva',
    phone: '11999999999',
  }

  it('Client.create() with minimal fields → status ACTIVE, notifyWhatsApp true', () => {
    const client = Client.create(minimalProps)
    expect(client.status).toBe('ACTIVE')
    expect(client.notifyWhatsApp).toBe(true)
    expect(client.notifyEmail).toBe(false)
    expect(client.notifySession).toBe(true)
    expect(client.name).toBe('João Silva')
    expect(client.phone).toBe('11999999999')
    expect(client.tenantId).toBe('tenant-1')
    expect(client.id).toBeDefined()
  })

  it('client.deactivate() → status INACTIVE', () => {
    const client = Client.create(minimalProps)
    client.deactivate()
    expect(client.status).toBe('INACTIVE')
  })

  it('client.activate() → status ACTIVE after deactivate', () => {
    const client = Client.create(minimalProps)
    client.deactivate()
    client.activate()
    expect(client.status).toBe('ACTIVE')
  })

  it('client.address → returns address object with fields', () => {
    const client = Client.create({
      ...minimalProps,
      street: 'Rua das Flores',
      number: '42',
      complement: 'Apto 1',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
    })
    expect(client.address).toEqual({
      street: 'Rua das Flores',
      number: '42',
      complement: 'Apto 1',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
    })
  })
})
