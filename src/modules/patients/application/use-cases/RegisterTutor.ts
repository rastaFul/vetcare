import { Tutor } from '../../domain/entities/Tutor'
import { CPF } from '../../domain/value-objects/CPF'
import { ITutorRepository } from '../ports/ITutorRepository'
import { CreateTutorInput } from '../dtos/TutorDTO'
import { ConflictError, ValidationError } from '@/shared/infrastructure/errors'

export class RegisterTutor {
  constructor(private readonly tutorRepo: ITutorRepository) {}

  async execute(tenantId: string, input: CreateTutorInput): Promise<Tutor> {
    if (input.cpf && input.cpf.trim()) {
      const digits = input.cpf.replace(/\D/g, '')
      if (!CPF.isValid(digits)) {
        throw new ValidationError('CPF inválido')
      }
      const existing = await this.tutorRepo.findByCpf(digits, tenantId)
      if (existing) {
        throw new ConflictError('Já existe um tutor com este CPF')
      }
    }

    const tutor = Tutor.create({
      tenantId,
      name: input.name.trim(),
      cpf: input.cpf ? input.cpf.replace(/\D/g, '') : undefined,
      phone: input.phone.replace(/\D/g, ''),
      whatsapp: input.whatsapp ? input.whatsapp.replace(/\D/g, '') : undefined,
      email: input.email || undefined,
      address: {
        street: input.street,
        number: input.number,
        complement: input.complement,
        neighborhood: input.neighborhood,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode ? input.zipCode.replace(/\D/g, '') : undefined,
      },
      notes: input.notes,
    })

    await this.tutorRepo.save(tutor)
    return tutor
  }
}
