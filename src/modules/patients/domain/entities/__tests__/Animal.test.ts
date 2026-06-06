import { Animal } from '../Animal'

describe('Animal', () => {
  const validProps = {
    tenantId: 'tenant-1',
    tutorId: 'tutor-1',
    name: 'Rex',
    species: 'DOG' as const,
    sex: 'MALE' as const,
    castrated: false,
  }

  it('should create animal with active status', () => {
    const animal = Animal.create(validProps)
    expect(animal.status).toBe('ACTIVE')
    expect(animal.name).toBe('Rex')
  })

  it('should calculate age correctly', () => {
    const birth = new Date()
    birth.setFullYear(birth.getFullYear() - 3)
    const animal = Animal.create({ ...validProps, birthDate: birth })
    expect(animal.ageInYears).toBe(3)
  })

  it('should return undefined age when no birthDate', () => {
    const animal = Animal.create(validProps)
    expect(animal.ageInYears).toBeUndefined()
  })

  it('should change status', () => {
    const animal = Animal.create(validProps)
    animal.changeStatus('DECEASED')
    expect(animal.status).toBe('DECEASED')
    expect(animal.isActive).toBe(false)
  })

  it('should update fields', () => {
    const animal = Animal.create(validProps)
    animal.update({ name: 'Bobby', weightKg: 25 })
    expect(animal.name).toBe('Bobby')
    expect(animal.weightKg).toBe(25)
  })

  it('should set photo url', () => {
    const animal = Animal.create(validProps)
    animal.setPhotoUrl('/uploads/animals/photo.jpg')
    expect(animal.photoUrl).toBe('/uploads/animals/photo.jpg')
  })

  it('should have isActive true when ACTIVE', () => {
    const animal = Animal.create(validProps)
    expect(animal.isActive).toBe(true)
  })

  it('should create with explicit id', () => {
    const animal = Animal.create(validProps, 'my-id')
    expect(animal.id).toBe('my-id')
  })
})
