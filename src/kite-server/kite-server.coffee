"use strict"

{ EventEmitter } = require 'events'

SockJS = require 'node-sockjs-client'

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

  @serverClass = require './websocket/server.coffee'

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
    @api ?= do require './default-api.coffee'
    @api[methodName] = fn

  methods: (methods) ->
    @method methodName, fn for methodName, fn of methods

  getServerClass: ->
    @options.serverClass ? @constructor.serverClass

  getPrefix: ->
    { prefix } = @options
    prefix ?= ''
    prefix = "/#{prefix}"  unless '/' is prefix.charAt 0
    prefix

  listen: (port) ->
    throw new Error "Already listening!"  if @server?
    @port = port
    prefix = @getPrefix()
    Server = @getServerClass()
    @server = new Server { port, prefix }
    @server.on 'connection', @bound 'onConnection'
    @emit 'info', "Listening: #{ @server.getAddress() }"

  close: ->
    @server?.close()
    @server = null
    @kontrol?.disconnect()
    @kontrol = null

  register: ({ to: u, host: h, kiteKey: k }) ->
    throw new Error "Already registered!"  if @kontrol?
    Promise.all([
      Promise.cast u
      Promise.cast h
      @normalizeKiteKey k
    ]).spread (kontrolUri, host, key) =>
      { name, username, environment, version, region, hostname, logLevel, transportClass, secure } = @options

      Server = @getServerClass()

      scheme = (
        if secure is true
        then Server.secureScheme
        else Server.scheme
      ) or 'ws'

      throw new Error "No kite key!"  unless key?

      @key = key

      @kontrol = new Kontrol
        url             : kontrolUri
        auth            : { type: 'kiteKey', key }
        name            : name
        username        : username
        environment     : environment
        version         : version
        region          : region
        hostname        : hostname
        logLevel        : logLevel
        transportClass  : transportClass
      .on 'connected', =>
        @emit 'info', "Connected to Kontrol"

      kiteUri = "#{ scheme }://#{ host }:#{ @port }/#{ @options.name }"

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
    id = ws.getId()
    ws.on 'message', @handleMessage.bind this, proto
    ws.on 'close', =>
      @emit 'info', "Client has disconnected: #{ id }"
    @emit 'info', "New connection from: #{ id }"

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
