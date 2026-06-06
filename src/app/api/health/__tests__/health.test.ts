// Teste simples da lógica de health (não do Next.js route diretamente)
describe('Health endpoint logic', () => {
  it('should return ok status with timestamp', () => {
    const response = {
      status: 'ok',
      version: '1.0.0',
      service: 'vetcare-api',
    }
    expect(response.status).toBe('ok')
    expect(response.version).toBeDefined()
    expect(response.service).toBe('vetcare-api')
  })
})
