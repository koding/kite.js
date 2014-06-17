SockJsServer  = require '../../../extras/sockjs-server/server.js'
KiteServer    = require '../../../server'

module.exports = new KiteServer
  name        : 'echo'
  username    : 'koding'
  environment : 'vagrant'
  region      : 'vagrant'
  version     : '1.0.0'
  serverClass : SockJsServer
  prefix      : '/echo'
  api         :
    echo      : (it, echo) -> echo it