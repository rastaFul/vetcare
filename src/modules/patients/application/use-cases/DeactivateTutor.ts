import { ITutorRepository } from '../ports/ITutorRepository'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class DeactivateTutor {
  constructor(private readonly tutorRepo: ITutorRepository) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const tutor = await this.tutorRepo.findById(id, tenantId)
    if (!tutor) throw new NotFoundError('Tutor')

    tutor.deactivate()
    await this.tutorRepo.update(tutor)
  }
}
