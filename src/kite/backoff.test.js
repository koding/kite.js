import expect from 'expect'
import backoff from './backoff'

describe('backoff', () => {
  // ideally this is a kite
  class Thing {}
  Thing.prototype.initBackoff = backoff

  it('works with being attached to a prototype', () => {
    // method names to be attached
    const methods = [
      'clearBackoffTimeout',
      'clearBackoffHandle',
      'setBackoffTimeout',
    ]

    const thing = new Thing()

    methods.forEach(method => expect(thing[method]).toNotExist())

    thing.initBackoff()

    methods.forEach(method =>
      expect(thing[method]).toExist(`${method} does not exist`)
    )
  })
})
