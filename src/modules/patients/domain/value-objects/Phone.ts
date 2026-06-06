export class Phone {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value.replace(/\D/g, '')
  }

  static create(raw: string): Phone {
    const digits = raw.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 11) {
      throw new Error('Telefone inválido')
    }
    return new Phone(digits)
  }

  get value(): string {
    return this._value
  }

  get formatted(): string {
    if (this._value.length === 11) {
      return this._value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return this._value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  toString(): string {
    return this._value
  }
}
