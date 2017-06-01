let Kite
const BaseKite = require('./base')
const Promise = require('bluebird')

module.exports = Kite = (() => {
  Kite = class Kite extends BaseKite {
    static initClass () {
      this.prototype.expireToken = Promise.promisify(this.prototype.expireToken)
    }

    tell (method, params, callback) {
      return new Promise((resolve, reject) =>
        Kite.prototype.__proto__.tell.call(this, method, params, (err, result) => {
          if (err) {
            return reject(err)
          }
          return resolve(result)
        })
      ).nodeify(callback)
    }

    ready (callback) {
      return new Promise(resolve => Kite.prototype.__proto__.ready.call(this, resolve)).nodeify(callback)
    }
  }
  Kite.initClass()
  return Kite
})()
