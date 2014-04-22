"use strict"

{ EventEmitter } = require 'events'

module.exports = class KiteServer extends EventEmitter

  { Server: WebSocketServer } = require 'ws'
  dnodeProtocol = require 'dnode-protocol'
  jwt = require 'jwt-simple'

  KiteError = require '../error.coffee'

  Kontrol = require '../kontrol-as-promised/kontrol.coffee'

  Kite = require '../kite-as-promised/kite.coffee'

  wrapApi = require './wrap-api.coffee'

  constructor: (api) ->
    return new KiteServer api  unless this instanceof KiteServer

    @api = wrapApi api
    @server = null

  listen: (port) ->
    throw new Error "Already listening!"  if @server?
    @server = new WebSocketServer { port }
    @server.on 'connection', @bound 'onConnection'

  register: (kontrolUri, kiteKey) ->
    @kontrol = new Kontrol
      url: kontrolUri
      auth:
        type: 'token'
        key: kiteKey

    @kontrol
      .register kiteKey
      .then console.log, console.warn

  onConnection: (ws) ->
    proto = dnodeProtocol @api
    proto.on 'request', @handleRequest.bind this, ws
    ws.on 'message', @handleMessage.bind this, ws, proto

  handleMessage: (ws, proto, message) ->
    req = try JSON.parse message

    unless req?
      @emit 'warning', new KiteError "Invalid payload! (#{ message })"
      return

    { arguments: args, links, callbacks, method } = req

    [{ withArgs, responseCallback, kite }] = args

    withArgs ?= []

    withArgs = [withArgs]  unless Array.isArray withArgs

    # FIXME: this is an ugly hack; there must be a better way to implement it:
    for own k, c of callbacks when (c.join '.') is '0.responseCallback'
      callbacks[k] = [withArgs.length]
      break

    proto.handle {
      method
      arguments: [withArgs..., responseCallback]
      links
      callbacks
    }

  handleRequest: (ws, response) ->
    { arguments: args, method, callbacks, links } = response
    [ err, result ] = args
    message = { error: err, result }
    ws.send JSON.stringify {
      method
      arguments: [message]
      links
      callbacks
    }

  bound: require '../bound.coffee'
