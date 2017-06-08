import expect from 'expect'
import KiteError from './error'

describe('KiteError', () =>
  it('should provide a generic Error object', () => {
    expect(KiteError).toExist()
    let anError = new KiteError('an error')

    expect(anError).toExist()
    expect(anError instanceof Error).toBe(true)
    expect(anError.name).toBe('KiteError')
    expect(anError.message).toBe('an error')
  }))

describe('KiteError.codeIs', () =>
  it('should support code checking on a given error', () => {
    let anError = new KiteError('an error')

    anError.code = 100
    expect(KiteError.codeIs(100)(anError)).toBe(true)
    expect(KiteError.codeIs(101)(anError)).toBe(false)
  }))

describe('KiteError.codeIsnt', () =>
  it('should support code checking on a given error', () => {
    let anError = new KiteError('an error')

    anError.code = 100
    expect(KiteError.codeIsnt(101)(anError)).toBe(true)
    expect(KiteError.codeIsnt(100)(anError)).toBe(false)
  }))

describe('KiteError.makeProperError', () =>
  it('should generate a proper error', () => {
    let anError = new KiteError.makeProperError({
      type: 'AnErrorType',
      code: 200,
      message: 'an error',
    })

    expect(anError).toExist()
    expect(anError instanceof Error).toBe(true)
    expect(anError.name).toBe('KiteError')
    expect(anError.type).toBe('AnErrorType')
    expect(anError.code).toBe(200)
    expect(anError.message).toBe('an error')
  }))
