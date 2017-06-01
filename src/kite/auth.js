const Promise = require('bluebird')
const atob = require('atob')
const handleToken = require('./token')
const whitelist = require('./whitelist')

module.exports = Promise.method(function (method, auth, kiteKey) {
  if (auth == null) {
    if (whitelist.includes(method) || !(this.api != null ? this.api[method].mustAuth : undefined)) {
      return
    }
    throw new Error('Access denied!')
  }

  const { type, key } = auth

  switch (type) {
    case 'token':
      return handleToken(key, kiteKey)
    default:
      throw new Error(`Unknown auth type: ${type}`)
  }
})
