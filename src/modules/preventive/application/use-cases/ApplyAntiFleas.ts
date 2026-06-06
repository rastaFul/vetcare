import { AntiFleasRecord } from '../../domain/entities/AntiFleasRecord'
import { IAntiFleasRepository } from '../ports/IAntiFleasRepository'
import { IAnimalRepository } from '@/modules/patients/application/ports/IAnimalRepository'
import { ICalendarService } from '@/modules/clinical/application/ports/ICalendarService'
import { ApplyAntiFleasInput } from '../dtos/PreventiveDTO'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class ApplyAntiFleas {
  constructor(
    private readonly antiFleasRepo: IAntiFleasRepository,
    private readonly animalRepo: IAnimalRepository,
    private readonly calendarService: ICalendarService | null
  ) {}

  async execute(
    tenantId: string,
    input: ApplyAntiFleasInput,
    calendarToken?: string
  ): Promise<AntiFleasRecord> {
    const animal = await this.animalRepo.findById(input.animalId, tenantId)
    if (!animal) throw new NotFoundError('Animal')

    const record = AntiFleasRecord.create({
      tenantId,
      animalId: input.animalId,
      medication: input.medication,
      appliedAt: new Date(input.appliedAt),
      nextApplicationAt: input.nextApplicationAt ? new Date(input.nextApplicationAt) : undefined,
      observations: input.observations,
    })

    await this.antiFleasRepo.save(record)

    if (input.createReminder && record.nextApplicationAt && this.calendarService && calendarToken) {
      try {
        const eventId = await this.calendarService.createReminder(
          {
            title: `Antipulgas: ${record.medication} - ${animal.name}`,
            description: `Próxima aplicação de antipulgas ${record.medication}`,
            startAt: record.nextApplicationAt,
            endAt: new Date(record.nextApplicationAt.getTime() + 30 * 60 * 1000),
          },
          calendarToken
        )
        record.setCalendarEventId(eventId)
        await this.antiFleasRepo.save(record)
      } catch {
        // best-effort, do not fail
      }
    }

    return record
  }
}
