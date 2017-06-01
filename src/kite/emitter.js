const { EventEmitter } = require('events')
const define = require('./define')

module.exports = class Emitter extends EventEmitter {
  bound(method) {
    if (this[method] == null) {
      throw new Error(`Could not bind method: ${method}`)
    }
    const boundMethod = `__bound__${method}`
    boundMethod in this ||
      define(this, boundMethod, { value: this[method].bind(this) })
    return this[boundMethod]
  }
}
