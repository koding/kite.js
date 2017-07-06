import expect from 'expect'
import wrap from './wrap'

describe('kite/wrap', () => {
  it('should include default api methods', () => {
    const wrapped = wrap()

    expect(wrapped['kite.systemInfo']).toBeA('function')
    expect(wrapped['kite.heartbeat']).toBeA('function')
    expect(wrapped['kite.ping']).toBeA('function')
    expect(wrapped['kite.tunnel']).toBeA('function')
    expect(wrapped['kite.log']).toBeA('function')
    expect(wrapped['kite.print']).toBeA('function')
    expect(wrapped['kite.prompt']).toBeA('function')
    expect(wrapped['kite.getPass']).toBeA('function')
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
      'kite.systemInfo': () => (flags['kite.systemInfo'] = true),
      'kite.heartbeat': () => (flags['kite.heartbeat'] = true),
      'kite.ping': () => (flags['kite.ping'] = true),
      'kite.tunnel': () => (flags['kite.tunnel'] = true),
      'kite.log': () => (flags['kite.log'] = true),
      'kite.print': () => (flags['kite.print'] = true),
      'kite.prompt': () => (flags['kite.prompt'] = true),
      'kite.getPass': () => (flags['kite.getPass'] = true),
      'kite.heartbeat': () => (flags['kite.heartbeat'] = true),
    })

    wrapped['kite.systemInfo']()
    wrapped['kite.heartbeat']()
    wrapped['kite.ping']()
    wrapped['kite.tunnel']()
    wrapped['kite.log']()
    wrapped['kite.print']()
    wrapped['kite.prompt']()
    wrapped['kite.getPass']()
    wrapped['kite.heartbeat']()

    expect(flags['kite.systemInfo']).toBe(true)
    expect(flags['kite.heartbeat']).toBe(true)
    expect(flags['kite.ping']).toBe(true)
    expect(flags['kite.tunnel']).toBe(true)
    expect(flags['kite.log']).toBe(true)
    expect(flags['kite.print']).toBe(true)
    expect(flags['kite.prompt']).toBe(true)
    expect(flags['kite.getPass']).toBe(true)
    expect(flags['kite.heartbeat']).toBe(true)
  })
})
