import { IConsultationRepository } from '../ports/IConsultationRepository'
import { ICalendarService } from '../ports/ICalendarService'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class CancelConsultation {
  constructor(
    private readonly consultationRepo: IConsultationRepository,
    private readonly calendarService: ICalendarService | null
  ) {}

  async execute(id: string, tenantId: string, calendarId?: string): Promise<void> {
    const consultation = await this.consultationRepo.findById(id, tenantId)
    if (!consultation) throw new NotFoundError('Consulta')

    const calendarEventId = consultation.googleCalendarEventId
    consultation.cancel()
    await this.consultationRepo.update(consultation)

    // Deletar evento no Google Calendar (best-effort)
    if (calendarEventId && this.calendarService && calendarId) {
      try {
        await this.calendarService.deleteEvent(calendarEventId, calendarId)
      } catch {
        // best-effort
      }
    }
  }
}
