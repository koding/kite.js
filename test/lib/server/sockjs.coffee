SockJs        = require 'node-sockjs-client'
SockJsServer  = require '../../../lib/kite-server/sockjs/server.js'
KiteServer    = require '../../../server'

module.exports = new KiteServer
  name            : 'echo'
  username        : 'testuser'
  environment     : 'vagrant'
  region          : 'vagrant'
  version         : '1.0.0'
  serverClass     : SockJsServer
  transportClass  : SockJs
  prefix          : '/echo'
  api             :
    echo          : (it, echo) -> echo null, it