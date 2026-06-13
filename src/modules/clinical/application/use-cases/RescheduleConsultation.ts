import { IConsultationRepository } from '../ports/IConsultationRepository'
import { ICalendarService } from '../ports/ICalendarService'
import { UpdateConsultationInput } from '../dtos/ConsultationDTO'
import { NotFoundError } from '@/shared/infrastructure/errors'
import { ConsultationAddress } from '../../domain/entities/Consultation'

export class RescheduleConsultation {
  constructor(
    private readonly consultationRepo: IConsultationRepository,
    private readonly calendarService: ICalendarService | null
  ) {}

  async execute(
    id: string,
    tenantId: string,
    input: UpdateConsultationInput,
    calendarId?: string
  ): Promise<void> {
    const consultation = await this.consultationRepo.findById(id, tenantId)
    if (!consultation) throw new NotFoundError('Consulta')

    const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : undefined
    const address: ConsultationAddress | undefined = (
      input.street || input.number || input.neighborhood || input.city || input.state
    )
      ? {
          street: input.street,
          number: input.number,
          complement: input.complement,
          neighborhood: input.neighborhood,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
        }
      : undefined

    if (scheduledAt) {
      consultation.reschedule(scheduledAt, address)
    } else if (address) {
      consultation.reschedule(consultation.scheduledAt, address)
    }

    await this.consultationRepo.update(consultation)

    // Update calendar event (best-effort)
    if (consultation.googleCalendarEventId && this.calendarService && calendarId) {
      try {
        const updatePayload: Parameters<ICalendarService['updateEvent']>[1] = {}
        if (scheduledAt) {
          updatePayload.startAt = scheduledAt
          updatePayload.endAt = new Date(scheduledAt.getTime() + 60 * 60 * 1000)
        }
        await this.calendarService.updateEvent(
          consultation.googleCalendarEventId,
          updatePayload,
          calendarId
        )
      } catch {
        // best-effort
      }
    }
  }
}
