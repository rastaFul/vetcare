import { IAnimalRepository } from '../ports/IAnimalRepository'
import { UpdateAnimalInput } from '../dtos/AnimalDTO'
import { NotFoundError, ValidationError } from '@/shared/infrastructure/errors'

export class UpdateAnimal {
  constructor(private readonly animalRepo: IAnimalRepository) {}

  async execute(id: string, tenantId: string, input: UpdateAnimalInput): Promise<void> {
    const animal = await this.animalRepo.findById(id, tenantId)
    if (!animal) throw new NotFoundError('Animal')

    if (input.weightKg !== undefined && input.weightKg <= 0) {
      throw new ValidationError('Peso deve ser maior que zero')
    }

    animal.update({
      name: input.name,
      species: input.species,
      breed: input.breed,
      sex: input.sex,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      weightKg: input.weightKg,
      color: input.color,
      castrated: input.castrated,
      microchip: input.microchip,
      notes: input.notes,
    })

    await this.animalRepo.update(animal)
  }
}
