export class Result<T, E extends Error = Error> {
  private constructor(
    private readonly _value: T | null,
    private readonly _error: E | null
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(value, null)
  }

  static fail<E extends Error>(error: E): Result<never, E> {
    return new Result<never, E>(null, error)
  }

  get isOk(): boolean {
    return this._error === null
  }

  get isFail(): boolean {
    return !this.isOk
  }

  get value(): T {
    if (this._value === null) throw new Error('Result has no value')
    return this._value
  }

  get error(): E {
    if (this._error === null) throw new Error('Result has no error')
    return this._error
  }
}
