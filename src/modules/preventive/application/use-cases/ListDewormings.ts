import { DewormingRecord } from '../../domain/entities/DewormingRecord'
import { IDewormingRepository } from '../ports/IDewormingRepository'

export class ListDewormings {
  constructor(private readonly dewormingRepo: IDewormingRepository) {}

  async execute(animalId: string, tenantId: string): Promise<DewormingRecord[]> {
    return this.dewormingRepo.findByAnimal(animalId, tenantId)
  }
}
