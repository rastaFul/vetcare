import { IAnimalRepository, ListAnimalsOptions } from '../ports/IAnimalRepository'

export class ListAnimals {
  constructor(private readonly animalRepo: IAnimalRepository) {}

  async execute(options: ListAnimalsOptions) {
    return this.animalRepo.list({
      ...options,
      page: options.page ?? 1,
      pageSize: Math.min(options.pageSize ?? 20, 100),
    })
  }
}
