export interface CalendarEventDTO {
  title: string
  description?: string
  startAt: Date
  endAt: Date
  location?: string
}

export interface ICalendarService {
  createEvent(dto: CalendarEventDTO, calendarId: string): Promise<string>
  updateEvent(eventId: string, dto: Partial<CalendarEventDTO>, calendarId: string): Promise<void>
  deleteEvent(eventId: string, calendarId: string): Promise<void>
  createReminder(dto: CalendarEventDTO, calendarId: string): Promise<string>
  createTenantCalendar?(tenantName: string): Promise<{ calendarId: string; shareUrl: string }>
}
