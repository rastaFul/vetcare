import { IAnimalRepository } from '../ports/IAnimalRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class GetAnimal {
  constructor(private readonly animalRepo: IAnimalRepository) {}

  async execute(id: string, tenantId: string) {
    const animal = await this.animalRepo.findById(id, tenantId)
    if (!animal) throw new NotFoundError('Animal')
    return animal
  }
}
