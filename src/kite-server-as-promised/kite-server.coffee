"use strict"

BasicKiteServer = require '../kite-server/kite-server.coffee'

module.exports = class KiteServer extends BasicKiteServer

  constructor: (api) ->
    return new KiteServer api  unless this instanceof KiteServer
