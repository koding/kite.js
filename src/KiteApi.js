import dnode from 'dnode-protocol'
import { DefaultApi } from './constants'

const isFunction = thing => typeof thing === 'function'

export default class KiteApi {
  constructor({ auth, methods }) {
    this.auth = auth
    this.methods = this.setMethods(Object.assign({}, DefaultApi, methods))
    this.methodKeys = Object.keys(this.methods)
    this.proto = this.makeProto()
  }

  makeProto() {
    return dnode(this.methods)
  }

  hasMethod(method) {
    if (!method || method === '') return false
    return this.methodKeys.includes(method)
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
      [methodName]: ({ withArgs, authentication, responseCallback, kite }) => {
        const args = Array.isArray(withArgs) ? withArgs : [withArgs]
        func(...args, responseCallback, { kite, authentication })
      },
    }
  }

  shouldAuthenticate(method) {
    return this.methods[method] && this.methods[method].mustAuth
  }
}
