import { ICalendarService, CalendarEventDTO } from '../../application/ports/ICalendarService'

export class GoogleCalendarAdapter implements ICalendarService {
  private readonly calendarId = 'primary'

  async createEvent(dto: CalendarEventDTO, accessToken: string): Promise<string> {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: dto.title,
          description: dto.description,
          location: dto.location,
          start: { dateTime: dto.startAt.toISOString(), timeZone: 'America/Sao_Paulo' },
          end: { dateTime: dto.endAt.toISOString(), timeZone: 'America/Sao_Paulo' },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`)
    }

    const data = await response.json()
    return data.id
  }

  async updateEvent(eventId: string, dto: Partial<CalendarEventDTO>, accessToken: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = {}
    if (dto.title) body.summary = dto.title
    if (dto.description !== undefined) body.description = dto.description
    if (dto.startAt) body.start = { dateTime: dto.startAt.toISOString(), timeZone: 'America/Sao_Paulo' }
    if (dto.endAt) body.end = { dateTime: dto.endAt.toISOString(), timeZone: 'America/Sao_Paulo' }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`)
    }
  }

  async deleteEvent(eventId: string, accessToken: string): Promise<void> {
    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    // 404 = já deletado, ignorar
  }

  async createReminder(dto: CalendarEventDTO, accessToken: string): Promise<string> {
    return this.createEvent(dto, accessToken)
  }
}
