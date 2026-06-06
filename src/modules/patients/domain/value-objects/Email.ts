export class Email {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value.toLowerCase().trim()
  }

  static create(raw: string): Email {
    const email = raw.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido')
    }
    return new Email(email)
  }

  get value(): string {
    return this._value
  }

  toString(): string {
    return this._value
  }
}
