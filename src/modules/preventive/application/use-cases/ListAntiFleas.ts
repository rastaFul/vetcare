import { AntiFleasRecord } from '../../domain/entities/AntiFleasRecord'
import { IAntiFleasRepository } from '../ports/IAntiFleasRepository'

export class ListAntiFleas {
  constructor(private readonly antiFleasRepo: IAntiFleasRepository) {}

  async execute(animalId: string, tenantId: string): Promise<AntiFleasRecord[]> {
    return this.antiFleasRepo.findByAnimal(animalId, tenantId)
  }
}
