import { UploadAttachment } from '../UploadAttachment'
import { IAttachmentRepository } from '../../ports/IAttachmentRepository'
import { IStorageService } from '../../ports/IStorageService'
import { IAnimalRepository } from '@/modules/patients/application/ports/IAnimalRepository'
import { Attachment } from '../../../domain/entities/Attachment'
import { Animal } from '@/modules/patients/domain/entities/Animal'
import { NotFoundError, ValidationError } from '@/shared/infrastructure/errors'

class MockStorage implements IStorageService {
  async upload(_f: Buffer, key: string, _m: string) {
    return { storageKey: key, url: `/uploads/${key}` }
  }
  async getDownloadUrl(k: string) {
    return `/uploads/${k}`
  }
  async delete(_k: string) {}
}

class MockAttachmentRepo implements IAttachmentRepository {
  items: Attachment[] = []
  async save(a: Attachment) {
    this.items.push(a)
  }
  async findById(id: string, tenantId: string) {
    return this.items.find((x) => x.id === id && x.tenantId === tenantId) ?? null
  }
  async list() {
    return this.items
  }
  async delete(id: string) {
    this.items = this.items.filter((x) => x.id !== id)
  }
}

class MockAnimalRepo implements IAnimalRepository {
  animals: Animal[] = []
  async save(a: Animal) {
    this.animals.push(a)
  }
  async findById(id: string, tenantId: string) {
    return this.animals.find((x) => x.id === id && x.tenantId === tenantId) ?? null
  }
  async list() {
    return { animals: this.animals, total: this.animals.length }
  }
  async update(a: Animal) {
    const i = this.animals.findIndex((x) => x.id === a.id)
    if (i >= 0) this.animals[i] = a
  }
  async countByTenant(tenantId: string) {
    return this.animals.filter((a) => a.tenantId === tenantId).length
  }
}

describe('UploadAttachment', () => {
  let attachRepo: MockAttachmentRepo
  let animalRepo: MockAnimalRepo
  let storage: MockStorage
  let useCase: UploadAttachment
  let animal: Animal

  beforeEach(() => {
    attachRepo = new MockAttachmentRepo()
    animalRepo = new MockAnimalRepo()
    storage = new MockStorage()
    useCase = new UploadAttachment(attachRepo, animalRepo, storage)
    animal = Animal.create(
      {
        tenantId: 'tenant-1',
        tutorId: 'tutor-1',
        name: 'Rex',
        species: 'DOG',
        sex: 'MALE',
        castrated: false,
      },
      'animal-uuid-1'
    )
    animalRepo.animals.push(animal)
  })

  it('should upload valid file', async () => {
    const result = await useCase.execute(
      'tenant-1',
      'user-1',
      { animalId: 'animal-uuid-1', type: 'EXAM' },
      { buffer: Buffer.from('content'), originalName: 'exam.pdf', mimeType: 'application/pdf', size: 100 }
    )
    expect(result.name).toBe('exam.pdf')
    expect(result.animalId).toBe('animal-uuid-1')
    expect(attachRepo.items).toHaveLength(1)
  })

  it('should reject invalid mime type', async () => {
    await expect(
      useCase.execute(
        'tenant-1',
        'user-1',
        { animalId: 'animal-uuid-1', type: 'EXAM' },
        {
          buffer: Buffer.from('x'),
          originalName: 'file.exe',
          mimeType: 'application/x-executable',
          size: 10,
        }
      )
    ).rejects.toThrow(ValidationError)
  })

  it('should reject file too large', async () => {
    await expect(
      useCase.execute(
        'tenant-1',
        'user-1',
        { animalId: 'animal-uuid-1', type: 'EXAM' },
        {
          buffer: Buffer.alloc(11 * 1024 * 1024),
          originalName: 'big.pdf',
          mimeType: 'application/pdf',
          size: 11 * 1024 * 1024,
        }
      )
    ).rejects.toThrow(ValidationError)
  })

  it('should reject if animal not found', async () => {
    await expect(
      useCase.execute(
        'tenant-1',
        'user-1',
        { animalId: 'non-existent', type: 'EXAM' },
        { buffer: Buffer.from('x'), originalName: 'f.pdf', mimeType: 'application/pdf', size: 10 }
      )
    ).rejects.toThrow(NotFoundError)
  })
})
