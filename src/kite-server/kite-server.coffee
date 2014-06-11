"use strict"

{ EventEmitter } = require 'events'

module.exports = class KiteServer extends EventEmitter

  { @version } = require '../../package.json'

  Promise = require 'bluebird'
  dnodeProtocol = require 'dnode-protocol'
  toArray = Promise.promisify require 'stream-to-array'
  fs = Promise.promisifyAll require 'fs'

  KiteError = require '../error.coffee'
  Kontrol = require '../kontrol-as-promised/kontrol.coffee'

  enableLogging = require '../logging/logging.coffee'

  { v4: createId } = require 'node-uuid'

  { Server: @serverClass } = require 'ws'

  constructor: (options) ->
    return new KiteServer api  unless this instanceof KiteServer
    @options = options

    @options.hostname ?= require('os').hostname()

    enableLogging options.name, this, options.logLevel

    @id = createId()
    @server = null

    @methods options.api  if options.api?

    @currentToken = null

  getToken: -> @currentToken

  method: (methodName, fn) ->
    @api ?= (require './default-api.coffee')()
    @api[methodName] = fn

  methods: (methods) ->
    @method methodName, fn for methodName, fn of methods

  listen: (port) ->
    throw new Error "Already listening!"  if @server?
    @port = port
    { serverClass } = @options
    @server = new (serverClass ? @constructor.serverClass) { port }
    @server.on 'connection', @bound 'onConnection'
    @emit 'info', "Listening: #{ @server.options.host }:#{ @server.options.port }"

  register: ({ to: u, host: h, kiteKey: k }) ->
    throw new Error "Already registered!"  if @kontrol?
    Promise.all([
      Promise.cast u
      Promise.cast h
      @normalizeKiteKey k
    ]).spread (kontrolUri, host, key) =>
      { name, username, environment, version, region, hostname, logLevel } = @options

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
        logLevel    : logLevel
      .on 'connected', =>
        @emit 'info', "Connected to Kontrol"

      kiteUri = "ws://#{ host }:#{ @port }/#{ @options.name }"

      @kontrol.register(url: kiteUri).then =>
        @emit 'info', "Registered to Kontrol with URL: #{ kiteUri }"

  normalizeKiteKey: Promise.method (src, enc = "utf-8") -> switch
    when 'string' is typeof src
      fs.readFileAsync(src, enc)
        .catch (err) ->
          return src  if err.code is 'ENOENT' # assume string itself is key
          throw err
    when 'function' is typeof src.pipe
      toArray(src).then (arr) -> arr.join '\n'
    else throw new Error """
      Don't know how to normalize the kite key: #{ src }
      """

  onConnection: (ws) ->
    proto = dnodeProtocol @api
    proto.on 'request', @handleRequest.bind this, ws
    ws.on 'message', @handleMessage.bind this, proto
    ws.on 'close', =>
      @emit 'info', 'Client has disconnected: '
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
