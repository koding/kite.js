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
        super.tell(method, params, (err, result) => {
          if (err) {
            return reject(err)
          }
          return resolve(result)
        })
      ).nodeify(callback)
    }

    ready (callback) {
      return new Promise(resolve => super.ready(resolve)).nodeify(callback)
    }
  }
  Kite.initClass()
  return Kite
})()
