import { VaccinationRecord } from '../../domain/entities/VaccinationRecord'
import { IVaccinationRepository } from '../ports/IVaccinationRepository'

export class ListVaccinations {
  constructor(private readonly vaccinationRepo: IVaccinationRepository) {}

  async execute(animalId: string, tenantId: string): Promise<VaccinationRecord[]> {
    return this.vaccinationRepo.findByAnimal(animalId, tenantId)
  }
}
