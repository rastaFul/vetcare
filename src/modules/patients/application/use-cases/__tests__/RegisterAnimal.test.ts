import { RegisterAnimal } from '../RegisterAnimal'
import { IAnimalRepository, ListAnimalsOptions } from '../../ports/IAnimalRepository'
import { ITutorRepository, ListTutorsOptions } from '../../ports/ITutorRepository'
import { Animal } from '../../../domain/entities/Animal'
import { Tutor } from '../../../domain/entities/Tutor'
import { NotFoundError, ValidationError } from '@/shared/infrastructure/errors'

class InMemoryAnimalRepository implements IAnimalRepository {
  animals: Animal[] = []
  async save(a: Animal) { this.animals.push(a) }
  async findById(id: string, tenantId: string) { return this.animals.find(a => a.id === id && a.tenantId === tenantId) ?? null }
  async list(_opts: ListAnimalsOptions) { return { animals: this.animals, total: this.animals.length } }
  async update(a: Animal) { const i = this.animals.findIndex(x => x.id === a.id); if (i >= 0) this.animals[i] = a }
  async countByTenant(tenantId: string) { return this.animals.filter(a => a.tenantId === tenantId).length }
}

class InMemoryTutorRepository implements ITutorRepository {
  tutors: Tutor[] = []
  async save(t: Tutor) { this.tutors.push(t) }
  async findById(id: string, tenantId: string) { return this.tutors.find(t => t.id === id && t.tenantId === tenantId) ?? null }
  async findByCpf(_cpf: string, _tenantId: string): Promise<Tutor | null> { return null }
  async list(_opts: ListTutorsOptions) { return { tutors: this.tutors, total: this.tutors.length } }
  async update(_t: Tutor) { /* no-op */ }
}

describe('RegisterAnimal', () => {
  let animalRepo: InMemoryAnimalRepository
  let tutorRepo: InMemoryTutorRepository
  let useCase: RegisterAnimal
  let tutor: Tutor

  beforeEach(() => {
    animalRepo = new InMemoryAnimalRepository()
    tutorRepo = new InMemoryTutorRepository()
    useCase = new RegisterAnimal(animalRepo, tutorRepo)
    tutor = Tutor.create({ tenantId: 'tenant-1', name: 'João', phone: '11999999999' }, 'tutor-uuid-1')
    tutorRepo.tutors.push(tutor)
  })

  it('should register animal with valid tutor', async () => {
    const animal = await useCase.execute('tenant-1', {
      tutorId: 'tutor-uuid-1',
      name: 'Rex',
      species: 'DOG',
      sex: 'MALE',
      castrated: false,
    })
    expect(animal.name).toBe('Rex')
    expect(animal.tutorId).toBe('tutor-uuid-1')
    expect(animal.status).toBe('ACTIVE')
  })

  it('should reject if tutor does not exist', async () => {
    await expect(
      useCase.execute('tenant-1', {
        tutorId: 'non-existent',
        name: 'Rex',
        species: 'DOG',
        sex: 'MALE',
        castrated: false,
      })
    ).rejects.toThrow(NotFoundError)
  })

  it('should reject negative weight', async () => {
    await expect(
      useCase.execute('tenant-1', {
        tutorId: 'tutor-uuid-1',
        name: 'Rex',
        species: 'DOG',
        sex: 'MALE',
        castrated: false,
        weightKg: -1,
      })
    ).rejects.toThrow(ValidationError)
  })

  it('should reject tutor from different tenant', async () => {
    await expect(
      useCase.execute('tenant-2', {
        tutorId: 'tutor-uuid-1',
        name: 'Rex',
        species: 'DOG',
        sex: 'MALE',
        castrated: false,
      })
    ).rejects.toThrow(NotFoundError)
  })
})
