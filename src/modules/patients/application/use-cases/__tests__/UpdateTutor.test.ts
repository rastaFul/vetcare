import { UpdateTutor } from '../UpdateTutor'
import { ITutorRepository, ListTutorsOptions, ListTutorsResult } from '../../ports/ITutorRepository'
import { Tutor } from '../../../domain/entities/Tutor'
import { NotFoundError, ConflictError, ValidationError } from '@/shared/infrastructure/errors'

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

describe('UpdateTutor', () => {
  let repo: InMemoryTutorRepository
  let useCase: UpdateTutor

  beforeEach(() => {
    repo = new InMemoryTutorRepository()
    useCase = new UpdateTutor(repo)
  })

  it('should update tutor name', async () => {
    const tutor = Tutor.create({ tenantId: 'tenant-1', name: 'João', phone: '11999999999' })
    await repo.save(tutor)

    await useCase.execute(tutor.id, 'tenant-1', { name: 'João Atualizado' })

    const updated = await repo.findById(tutor.id, 'tenant-1')
    expect(updated?.name).toBe('João Atualizado')
  })

  it('should throw NotFoundError when tutor does not exist', async () => {
    await expect(useCase.execute('nonexistent', 'tenant-1', { name: 'X' })).rejects.toThrow(NotFoundError)
  })

  it('should reject invalid CPF on update', async () => {
    const tutor = Tutor.create({ tenantId: 'tenant-1', name: 'João', phone: '11999999999' })
    await repo.save(tutor)

    await expect(useCase.execute(tutor.id, 'tenant-1', { cpf: '111.111.111-11' })).rejects.toThrow(ValidationError)
  })

  it('should reject CPF already used by another tutor', async () => {
    const t1 = Tutor.create({ tenantId: 'tenant-1', name: 'João', phone: '11999999999', cpf: '12345678909' })
    const t2 = Tutor.create({ tenantId: 'tenant-1', name: 'Maria', phone: '11888888888' })
    await repo.save(t1)
    await repo.save(t2)

    await expect(useCase.execute(t2.id, 'tenant-1', { cpf: '123.456.789-09' })).rejects.toThrow(ConflictError)
  })

  it('should allow updating with same CPF (own tutor)', async () => {
    const tutor = Tutor.create({ tenantId: 'tenant-1', name: 'João', phone: '11999999999', cpf: '12345678909' })
    await repo.save(tutor)

    await expect(
      useCase.execute(tutor.id, 'tenant-1', { cpf: '123.456.789-09', name: 'João Novo' })
    ).resolves.not.toThrow()
  })
})
