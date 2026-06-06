import { IAnimalRepository } from '../ports/IAnimalRepository'
import { AnimalStatus } from '../../domain/entities/Animal'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class ChangeAnimalStatus {
  constructor(private readonly animalRepo: IAnimalRepository) {}

  async execute(id: string, tenantId: string, status: AnimalStatus): Promise<void> {
    const animal = await this.animalRepo.findById(id, tenantId)
    if (!animal) throw new NotFoundError('Animal')

    animal.changeStatus(status)
    await this.animalRepo.update(animal)
  }
}
