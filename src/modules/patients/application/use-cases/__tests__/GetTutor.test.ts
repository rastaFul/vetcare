import { GetTutor } from '../GetTutor'
import { ITutorRepository, ListTutorsOptions, ListTutorsResult } from '../../ports/ITutorRepository'
import { Tutor } from '../../../domain/entities/Tutor'
import { NotFoundError } from '@/shared/infrastructure/errors'

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

  async list(options: ListTutorsOptions): Promise<ListTutorsResult> {
    const filtered = this.tutors.filter((t) => t.tenantId === options.tenantId)
    return { tutors: filtered, total: filtered.length }
  }

  async update(tutor: Tutor): Promise<void> {
    const i = this.tutors.findIndex((t) => t.id === tutor.id)
    if (i >= 0) this.tutors[i] = tutor
  }
}

describe('GetTutor', () => {
  let repo: InMemoryTutorRepository
  let useCase: GetTutor

  beforeEach(() => {
    repo = new InMemoryTutorRepository()
    useCase = new GetTutor(repo)
  })

  it('should return tutor by id', async () => {
    const tutor = Tutor.create({ tenantId: 'tenant-1', name: 'João', phone: '11999999999' })
    await repo.save(tutor)

    const found = await useCase.execute(tutor.id, 'tenant-1')
    expect(found.id).toBe(tutor.id)
    expect(found.name).toBe('João')
  })

  it('should throw NotFoundError when tutor does not exist', async () => {
    await expect(useCase.execute('nonexistent-id', 'tenant-1')).rejects.toThrow(NotFoundError)
  })

  it('should throw NotFoundError when tutor belongs to different tenant', async () => {
    const tutor = Tutor.create({ tenantId: 'tenant-2', name: 'João', phone: '11999999999' })
    await repo.save(tutor)

    await expect(useCase.execute(tutor.id, 'tenant-1')).rejects.toThrow(NotFoundError)
  })
})
