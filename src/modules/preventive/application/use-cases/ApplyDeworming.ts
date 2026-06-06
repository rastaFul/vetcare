import { DewormingRecord } from '../../domain/entities/DewormingRecord'
import { IDewormingRepository } from '../ports/IDewormingRepository'
import { IAnimalRepository } from '@/modules/patients/application/ports/IAnimalRepository'
import { ICalendarService } from '@/modules/clinical/application/ports/ICalendarService'
import { ApplyDewormingInput } from '../dtos/PreventiveDTO'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class ApplyDeworming {
  constructor(
    private readonly dewormingRepo: IDewormingRepository,
    private readonly animalRepo: IAnimalRepository,
    private readonly calendarService: ICalendarService | null
  ) {}

  async execute(
    tenantId: string,
    input: ApplyDewormingInput,
    calendarToken?: string
  ): Promise<DewormingRecord> {
    const animal = await this.animalRepo.findById(input.animalId, tenantId)
    if (!animal) throw new NotFoundError('Animal')

    const record = DewormingRecord.create({
      tenantId,
      animalId: input.animalId,
      medication: input.medication,
      appliedAt: new Date(input.appliedAt),
      nextApplicationAt: input.nextApplicationAt ? new Date(input.nextApplicationAt) : undefined,
      observations: input.observations,
    })

    await this.dewormingRepo.save(record)

    if (input.createReminder && record.nextApplicationAt && this.calendarService && calendarToken) {
      try {
        const eventId = await this.calendarService.createReminder(
          {
            title: `Vermífugo: ${record.medication} - ${animal.name}`,
            description: `Próxima aplicação de vermífugo ${record.medication}`,
            startAt: record.nextApplicationAt,
            endAt: new Date(record.nextApplicationAt.getTime() + 30 * 60 * 1000),
          },
          calendarToken
        )
        record.setCalendarEventId(eventId)
        await this.dewormingRepo.save(record)
      } catch {
        // best-effort, do not fail
      }
    }

    return record
  }
}
