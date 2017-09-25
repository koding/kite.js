import KiteError from './error'

export default class MessageScrubber {
  static defaultCallback = logger => () => {
    logger.debug('Unhandled call dropping to the floor.')
  }

  constructor({ info, auth, proto, logger } = {}) {
    if (!info) {
      throw new Error(`invalid kite info: ${typeof info}`)
    }

    this.info = info
    this.auth = auth
    this.proto = proto
    this.logger = logger
  }

  wrapMessage(params, callback) {
    return {
      kite: this.info,
      authentication: this.auth,
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

    callback = callback || MessageScrubber.defaultCallback(this.logger)

    // by default, remove this callback after it is called once.
    if (callback.times == null) {
      callback.times = 1
    }

    let scrubbed = this.proto.scrubber.scrub([
      this.wrapMessage(params, callback),
    ])

    scrubbed.method = method

    return scrubbed
  }
}
