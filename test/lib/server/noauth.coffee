KiteServer = require '../../../server'

{ disableAuthentication }  = KiteServer

module.exports = new KiteServer
  name        : 'noauth'
  username    : 'testuser'
  environment : 'vagrant'
  region      : 'vagrant'
  version     : '1.0.0'
  prefix      : '/echo'
  auth        : no
  api         :
    noAuth    : (callback) -> callback null, 'yep'
    yesAuth   :
      auth    : yes
      func    : (callback) -> callback null, 'nope'