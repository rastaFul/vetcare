import { CreatePrescription } from '../CreatePrescription'
import { Prescription } from '../../../domain/entities/Prescription'
import { IPrescriptionRepository } from '../../ports/IPrescriptionRepository'
import { IConsultationRepository } from '@/modules/clinical/application/ports/IConsultationRepository'
import { Consultation } from '@/modules/clinical/domain/entities/Consultation'
import { NotFoundError } from '@/shared/infrastructure/errors'

jest.mock('../../../infrastructure/pdf/PrescriptionPdfGenerator', () => ({
  generatePrescriptionPdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf')),
}))

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}))

class InMemoryPrescriptionRepository implements IPrescriptionRepository {
  private store: Prescription[] = []

  async save(p: Prescription): Promise<void> {
    this.store.push(p)
  }

  async findById(id: string, tenantId: string): Promise<Prescription | null> {
    return this.store.find((p) => p.id === id && p.tenantId === tenantId) ?? null
  }

  async findByAnimal(animalId: string, tenantId: string): Promise<Prescription[]> {
    return this.store.filter((p) => p.animalId === animalId && p.tenantId === tenantId)
  }

  async findByConsultation(consultationId: string, tenantId: string): Promise<Prescription[]> {
    return this.store.filter((p) => p.consultationId === consultationId && p.tenantId === tenantId)
  }

  async update(p: Prescription): Promise<void> {
    const idx = this.store.findIndex((x) => x.id === p.id)
    if (idx >= 0) this.store[idx] = p
  }
}

class InMemoryConsultationRepository implements Partial<IConsultationRepository> {
  private store: Consultation[] = []

  addConsultation(c: Consultation) {
    this.store.push(c)
  }

  async save(c: Consultation): Promise<void> {
    this.store.push(c)
  }

  async findById(id: string, tenantId: string): Promise<Consultation | null> {
    return this.store.find((c) => c.id === id && c.tenantId === tenantId) ?? null
  }

  async list() {
    return { consultations: this.store, total: this.store.length }
  }

  async update(): Promise<void> {}
  async findTodayConsultations(): Promise<Consultation[]> { return [] }
  async findUpcomingReturns(): Promise<Consultation[]> { return [] }
}

describe('CreatePrescription', () => {
  let prescriptionRepo: InMemoryPrescriptionRepository
  let consultationRepo: InMemoryConsultationRepository
  let useCase: CreatePrescription

  const tenantId = 'tenant-1'
  const veterinarianId = 'vet-1'

  beforeEach(() => {
    prescriptionRepo = new InMemoryPrescriptionRepository()
    consultationRepo = new InMemoryConsultationRepository()
    useCase = new CreatePrescription(
      prescriptionRepo,
      consultationRepo as unknown as IConsultationRepository
    )
  })

  function makeConsultation(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new (Consultation as any)(
      {
        tenantId,
        animalId: 'animal-1',
        veterinarianId,
        scheduledAt: new Date('2024-01-15'),
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    ) as Consultation
  }

  it('should create prescription when consultation exists', async () => {
    const consultation = makeConsultation('consult-1')
    consultationRepo.addConsultation(consultation)

    const result = await useCase.execute(tenantId, veterinarianId, {
      consultationId: 'consult-1',
      diagnosis: 'Otite bilateral',
      items: [
        { medication: 'Ouvidor', dosage: '3 gotas', frequency: '3x/dia', duration: '7 dias' },
      ],
    })

    expect(result).toBeInstanceOf(Prescription)
    expect(result.diagnosis).toBe('Otite bilateral')
    expect(result.animalId).toBe('animal-1')
    expect(result.items).toHaveLength(1)
  })

  it('should throw NotFoundError when consultation not found', async () => {
    await expect(
      useCase.execute(tenantId, veterinarianId, {
        consultationId: 'non-existent',
        diagnosis: 'Test',
        items: [{ medication: 'Med', dosage: '1 cp', frequency: '1x/dia', duration: '5 dias' }],
      })
    ).rejects.toThrow(NotFoundError)
  })

  it('should throw when items is empty', async () => {
    const consultation = makeConsultation('consult-2')
    consultationRepo.addConsultation(consultation)

    await expect(
      useCase.execute(tenantId, veterinarianId, {
        consultationId: 'consult-2',
        diagnosis: 'Test',
        items: [],
      })
    ).rejects.toThrow()
  })

  it('should save prescription to repository', async () => {
    const consultation = makeConsultation('consult-3')
    consultationRepo.addConsultation(consultation)

    await useCase.execute(tenantId, veterinarianId, {
      consultationId: 'consult-3',
      diagnosis: 'Diagnóstico teste',
      items: [{ medication: 'Med', dosage: '1 cp', frequency: '2x/dia', duration: '7 dias' }],
    })

    const saved = await prescriptionRepo.findByConsultation('consult-3', tenantId)
    expect(saved).toHaveLength(1)
    expect(saved[0].diagnosis).toBe('Diagnóstico teste')
  })
})
