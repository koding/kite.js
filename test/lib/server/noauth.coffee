KiteServer = require '../../../server'

{ logLevels } = require '../../../logging'

module.exports = new KiteServer
  name        : 'noauth'
  username    : 'testuser'
  environment : 'vagrant'
  region      : 'vagrant'
  version     : '1.0.0'
  prefix      : '/echo'
  auth        : no
  logLevel    : logLevels.DEBUG
  api         :
    noAuth    : (callback) -> callback null, 'yep'
    yesAuth   :
      auth    : yes
      func    : (callback) -> callback null, 'nope'