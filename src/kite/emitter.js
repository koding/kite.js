import { EventEmitter } from 'events'
import define from './define'

export default class Emitter extends EventEmitter {
  bound(method) {
    if (this[method] == null) {
      throw new Error(`Could not bind method: ${method}`)
    }
    const boundMethod = `__bound__${method}`
    boundMethod in this ||
      define(this, boundMethod, { value: this[method].bind(this) })
    return this[boundMethod]
  }

  lazyBound(method, ...args) {
    if (typeof this[method] === 'function') {
      return this[method].bind(this, ...args)
    }

    throw new Error(`lazyBound: unknown method! ${method}`)
  }
}
