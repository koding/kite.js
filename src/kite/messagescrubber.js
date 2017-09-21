import KiteError from './error'
import { Event } from '../constants'

export default class MessageScrubber {
  static defaultCallback = kite => () => {
    kite.emit(Event.debug, 'Unhandled call dropping to the floor.')
  }

  constructor({ kite } = {}) {
    if (!kite) {
      throw new Error(`invalid kite: ${typeof kite}`)
    }

    this.kite = kite
  }

  wrapMessage(params, callback) {
    return {
      kite: this.kite.getKiteInfo(),
      authentication: this.kite.options.auth,
      withArgs: params,
      responseCallback(response) {
        const { error: rawErr, result } = response || {}
        const err = rawErr != null ? KiteError.makeProperError(rawErr) : null

        return callback(err, result)
      },
    }
  }

  scrub(method, params, callback) {
    if (!callback && typeof params === 'function') {
      callback = params
      params = []
    }

    callback = callback || MessageScrubber.defaultCallback(this.kite)

    // by default, remove this callback after it is called once.
    if (callback.times == null) {
      callback.times = 1
    }

    let scrubbed = this.kite.proto.scrubber.scrub([
      this.wrapMessage(params, callback),
    ])

    scrubbed.method = method

    return scrubbed
  }
}
