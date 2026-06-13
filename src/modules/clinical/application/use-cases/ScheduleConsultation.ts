import { Consultation } from '../../domain/entities/Consultation'
import { IConsultationRepository } from '../ports/IConsultationRepository'
import { ICalendarService } from '../ports/ICalendarService'
import { IAnimalRepository } from '@/modules/patients/application/ports/IAnimalRepository'
import { ScheduleConsultationInput } from '../dtos/ConsultationDTO'
import { NotFoundError, ValidationError } from '@/shared/infrastructure/errors'

export class ScheduleConsultation {
  constructor(
    private readonly consultationRepo: IConsultationRepository,
    private readonly animalRepo: IAnimalRepository,
    private readonly calendarService: ICalendarService | null
  ) {}

  async execute(
    tenantId: string,
    veterinarianId: string,
    input: ScheduleConsultationInput,
    calendarId?: string
  ): Promise<Consultation> {
    const animal = await this.animalRepo.findById(input.animalId, tenantId)
    if (!animal) throw new NotFoundError('Animal')

    const scheduledAt = new Date(input.scheduledAt)
    if (scheduledAt <= new Date()) {
      throw new ValidationError('Data da consulta deve ser futura')
    }

    const consultation = Consultation.create({
      tenantId,
      animalId: input.animalId,
      veterinarianId,
      scheduledAt,
      address: {
        street: input.street,
        number: input.number,
        complement: input.complement,
        neighborhood: input.neighborhood,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
      },
      observations: input.observations,
    })

    await this.consultationRepo.save(consultation)

    // Sync Google Calendar (best-effort — não bloqueia se falhar)
    if (input.createCalendarEvent && this.calendarService && calendarId) {
      try {
        const endAt = new Date(scheduledAt.getTime() + 60 * 60 * 1000) // +1h
        const eventId = await this.calendarService.createEvent(
          {
            title: `Consulta - ${animal.name}`,
            description: input.observations,
            startAt: scheduledAt,
            endAt,
            location: input.street
              ? `${input.street}, ${input.number ?? ''}`
              : undefined,
          },
          calendarId
        )
        consultation.setCalendarEventId(eventId)
        await this.consultationRepo.update(consultation)
      } catch {
        // Calendar sync failure doesn't block consultation creation
      }
    }

    return consultation
  }
}
