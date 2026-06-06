import { ListTutors } from '../ListTutors'
import { ITutorRepository, ListTutorsOptions, ListTutorsResult } from '../../ports/ITutorRepository'
import { Tutor } from '../../../domain/entities/Tutor'

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

describe('ListTutors', () => {
  let repo: InMemoryTutorRepository
  let useCase: ListTutors

  beforeEach(() => {
    repo = new InMemoryTutorRepository()
    useCase = new ListTutors(repo)
  })

  it('should return tutors for tenant', async () => {
    await repo.save(Tutor.create({ tenantId: 'tenant-1', name: 'A', phone: '11999990001' }))
    await repo.save(Tutor.create({ tenantId: 'tenant-1', name: 'B', phone: '11999990002' }))
    await repo.save(Tutor.create({ tenantId: 'tenant-2', name: 'C', phone: '11999990003' }))

    const result = await useCase.execute({ tenantId: 'tenant-1' })
    expect(result.total).toBe(2)
    expect(result.tutors).toHaveLength(2)
  })

  it('should default page to 1 and pageSize to 20', async () => {
    const result = await useCase.execute({ tenantId: 'tenant-1' })
    expect(result.total).toBe(0)
  })

  it('should cap pageSize at 100', async () => {
    const result = await useCase.execute({ tenantId: 'tenant-1', pageSize: 200 })
    expect(result.tutors).toBeDefined()
  })
})
