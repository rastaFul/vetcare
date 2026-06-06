import { VaccinationRecord } from '../../domain/entities/VaccinationRecord'
import { IVaccinationRepository } from '../ports/IVaccinationRepository'
import { IAnimalRepository } from '@/modules/patients/application/ports/IAnimalRepository'
import { ICalendarService } from '@/modules/clinical/application/ports/ICalendarService'
import { ApplyVaccinationInput } from '../dtos/PreventiveDTO'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class ApplyVaccination {
  constructor(
    private readonly vaccinationRepo: IVaccinationRepository,
    private readonly animalRepo: IAnimalRepository,
    private readonly calendarService: ICalendarService | null
  ) {}

  async execute(
    tenantId: string,
    input: ApplyVaccinationInput,
    calendarToken?: string
  ): Promise<VaccinationRecord> {
    const animal = await this.animalRepo.findById(input.animalId, tenantId)
    if (!animal) throw new NotFoundError('Animal')

    const record = VaccinationRecord.create({
      tenantId,
      animalId: input.animalId,
      vaccine: input.vaccine,
      appliedAt: new Date(input.appliedAt),
      nextDoseAt: input.nextDoseAt ? new Date(input.nextDoseAt) : undefined,
      batchNumber: input.batchNumber,
      manufacturer: input.manufacturer,
      observations: input.observations,
    })

    await this.vaccinationRepo.save(record)

    if (input.createReminder && record.nextDoseAt && this.calendarService && calendarToken) {
      try {
        const eventId = await this.calendarService.createReminder(
          {
            title: `Vacina: ${record.vaccine} - ${animal.name}`,
            description: `Próxima dose da vacina ${record.vaccine}`,
            startAt: record.nextDoseAt,
            endAt: new Date(record.nextDoseAt.getTime() + 30 * 60 * 1000),
          },
          calendarToken
        )
        record.setCalendarEventId(eventId)
        await this.vaccinationRepo.save(record)
      } catch {
        // best-effort, do not fail
      }
    }

    return record
  }
}
