import { ICalendarService, CalendarEventDTO } from '../../application/ports/ICalendarService'

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/calendar'
const TIMEZONE = process.env.GOOGLE_CALENDAR_TIMEZONE ?? 'America/Sao_Paulo'

// ─── JWT helpers (pure, no googleapis dependency) ────────────────────────────

function base64url(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString('base64url')
}

function base64urlStr(str: string): string {
  return Buffer.from(str).toString('base64url')
}

async function signJwt(payload: object, privateKeyPem: string): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' }
  const encodedHeader = base64urlStr(JSON.stringify(header))
  const encodedPayload = base64urlStr(JSON.stringify(payload))
  const data = `${encodedHeader}.${encodedPayload}`

  // Import PEM private key
  const pemBody = privateKeyPem
    .replace(/-----BEGIN RSA PRIVATE KEY-----/, '')
    .replace(/-----END RSA PRIVATE KEY-----/, '')
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')

  const keyBytes = Buffer.from(pemBody, 'base64')

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    Buffer.from(data)
  )

  return `${data}.${base64url(signature)}`
}

async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

  if (!email || !key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY must be set')
  }

  // Normalize escaped newlines in env var
  const privateKey = key.replace(/\\n/g, '\n')

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }

  const jwt = await signJwt(payload, privateKey)

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to get service account token: ${res.status} ${body}`)
  }

  const data = await res.json()
  return data.access_token as string
}

// ─── Adapter ─────────────────────────────────────────────────────────────────

export class GoogleCalendarServiceAccountAdapter implements ICalendarService {
  async createEvent(dto: CalendarEventDTO, calendarId: string): Promise<string> {
    const token = await getAccessToken()
    const res = await fetch(
      `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: dto.title,
          description: dto.description,
          location: dto.location,
          start: { dateTime: dto.startAt.toISOString(), timeZone: TIMEZONE },
          end: { dateTime: dto.endAt.toISOString(), timeZone: TIMEZONE },
        }),
      }
    )

    if (!res.ok) {
      throw new Error(`Google Calendar API error: ${res.status}`)
    }

    const data = await res.json()
    return data.id as string
  }

  async updateEvent(eventId: string, dto: Partial<CalendarEventDTO>, calendarId: string): Promise<void> {
    const token = await getAccessToken()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = {}
    if (dto.title) body.summary = dto.title
    if (dto.description !== undefined) body.description = dto.description
    if (dto.startAt) body.start = { dateTime: dto.startAt.toISOString(), timeZone: TIMEZONE }
    if (dto.endAt) body.end = { dateTime: dto.endAt.toISOString(), timeZone: TIMEZONE }

    const res = await fetch(
      `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      throw new Error(`Google Calendar API error: ${res.status}`)
    }
  }

  async deleteEvent(eventId: string, calendarId: string): Promise<void> {
    const token = await getAccessToken()
    await fetch(
      `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    // 404 = already deleted, ignore
  }

  async createReminder(dto: CalendarEventDTO, calendarId: string): Promise<string> {
    return this.createEvent(dto, calendarId)
  }

  async createTenantCalendar(tenantName: string): Promise<{ calendarId: string; shareUrl: string }> {
    const token = await getAccessToken()

    // Create calendar
    const createRes = await fetch(`${CALENDAR_API}/calendars`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: `VetCare — ${tenantName}`,
        timeZone: TIMEZONE,
      }),
    })

    if (!createRes.ok) {
      throw new Error(`Failed to create calendar: ${createRes.status}`)
    }

    const calendarData = await createRes.json()
    const calendarId = calendarData.id as string

    // Share calendar publicly (reader access for all)
    const shareRes = await fetch(
      `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/acl`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          scope: { type: 'default' },
        }),
      }
    )

    if (!shareRes.ok) {
      // Non-fatal: calendar created but sharing failed
      console.warn(`Warning: failed to set calendar ACL: ${shareRes.status}`)
    }

    const shareUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendarId)}`

    return { calendarId, shareUrl }
  }
}
