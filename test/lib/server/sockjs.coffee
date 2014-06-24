SockJs        = require 'node-sockjs-client'
SockJsServer  = require '../../../lib/kite-server/sockjs/server.js'
KiteServer    = require '../../../server'

{ logLevels } = require '../../../logging'

module.exports = new KiteServer
  name            : 'echo'
  username        : 'testuser'
  environment     : 'vagrant'
  region          : 'vagrant'
  version         : '1.0.0'
  serverClass     : SockJsServer
  transportClass  : SockJs
  prefix          : '/echo'
  logLevel        : logLevels.DEBUG
  api             :
    echo          : (it, echo) -> echo null, it