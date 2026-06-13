import { ClientHealthRecord } from '../ClientHealthRecord'

describe('ClientHealthRecord entity', () => {
  const baseProps = {
    tenantId: 'tenant-1',
    clientId: 'client-1',
  }

  it('ClientHealthRecord.create() sets updatedAt', () => {
    const before = new Date()
    const record = ClientHealthRecord.create(baseProps)
    expect(record.clientId).toBe('client-1')
    expect(record.tenantId).toBe('tenant-1')
    expect(record.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
  })

  it('record.update() updates fields and updatedAt', () => {
    const record = ClientHealthRecord.create(baseProps)
    const before = record.updatedAt
    record.update({ pathologies: 'Hipertensão', objectives: 'Relaxamento' })
    expect(record.pathologies).toBe('Hipertensão')
    expect(record.objectives).toBe('Relaxamento')
    expect(record.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
  })
})
