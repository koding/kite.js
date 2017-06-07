import BaseKite from './base'
import Promise from 'bluebird'

class Kite extends BaseKite {
  tell(method, ...params) {
    return new Promise((resolve, reject) =>
      super.tell(method, ...params, (err, result) => {
        if (err) {
          return reject(err)
        }
        return resolve(result)
      })
    )
  }

  ready(callback) {
    return new Promise(resolve => super.ready(resolve)).nodeify(callback)
  }
}

Kite.expireToken = Promise.promisify(BaseKite.prototype.expireToken)

export default Kite
