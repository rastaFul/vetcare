import { Phone } from '../Phone'

describe('Phone', () => {
  it('should accept valid 11-digit phone', () => {
    expect(() => Phone.create('11999999999')).not.toThrow()
  })

  it('should accept valid 10-digit phone', () => {
    expect(() => Phone.create('1133334444')).not.toThrow()
  })

  it('should reject too short phone', () => {
    expect(() => Phone.create('123')).toThrow('Telefone inválido')
  })

  it('should format 11-digit phone correctly', () => {
    const phone = Phone.create('11999999999')
    expect(phone.formatted).toBe('(11) 99999-9999')
  })

  it('should strip non-digits from input', () => {
    const phone = Phone.create('(11) 99999-9999')
    expect(phone.value).toBe('11999999999')
  })
})
