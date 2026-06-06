import { ITutorRepository, ListTutorsOptions } from '../ports/ITutorRepository'
import { Tutor } from '../../domain/entities/Tutor'

export class ListTutors {
  constructor(private readonly tutorRepo: ITutorRepository) {}

  async execute(options: ListTutorsOptions): Promise<{ tutors: Tutor[]; total: number }> {
    return this.tutorRepo.list({
      ...options,
      page: options.page ?? 1,
      pageSize: Math.min(options.pageSize ?? 20, 100),
    })
  }
}
