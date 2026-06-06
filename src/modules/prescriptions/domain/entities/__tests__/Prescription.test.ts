import { Prescription } from '../Prescription'

describe('Prescription', () => {
  const validProps = {
    tenantId: 'tenant-1',
    consultationId: 'consultation-1',
    animalId: 'animal-1',
    veterinarianId: 'vet-1',
    diagnosis: 'Otite bilateral',
    items: [{ medication: 'Ouvidor', dosage: '3 gotas', frequency: '3x/dia', duration: '7 dias' }],
  }

  it('should create prescription with valid items', () => {
    const p = Prescription.create(validProps)
    expect(p.diagnosis).toBe('Otite bilateral')
    expect(p.items).toHaveLength(1)
    expect(p.pdfUrl).toBeUndefined()
  })

  it('should throw when items is empty', () => {
    expect(() => Prescription.create({ ...validProps, items: [] })).toThrow(
      'Receita deve ter pelo menos um item'
    )
  })

  it('should set pdf url', () => {
    const p = Prescription.create(validProps)
    p.setPdfUrl('/uploads/prescriptions/123.pdf')
    expect(p.pdfUrl).toBe('/uploads/prescriptions/123.pdf')
    expect(p.pdfGeneratedAt).toBeDefined()
  })

  it('should have an id after creation', () => {
    const p = Prescription.create(validProps)
    expect(p.id).toBeDefined()
    expect(p.id.length).toBeGreaterThan(0)
  })

  it('should use provided id', () => {
    const p = Prescription.create(validProps, 'custom-id')
    expect(p.id).toBe('custom-id')
  })

  it('should expose all props as getters', () => {
    const p = Prescription.create({
      ...validProps,
      observations: 'Some notes',
    })
    expect(p.tenantId).toBe('tenant-1')
    expect(p.consultationId).toBe('consultation-1')
    expect(p.animalId).toBe('animal-1')
    expect(p.veterinarianId).toBe('vet-1')
    expect(p.observations).toBe('Some notes')
    expect(p.createdAt).toBeInstanceOf(Date)
  })

  it('should support multiple items', () => {
    const p = Prescription.create({
      ...validProps,
      items: [
        { medication: 'Med1', dosage: '1 cp', frequency: '1x/dia', duration: '5 dias' },
        { medication: 'Med2', dosage: '2 cp', frequency: '2x/dia', duration: '10 dias', instructions: 'Com agua' },
      ],
    })
    expect(p.items).toHaveLength(2)
    expect(p.items[1].instructions).toBe('Com agua')
  })
})
