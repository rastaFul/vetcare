export interface CalendarEventDTO {
  title: string
  description?: string
  startAt: Date
  endAt: Date
  location?: string
}

export interface ICalendarService {
  createEvent(dto: CalendarEventDTO, accessToken: string): Promise<string>
  updateEvent(eventId: string, dto: Partial<CalendarEventDTO>, accessToken: string): Promise<void>
  deleteEvent(eventId: string, accessToken: string): Promise<void>
  createReminder(dto: CalendarEventDTO, accessToken: string): Promise<string>
}
