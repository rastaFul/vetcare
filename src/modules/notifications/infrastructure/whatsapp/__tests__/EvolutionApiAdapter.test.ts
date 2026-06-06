import { EvolutionApiAdapter } from '../EvolutionApiAdapter'

describe('EvolutionApiAdapter', () => {
  let adapter: EvolutionApiAdapter
  let fetchSpy: jest.SpyInstance

  beforeEach(() => {
    adapter = new EvolutionApiAdapter('http://localhost:8080', 'test-key', 'vetcare')
    fetchSpy = jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  describe('sendWhatsApp()', () => {
    it('returns sent status on success', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '{"key":{"id":"msg-123"}}',
        json: async () => ({ key: { id: 'msg-123' } }),
      } as Response)

      const result = await adapter.sendWhatsApp('11999999999', 'Test message')
      expect(result.status).toBe('sent')
      expect(result.channel).toBe('WHATSAPP')
    })

    it('normalizes phone number to include DDI 55', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '{}',
        json: async () => ({}),
      } as Response)

      await adapter.sendWhatsApp('11999999999', 'Test')
      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string)
      expect(body.number).toBe('5511999999999')
    })

    it('does not double-add DDI 55 if already present', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '{}',
        json: async () => ({}),
      } as Response)

      await adapter.sendWhatsApp('5511999999999', 'Test')
      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string)
      expect(body.number).toBe('5511999999999')
    })

    it('returns failed status on non-OK response', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      } as Response)

      const result = await adapter.sendWhatsApp('11999999999', 'Test')
      expect(result.status).toBe('failed')
      expect(result.error).toContain('401')
    })

    it('returns failed status on network error', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('ECONNREFUSED'))

      const result = await adapter.sendWhatsApp('11999999999', 'Test')
      expect(result.status).toBe('failed')
      expect(result.channel).toBe('WHATSAPP')
    })
  })

  describe('sendEmail()', () => {
    it('returns failed — not supported by this adapter', async () => {
      const result = await adapter.sendEmail('test@test.com', 'Subject', '<html/>')
      expect(result.status).toBe('failed')
      expect(result.channel).toBe('EMAIL')
    })
  })

  describe('getWhatsAppStatus()', () => {
    it('returns connected when state is open', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instance: { state: 'open' } }),
      } as Response)

      const status = await adapter.getWhatsAppStatus()
      expect(status).toBe('connected')
    })

    it('returns disconnected when state is close', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instance: { state: 'close' } }),
      } as Response)

      const status = await adapter.getWhatsAppStatus()
      expect(status).toBe('disconnected')
    })

    it('returns qr_code when state is connecting', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instance: { state: 'connecting' } }),
      } as Response)

      const status = await adapter.getWhatsAppStatus()
      expect(status).toBe('qr_code')
    })

    it('returns unavailable on non-OK response', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response)

      const status = await adapter.getWhatsAppStatus()
      expect(status).toBe('unavailable')
    })

    it('returns unavailable on network error', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network error'))

      const status = await adapter.getWhatsAppStatus()
      expect(status).toBe('unavailable')
    })
  })

  describe('getQRCode()', () => {
    it('returns base64 qrcode string', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ qrcode: { base64: 'data:image/png;base64,abc123' } }),
      } as Response)

      const qr = await adapter.getQRCode()
      expect(qr).toBe('data:image/png;base64,abc123')
    })

    it('returns null on failure', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Timeout'))
      const qr = await adapter.getQRCode()
      expect(qr).toBeNull()
    })
  })
})
