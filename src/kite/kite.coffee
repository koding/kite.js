"use strict"

{ EventEmitter } = require 'events'

module.exports = class Kite extends EventEmitter

  { @version } = require '../../package.json'

  dnodeProtocol = require 'dnode-protocol'
  WebSocket     = require 'ws'
  atob          = require 'atob'

  wrapApi = require './wrap-api.coffee'
  { now } = require '../util.coffee'
  handleIncomingMessage = require '../incoming-message-handler.coffee'
  enableLogging = require '../logging/logging.coffee'

  Timeout = require '../delayed/timeout.coffee'
  KiteError = require '../error.coffee'
  # expose the error object for its predicates
  @Error = KiteError

  # ready states:
  [ NOTREADY, READY, CLOSED ] = [0,1,3]

  # error states:
  [ OKAY, ERROR ] = [0,1]

  { v4: uniqueId } = require 'node-uuid'

  @transportClass = require 'ws'

  constructor: (options) ->
    return new Kite options  unless this instanceof Kite

    @id = uniqueId()

    @options =
      if 'string' is typeof options
      then url: options
      else options

    # user-friendly defaults:
    @options.autoConnect   ?= yes
    @options.autoReconnect ?= yes

    # refresh expired tokens
    @expireTokenOnExpiry()

    @options.url += @options.prefix  if @options.prefix

    enableLogging @options.name, this, @options.logLevel

    @readyState = NOTREADY

    @initBackoff()  if @options.autoReconnect

    @proto = dnodeProtocol wrapApi.call this, @options.api

    @proto.on 'request', (req) =>
      @ready => @ws.send JSON.stringify req
      @emit 'debug', "Sending: ", JSON.stringify req
      return

    @connect()  if @options.autoConnect

  getToken: ->
    @options.auth.key

  setToken: (token) ->
    # FIXME: this setter is not symettrical with the getter
    throw new Error "Invalid auth type!"  unless @options.auth?.type is 'token'
    @options.auth.key = token
    @emit 'tokenSet', token

  # connection state:
  connect: ->
    return  if @readyState is READY
    { url, transportClass, transportOptions } = @options
    konstructor = transportClass ? @constructor.transportClass
    options = transportOptions ? @constructor.transportOptions
    @ws = new konstructor url, null, options
    @ws.addEventListener 'open',    @bound 'onOpen'
    @ws.addEventListener 'close',   @bound 'onClose'
    @ws.addEventListener 'message', @bound 'onMessage'
    @ws.addEventListener 'error',   @bound 'onError'
    @ws.addEventListener 'info',    (info) => @emit 'info', info
    @emit 'info', "Trying to connect to #{ url }"
    return

  disconnect: (reconnect = false) ->
    for handle in ['heartbeatHandle', 'expiryHandle'] when @[handle]?
      @[handle].clear()
      @[handle] = null
    @options.autoReconnect = !!reconnect
    @ws.close()
    @emit 'notice', "Disconnecting from #{ @options.url }"
    return

  # event handlers:
  onOpen: ->
    @readyState = READY
    @emit 'connected'
    @emit 'ready'
    @emit 'notice', "Connected to Kite: #{ @options.url }"
    @clearBackoffTimeout()
    return

  onClose: ->
    @readyState = CLOSED
    @emit 'disconnected'

    dcInfo = "#{ @options.url }: disconnected"
    # enable below to autoReconnect when the socket has been closed
    if @options.autoReconnect
      process.nextTick => @setBackoffTimeout @bound "connect"
      dcInfo += ', trying to reconnect...'

    @emit 'info', dcInfo
    return

  onMessage: ({ data }) ->
    handleIncomingMessage.call this, @proto, data
    return

  onError: (err) ->
    console.log err
    @emit 'error', "Websocket error!"
    return

  getKiteInfo: (params) ->
    username    : "#{ @options.username ? 'anonymous' }"
    environment : "#{ @options.environment ? 'browser-environment' }"
    name        : "#{ params?[0]?.kiteName ? @options.name ? 'browser-kite' }"
    version     : "#{ @options.version ? '1.0.0' }"
    region      : "#{ @options.region ? 'browser-region' }"
    hostname    : "#{ @options.hostname ? 'browser-hostname' }"
    id          : @id

  wrapMessage: (method, params, callback) ->
    kite              : @getKiteInfo params
    authentication    : @options.auth
    withArgs          : params
    responseCallback  : (response) =>
      { error: rawErr, result } = response

      err = if rawErr? then makeProperError rawErr else null

      callback err, result

  tell: (method, params, callback) ->
    # by default, remove this callback after it is called once.
    callback.times ?= 1

    scrubbed = @proto.scrubber.scrub [@wrapMessage method, params, callback]
    scrubbed.method = method

    @proto.emit 'request', scrubbed
    return

  # token expiry:

  expireTokenOnExpiry: ->
    return  unless @options.auth?.type is 'token'

    { auth: { key: token }} = @options

    [ _, claimsA ] = token.split '.'

    claims = try JSON.parse atob claimsA

    if claims?.exp
      # the `exp` is measured in seconds since the UNIX epoch; convert to ms
      expMs = claims.exp * 1000
      nowMs = +now()
      # renew token before it expires:
      earlyMs = 5 * 60 * 1000 # 5 min
      renewMs = expMs - nowMs - earlyMs
      @expiryHandle = new Timeout (@bound 'expireToken'), renewMs
    return

  expireToken: (callback) ->
    if callback?
      @once 'tokenSet', (newToken) -> callback null, newToken
    @emit 'tokenExpired'
    if @expiryHandle
      @expiryHandle.clear()
      @expiryHandle = null
    return

  # util:
  makeProperError = ({ type, message, code }) ->
    err = new KiteError message
    err.type = type
    err.code = code
    err

  bound: require '../bound.coffee'

  initBackoff: require './backoff.coffee'

  ready: (callback) ->
    if @readyState is READY
    then process.nextTick callback
    else @once 'ready', callback
    return

  ping: (callback) ->
    @tell 'kite.ping', callback

  # static helpers:
  @disconnect = (kites...) ->
    kite.disconnect()  for kite in kites
    return

  @random = (kites) ->
    kites[Math.floor Math.random() * kites.length]
