import { GoogleCalendarServiceAccountAdapter } from '../GoogleCalendarServiceAccountAdapter'

// Mock crypto.subtle for Node.js test environment
const mockSign = jest.fn().mockResolvedValue(new Uint8Array(256).buffer)
const mockImportKey = jest.fn().mockResolvedValue('mock-crypto-key')

Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      importKey: mockImportKey,
      sign: mockSign,
    },
  },
  writable: true,
})

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

const FAKE_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7fake
-----END PRIVATE KEY-----`

describe('GoogleCalendarServiceAccountAdapter', () => {
  let adapter: GoogleCalendarServiceAccountAdapter

  beforeEach(() => {
    jest.clearAllMocks()
    adapter = new GoogleCalendarServiceAccountAdapter()

    // Default: token fetch succeeds
    mockFetch.mockImplementation((url: string) => {
      if (url === 'https://oauth2.googleapis.com/token') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ access_token: 'mock-access-token' }),
          text: () => Promise.resolve(''),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'created-event-id' }),
        text: () => Promise.resolve(''),
      })
    })

    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@project.iam.gserviceaccount.com'
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = FAKE_PRIVATE_KEY
  })

  afterEach(() => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    delete process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  })

  describe('createEvent', () => {
    it('should request an access token and create event', async () => {
      const dto = {
        title: 'Consulta - Rex',
        startAt: new Date('2026-07-01T10:00:00Z'),
        endAt: new Date('2026-07-01T11:00:00Z'),
      }

      const eventId = await adapter.createEvent(dto, 'tenant-cal@group.calendar.google.com')

      // Token fetch called
      expect(mockFetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({ method: 'POST' })
      )
      // Calendar API called
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/calendars/'),
        expect.objectContaining({ method: 'POST', headers: expect.objectContaining({ Authorization: 'Bearer mock-access-token' }) })
      )
      expect(eventId).toBe('created-event-id')
    })

    it('should throw when calendar API returns error', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://oauth2.googleapis.com/token') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ access_token: 'tok' }) })
        }
        return Promise.resolve({ ok: false, status: 403, text: () => Promise.resolve('Forbidden') })
      })

      await expect(
        adapter.createEvent({ title: 'Test', startAt: new Date(), endAt: new Date() }, 'cal-id')
      ).rejects.toThrow('Google Calendar API error: 403')
    })
  })

  describe('deleteEvent', () => {
    it('should call delete endpoint with calendarId', async () => {
      await adapter.deleteEvent('event-123', 'tenant-cal-id')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/events/event-123'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('updateEvent', () => {
    it('should call patch endpoint with updated fields', async () => {
      const scheduledAt = new Date('2026-07-02T10:00:00Z')
      await adapter.updateEvent('event-456', { startAt: scheduledAt, endAt: new Date(scheduledAt.getTime() + 3600000) }, 'cal-id')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/events/event-456'),
        expect.objectContaining({ method: 'PATCH' })
      )
    })
  })

  describe('createTenantCalendar', () => {
    it('should create calendar and set public ACL', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://oauth2.googleapis.com/token') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ access_token: 'tok' }) })
        }
        if (url === 'https://www.googleapis.com/calendar/v3/calendars') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'new-calendar-id@group.calendar.google.com' }) })
        }
        // ACL endpoint
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      })

      const result = await adapter.createTenantCalendar('Minha Clínica')

      expect(result.calendarId).toBe('new-calendar-id@group.calendar.google.com')
      expect(result.shareUrl).toContain('calendar.google.com')
      expect(result.shareUrl).toContain(encodeURIComponent('new-calendar-id@group.calendar.google.com'))
    })
  })

  describe('env vars missing', () => {
    it('should throw when env vars not set', async () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
      delete process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

      await expect(
        adapter.createEvent({ title: 'Test', startAt: new Date(), endAt: new Date() }, 'cal-id')
      ).rejects.toThrow('GOOGLE_SERVICE_ACCOUNT_EMAIL')
    })
  })
})
