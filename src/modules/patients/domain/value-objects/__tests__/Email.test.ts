import { Email } from '../Email'

describe('Email', () => {
  it('should accept valid email', () => {
    expect(() => Email.create('user@example.com')).not.toThrow()
  })

  it('should reject invalid email', () => {
    expect(() => Email.create('not-an-email')).toThrow('Email inválido')
  })

  it('should normalize to lowercase', () => {
    const email = Email.create('USER@EXAMPLE.COM')
    expect(email.value).toBe('user@example.com')
  })

  it('should trim whitespace', () => {
    const email = Email.create('  user@example.com  ')
    expect(email.value).toBe('user@example.com')
  })
})
