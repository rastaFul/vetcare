import { ResendAdapter } from '../ResendAdapter'

describe('ResendAdapter', () => {
  let adapter: ResendAdapter
  let fetchSpy: jest.SpyInstance

  beforeEach(() => {
    adapter = new ResendAdapter('re_test_key', 'noreply@vetcare.dev')
    fetchSpy = jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  describe('sendEmail()', () => {
    it('returns sent status on success', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email-123' }),
      } as Response)

      const result = await adapter.sendEmail('tutor@email.com', 'Test Subject', '<html><body>Test</body></html>')
      expect(result.status).toBe('sent')
      expect(result.channel).toBe('EMAIL')
    })

    it('sends correct payload to Resend API', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email-123' }),
      } as Response)

      await adapter.sendEmail('tutor@email.com', 'Lembrete', '<p>conteúdo</p>')
      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string)
      expect(body.to).toEqual(['tutor@email.com'])
      expect(body.subject).toBe('Lembrete')
      expect(body.from).toContain('noreply@vetcare.dev')
    })

    it('returns failed status on 401', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid API Key' }),
      } as Response)

      const result = await adapter.sendEmail('tutor@email.com', 'Subject', '<html/>')
      expect(result.status).toBe('failed')
      expect(result.channel).toBe('EMAIL')
      expect(result.error).toBeDefined()
    })

    it('returns failed on network error', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network error'))

      const result = await adapter.sendEmail('tutor@email.com', 'Subject', '<html/>')
      expect(result.status).toBe('failed')
    })
  })

  describe('sendWhatsApp()', () => {
    it('returns failed — not supported by this adapter', async () => {
      const result = await adapter.sendWhatsApp('11999999999', 'Test')
      expect(result.status).toBe('failed')
      expect(result.channel).toBe('WHATSAPP')
    })
  })

  describe('getWhatsAppStatus()', () => {
    it('always returns unavailable', async () => {
      const status = await adapter.getWhatsAppStatus()
      expect(status).toBe('unavailable')
    })
  })
})
