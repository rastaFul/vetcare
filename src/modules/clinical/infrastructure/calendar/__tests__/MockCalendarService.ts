import { ICalendarService, CalendarEventDTO } from '../../../application/ports/ICalendarService'

export class MockCalendarService implements ICalendarService {
  createdEvents: { dto: CalendarEventDTO; token: string }[] = []
  updatedEvents: { eventId: string; dto: Partial<CalendarEventDTO> }[] = []
  deletedEvents: string[] = []

  async createEvent(dto: CalendarEventDTO, token: string): Promise<string> {
    this.createdEvents.push({ dto, token })
    return `mock-event-${Date.now()}`
  }

  async updateEvent(eventId: string, dto: Partial<CalendarEventDTO>): Promise<void> {
    this.updatedEvents.push({ eventId, dto })
  }

  async deleteEvent(eventId: string): Promise<void> {
    this.deletedEvents.push(eventId)
  }

  async createReminder(dto: CalendarEventDTO, token: string): Promise<string> {
    return this.createEvent(dto, token)
  }
}
