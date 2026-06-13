import { Session } from '../../domain/entities/Session'
import { ISessionRepository } from '../ports/ISessionRepository'
import { IServiceRepository } from '@/modules/services/application/ports/IServiceRepository'
import { ICalendarService } from '@/modules/clinical/application/ports/ICalendarService'
import { NotFoundError, AppError } from '@/shared/infrastructure/errors'
import { PrismaClient } from '@prisma/client'

export interface ScheduleSessionInput {
  tenantId: string
  clientId: string
  serviceId?: string
  therapistId: string
  scheduledAt: Date
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  notes?: string
  createCalendarEvent?: boolean
  calendarToken?: string
}

export class ScheduleSession {
  constructor(
    private readonly sessionRepo: ISessionRepository,
    private readonly serviceRepo: IServiceRepository,
    private readonly calendarService: ICalendarService | null,
    private readonly prisma: PrismaClient
  ) {}

  async execute(input: ScheduleSessionInput): Promise<Session> {
    const client = await this.prisma.client.findFirst({
      where: { id: input.clientId, tenantId: input.tenantId },
    })
    if (!client) throw new NotFoundError('Cliente')

    if (input.serviceId) {
      const service = await this.serviceRepo.findById(input.serviceId, input.tenantId)
      if (!service) throw new NotFoundError('Serviço')
      if (!service.active) throw new AppError('Serviço inativo', 'BUSINESS_ERROR', 422)
    }

    const session = Session.create({
      tenantId: input.tenantId,
      clientId: input.clientId,
      serviceId: input.serviceId,
      therapistId: input.therapistId,
      scheduledAt: input.scheduledAt,
      street: input.street,
      number: input.number,
      complement: input.complement,
      neighborhood: input.neighborhood,
      city: input.city,
      state: input.state,
      zipCode: input.zipCode,
      notes: input.notes,
    })

    await this.sessionRepo.save(session)

    if (input.createCalendarEvent && this.calendarService && input.calendarToken) {
      try {
        const durationMs = 60 * 60 * 1000
        const eventId = await this.calendarService.createEvent(
          {
            title: `Sessão - ${client.name}`,
            description: input.notes,
            startAt: input.scheduledAt,
            endAt: new Date(input.scheduledAt.getTime() + durationMs),
            location: input.street ? `${input.street}, ${input.number ?? ''}` : undefined,
          },
          input.calendarToken
        )
        session.setCalendarEventId(eventId)
        await this.sessionRepo.update(session)
      } catch {
        // Calendar sync failure doesn't block session creation
      }
    }

    return session
  }
}
