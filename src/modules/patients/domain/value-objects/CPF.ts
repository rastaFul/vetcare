export class CPF {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value.replace(/\D/g, '')
  }

  static create(raw: string): CPF {
    const digits = raw.replace(/\D/g, '')
    if (!CPF.isValid(digits)) {
      throw new Error('CPF inválido')
    }
    return new CPF(digits)
  }

  static isValid(digits: string): boolean {
    if (digits.length !== 11) return false
    if (/^(\d)\1{10}$/.test(digits)) return false

    let sum = 0
    for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(digits[9])) return false

    sum = 0
    for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    return remainder === parseInt(digits[10])
  }

  get value(): string {
    return this._value
  }

  get masked(): string {
    return this._value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  toString(): string {
    return this._value
  }
}
