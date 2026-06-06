import { Result } from '../Result'

describe('Result', () => {
  it('ok() should create successful result', () => {
    const result = Result.ok('value')
    expect(result.isOk).toBe(true)
    expect(result.value).toBe('value')
  })

  it('fail() should create failure result', () => {
    const result = Result.fail(new Error('error msg'))
    expect(result.isFail).toBe(true)
    expect(result.error.message).toBe('error msg')
  })

  it('value getter should throw on failure result', () => {
    const result = Result.fail(new Error('err'))
    expect(() => result.value).toThrow()
  })
})
