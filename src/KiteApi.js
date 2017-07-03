import { DefaultApi } from './constants'

const isFunction = thing => typeof thing === 'function'

export default class KiteApi {
  constructor({ auth, methods }) {
    this.auth = auth
    this.methods = this.setMethods(Object.assign({}, DefaultApi, methods))
  }

  setMethods(methods) {
    return Object.keys(methods).reduce((acc, methodName) => {
      return Object.assign(acc, this.setMethod(methodName, methods[methodName]))
    }, {})
  }

  setMethod(methodName, fn) {
    let auth, func

    if (isFunction(fn)) {
      func = fn
      auth = undefined
    } else if (isFunction(fn.func)) {
      func = fn.func
      auth = fn.auth
    } else {
      throw new Error(
        `Argument must be a function or an object with a func property`
      )
    }

    auth = auth != null ? auth : this.auth
    func.mustAuth = auth != null ? auth : true

    return {
      [methodName]: func,
    }
  }

  shouldAuthenticate(method) {
    return this.methods[method] && this.methods[method].mustAuth
  }
}
