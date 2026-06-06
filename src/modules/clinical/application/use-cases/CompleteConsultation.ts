import { IConsultationRepository } from '../ports/IConsultationRepository'
import { ICalendarService } from '../ports/ICalendarService'
import { CompleteConsultationInput } from '../dtos/ConsultationDTO'
import { NotFoundError } from '@/shared/infrastructure/errors'

export class CompleteConsultation {
  constructor(
    private readonly consultationRepo: IConsultationRepository,
    private readonly calendarService: ICalendarService | null
  ) {}

  async execute(
    id: string,
    tenantId: string,
    input: CompleteConsultationInput,
    calendarToken?: string
  ): Promise<void> {
    const consultation = await this.consultationRepo.findById(id, tenantId)
    if (!consultation) throw new NotFoundError('Consulta')

    consultation.complete({
      anamnesis: input.anamnesis,
      diagnosis: input.diagnosis,
      observations: input.observations,
      returnDate: input.returnDate ? new Date(input.returnDate) : undefined,
    })

    await this.consultationRepo.update(consultation)

    // Criar lembrete de retorno no Calendar (best-effort)
    if (input.createReturnReminder && input.returnDate && this.calendarService && calendarToken) {
      try {
        const returnDate = new Date(input.returnDate)
        const eventId = await this.calendarService.createReminder(
          {
            title: `Retorno - Consulta`,
            startAt: returnDate,
            endAt: new Date(returnDate.getTime() + 30 * 60 * 1000),
          },
          calendarToken
        )
        consultation.setReturnEventId(eventId)
        await this.consultationRepo.update(consultation)
      } catch {
        // best-effort
      }
    }
  }
}
