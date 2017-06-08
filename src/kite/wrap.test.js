import expect from 'expect'
import wrap from './wrap'

describe('kite/wrap', () => {
  it('should include default api methods', () => {
    const wrapped = wrap()

    expect(wrapped.error).toBeA('function')
    expect(wrapped.info).toBeA('function')
    expect(wrapped.log).toBeA('function')
    expect(wrapped.warn).toBeA('function')
    expect(wrapped['kite.heartbeat']).toBeA('function')
  })

  describe('defaults["kite.heartbeat"]', () => {
    it('should assign heartbeatHandle to the object wrap being called', () => {
      const thing = {}
      const wrapped = wrap.call(thing, {})

      const duration = 1000
      const noop = () => {}

      wrapped['kite.heartbeat'](duration, noop, noop)

      expect(thing.heartbeatHandle).toExist()
    })
  })

  it('should use given methods instead of defaults when exists', () => {
    let thing = {}
    let flags = {}
    const wrapped = wrap.call(thing, {
      error: () => (flags.error = true),
      info: () => (flags.info = true),
      log: () => (flags.log = true),
      warn: () => (flags.warn = true),
      'kite.heartbeat': () => (flags['kite.heartbeat'] = true),
    })

    wrapped.error()
    wrapped.info()
    wrapped.log()
    wrapped.warn()
    wrapped['kite.heartbeat']()

    expect(flags.error).toBe(true)
    expect(flags.info).toBe(true)
    expect(flags.log).toBe(true)
    expect(flags.warn).toBe(true)
    expect(flags['kite.heartbeat']).toBe(true)
  })
})
