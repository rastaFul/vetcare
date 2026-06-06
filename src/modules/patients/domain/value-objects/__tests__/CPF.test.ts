import { CPF } from '../CPF'

describe('CPF', () => {
  it('should accept valid CPF', () => {
    expect(() => CPF.create('123.456.789-09')).not.toThrow()
  })

  it('should reject repeated sequences', () => {
    expect(() => CPF.create('111.111.111-11')).toThrow('CPF inválido')
  })

  it('should reject invalid check digits', () => {
    expect(() => CPF.create('123.456.789-00')).toThrow('CPF inválido')
  })

  it('should return masked value', () => {
    const cpf = CPF.create('12345678909')
    expect(cpf.masked).toBe('123.456.789-09')
  })

  it('should store only digits', () => {
    const cpf = CPF.create('123.456.789-09')
    expect(cpf.value).toBe('12345678909')
  })
})
