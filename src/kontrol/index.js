const BaseKontrol = require('./base')
const Promise = require('bluebird')

const methods = [
  'fetchKites',
  'fetchKite',
  'watchKites',
  'cancelWatcher',
  'register',
]

class Kontrol extends BaseKontrol {}

Kontrol.prototype.Kite = require('../kite')

for (var method of methods)
  Kontrol.prototype[method] = Promise.promisify(BaseKontrol.prototype[method])

export default Kontrol
