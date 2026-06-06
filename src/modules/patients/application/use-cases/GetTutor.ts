import { ITutorRepository } from '../ports/ITutorRepository'
import { Tutor } from '../../domain/entities/Tutor'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class GetTutor {
  constructor(private readonly tutorRepo: ITutorRepository) {}

  async execute(id: string, tenantId: string): Promise<Tutor> {
    const tutor = await this.tutorRepo.findById(id, tenantId)
    if (!tutor) throw new NotFoundError('Tutor')
    return tutor
  }
}
