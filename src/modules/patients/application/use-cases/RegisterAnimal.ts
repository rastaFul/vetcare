import { Animal } from '../../domain/entities/Animal'
import { IAnimalRepository } from '../ports/IAnimalRepository'
import { ITutorRepository } from '../ports/ITutorRepository'
import { CreateAnimalInput } from '../dtos/AnimalDTO'
import { NotFoundError, ValidationError } from '@/shared/infrastructure/errors'

export class RegisterAnimal {
  constructor(
    private readonly animalRepo: IAnimalRepository,
    private readonly tutorRepo: ITutorRepository
  ) {}

  async execute(tenantId: string, input: CreateAnimalInput): Promise<Animal> {
    const tutor = await this.tutorRepo.findById(input.tutorId, tenantId)
    if (!tutor) throw new NotFoundError('Tutor')

    if (input.weightKg !== undefined && input.weightKg <= 0) {
      throw new ValidationError('Peso deve ser maior que zero')
    }

    const animal = Animal.create({
      tenantId,
      tutorId: input.tutorId,
      name: input.name.trim(),
      species: input.species,
      breed: input.breed,
      sex: input.sex ?? 'UNKNOWN',
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      weightKg: input.weightKg,
      color: input.color,
      castrated: input.castrated ?? false,
      microchip: input.microchip,
      notes: input.notes,
    })

    await this.animalRepo.save(animal)
    return animal
  }
}
