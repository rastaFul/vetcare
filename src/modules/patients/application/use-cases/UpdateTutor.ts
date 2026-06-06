import { ITutorRepository } from '../ports/ITutorRepository'
import { UpdateTutorInput } from '../dtos/TutorDTO'
import { CPF } from '../../domain/value-objects/CPF'
import { NotFoundError, ConflictError, ValidationError } from '@/shared/infrastructure/errors'

export class UpdateTutor {
  constructor(private readonly tutorRepo: ITutorRepository) {}

  async execute(id: string, tenantId: string, input: UpdateTutorInput): Promise<void> {
    const tutor = await this.tutorRepo.findById(id, tenantId)
    if (!tutor) throw new NotFoundError('Tutor')

    if (input.cpf && input.cpf.trim()) {
      const digits = input.cpf.replace(/\D/g, '')
      if (!CPF.isValid(digits)) throw new ValidationError('CPF inválido')
      const existing = await this.tutorRepo.findByCpf(digits, tenantId)
      if (existing && existing.id !== id) throw new ConflictError('CPF já cadastrado')
    }

    tutor.update({
      name: input.name,
      phone: input.phone ? input.phone.replace(/\D/g, '') : undefined,
      whatsapp: input.whatsapp ? input.whatsapp.replace(/\D/g, '') : undefined,
      email: input.email || undefined,
      cpf: input.cpf ? input.cpf.replace(/\D/g, '') : undefined,
      notes: input.notes,
      address: {
        street: input.street,
        number: input.number,
        complement: input.complement,
        neighborhood: input.neighborhood,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode ? input.zipCode.replace(/\D/g, '') : undefined,
      },
    })

    await this.tutorRepo.update(tutor)
  }
}
