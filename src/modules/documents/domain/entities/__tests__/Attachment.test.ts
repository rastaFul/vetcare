import { Attachment } from '../Attachment'

describe('Attachment', () => {
  function make(overrides = {}) {
    return Attachment.create({
      tenantId: 't1',
      animalId: 'a1',
      type: 'EXAM' as const,
      name: 'exame.pdf',
      storageKey: 'att/t1/a1/123.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 512000,
      uploadedById: 'u1',
      ...overrides,
    })
  }

  it('should create attachment', () => {
    const a = make()
    expect(a.name).toBe('exame.pdf')
    expect(a.isPdf).toBe(true)
    expect(a.isImage).toBe(false)
  })

  it('should identify image', () => {
    const a = make({ mimeType: 'image/jpeg' })
    expect(a.isImage).toBe(true)
    expect(a.isPdf).toBe(false)
  })

  it('should format KB', () => {
    const a = make({ sizeBytes: 512000 })
    expect(a.fileSizeFormatted).toBe('500.0 KB')
  })

  it('should format bytes', () => {
    const a = make({ sizeBytes: 256 })
    expect(a.fileSizeFormatted).toBe('256 B')
  })
})
