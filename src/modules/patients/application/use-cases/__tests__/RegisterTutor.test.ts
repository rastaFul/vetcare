import { RegisterTutor } from '../RegisterTutor'
import { ITutorRepository } from '../../ports/ITutorRepository'
import { Tutor } from '../../../domain/entities/Tutor'
import { ConflictError, ValidationError } from '@/shared/infrastructure/errors'

class InMemoryTutorRepository implements ITutorRepository {
  private tutors: Tutor[] = []

  async save(tutor: Tutor): Promise<void> {
    this.tutors.push(tutor)
  }

  async findById(id: string, tenantId: string): Promise<Tutor | null> {
    return this.tutors.find((t) => t.id === id && t.tenantId === tenantId) ?? null
  }

  async findByCpf(cpf: string, tenantId: string): Promise<Tutor | null> {
    return this.tutors.find((t) => t.cpf === cpf && t.tenantId === tenantId) ?? null
  }

  async list(): Promise<{ tutors: Tutor[]; total: number }> {
    return { tutors: this.tutors, total: this.tutors.length }
  }

  async update(tutor: Tutor): Promise<void> {
    const i = this.tutors.findIndex((t) => t.id === tutor.id)
    if (i >= 0) this.tutors[i] = tutor
  }
}

describe('RegisterTutor', () => {
  let repo: InMemoryTutorRepository
  let useCase: RegisterTutor

  beforeEach(() => {
    repo = new InMemoryTutorRepository()
    useCase = new RegisterTutor(repo)
  })

  it('should register tutor with valid data', async () => {
    const tutor = await useCase.execute('tenant-1', {
      name: 'João Silva',
      phone: '11999999999',
    })
    expect(tutor.name).toBe('João Silva')
    expect(tutor.tenantId).toBe('tenant-1')
    expect(tutor.status).toBe('ACTIVE')
  })

  it('should register tutor without CPF', async () => {
    const tutor = await useCase.execute('tenant-1', {
      name: 'Maria',
      phone: '11999999999',
    })
    expect(tutor.cpf).toBeUndefined()
  })

  it('should reject invalid CPF', async () => {
    await expect(
      useCase.execute('tenant-1', {
        name: 'João',
        phone: '11999999999',
        cpf: '111.111.111-11',
      })
    ).rejects.toThrow(ValidationError)
  })

  it('should reject duplicate CPF in same tenant', async () => {
    await useCase.execute('tenant-1', {
      name: 'João',
      phone: '11999999999',
      cpf: '123.456.789-09',
    })
    await expect(
      useCase.execute('tenant-1', {
        name: 'Outro',
        phone: '11888888888',
        cpf: '123.456.789-09',
      })
    ).rejects.toThrow(ConflictError)
  })

  it('should allow same CPF in different tenant', async () => {
    await useCase.execute('tenant-1', { name: 'João', phone: '11999999999', cpf: '123.456.789-09' })
    const t2 = await useCase.execute('tenant-2', {
      name: 'Maria',
      phone: '11888888888',
      cpf: '123.456.789-09',
    })
    expect(t2.name).toBe('Maria')
  })
})
