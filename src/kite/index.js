const BaseKite = require('./base')
const Promise = require('bluebird')

class Kite extends BaseKite {
  tell(method, params, callback) {
    return new Promise((resolve, reject) =>
      super.tell(method, params, (err, result) => {
        if (err) {
          return reject(err)
        }
        return resolve(result)
      })
    ).nodeify(callback)
  }

  ready(callback) {
    return new Promise(resolve => super.ready(resolve)).nodeify(callback)
  }
}

Kite.expireToken = Promise.promisify(BaseKite.prototype.expireToken)

export default Kite
