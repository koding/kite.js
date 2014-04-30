"use strict"

{ EventEmitter } = require 'events'

module.exports = class KiteServer extends EventEmitter

  Promise = require 'bluebird'
  { Server: WebSocketServer } = require 'ws'
  dnodeProtocol = require 'dnode-protocol'
  toArray = Promise.promisify require 'stream-to-array'
  fs = Promise.promisifyAll require 'fs'

  KiteError = require '../error.coffee'
  Kontrol = require '../kontrol-as-promised/kontrol.coffee'

  wrapApi = require './wrap-api.coffee'
  enableLogging = require '../logging.coffee'

  { v4: createId } = require 'node-uuid'

  constructor: (options) ->
    return new KiteServer api  unless this instanceof KiteServer
    @options = options

    @options.hostname ?= require('os').hostname()

    enableLogging options.name, this, options.logLevel

    @id = createId()
    @api = wrapApi options.api
    @server = null

  listen: (port) ->
    throw new Error "Already listening!"  if @server?
    @port = port
    @server = new WebSocketServer { port }
    @server.on 'connection', @bound 'onConnection'
    @emit 'info', "Listening: #{ @server.options.host }:#{ @server.options.port }"

  register: (kontrolUri, kiteUri, kiteKey) ->
    throw new Error "Already registered!"  if @kontrol?
    kontrolUriP = Promise.cast kontrolUri
    kiteUriP = Promise.cast kiteUri
    Promise.all [kontrolUriP, kiteUriP, @normalizeKiteKey(kiteKey)]
      .spread (kontrolUri, kiteUri, key) =>
        { name, username, environment, version, region, hostname } = @options

        throw new Error "No kite key!"  unless key?

        @key = key

        @kontrol = new Kontrol
          url         : kontrolUri
          auth        : { type: 'kiteKey', key }
          name        : name
          username    : username
          environment : environment
          version     : version
          region      : region
          hostname    : hostname

        @kontrol.register url: "ws://#{ kiteUri }:#{ @port }/math"

  normalizeKiteKey: Promise.method (src, enc = "utf-8") -> switch
    when 'string' is typeof src
      fs.readFileAsync(src, enc)
        .catch (err) ->
          return src  if err.code is 'ENOENT' # assume string itself is key
          throw err
    when 'function' is typeof src.pipe
      toArray(src).then (arr) -> arr.join '\n'
    else throw new Error """
      Don't know how to get the kite key: #{ src }
      """

  onConnection: (ws) ->
    proto = dnodeProtocol @api
    proto.on 'request', @handleRequest.bind this, ws
    ws.on 'message', @handleMessage.bind this, proto

    @emit 'info', "New connection from: #{ ws._socket.remoteAddress }:#{ ws._socket.remotePort }"

  handleMessage: require '../incoming-message-handler.coffee'

  handleRequest: (ws, response) ->
    { arguments: args, method, callbacks, links } = response
    [ err, result ] = args
    message = { error: err, result }
    messageStr = JSON.stringify {
      method
      arguments: [message]
      links
      callbacks
    }
    @emit 'debug', "Sending: #{ messageStr }"
    ws.send messageStr

  bound: require '../bound.coffee'
