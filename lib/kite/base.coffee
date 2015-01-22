dnode = require 'dnode-protocol'
WebSocket = require 'ws'
atob = require 'atob'
uuid = require 'node-uuid'
Emitter = require('events').EventEmitter
now = require './now'
backoff = require './backoff'
wrap = require './wrap'
handleIncomingMessage = require './handleIncomingMessage'
enableLogging = require './enableLogging'
Timeout = require './timeout'
KiteError = require './error'
bound_ = require './bound'

module.exports = class Kite extends Emitter

  @version = '0.4.0-rc1'
  @Error = KiteError
  @transportClass = WebSocket
  [ NOTREADY, READY, CLOSED, CONNECTING ] = [0, 1, 3, 5]
  [ OKAY, ERROR ] = [0, 1]
  TIMER_HANDLES = ['heartbeatHandle', 'expiryHandle', 'backoffHandle']

  constructor: (options) ->
    return new Kite options  unless this instanceof Kite

    @id = uuid.v4()
    @options =
      if 'string' is typeof options
      then url: options
      else options
    @options.autoConnect   ?= yes
    @options.autoReconnect ?= yes
    @options.url += @options.prefix  if @options.prefix

    enableLogging @options.name, this, @options.logLevel

    # refresh expired tokens
    @expireTokenOnExpiry()

    @readyState = NOTREADY

    @initBackoff()  if @options.autoReconnect

    @proto = dnode wrap.call this, @options.api

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

  connect: ->
    return  if @readyState in [CONNECTING, READY]
    @readyState = CONNECTING
    { url, transportClass, transportOptions } = @options
    konstructor = transportClass ? @constructor.transportClass
    options = transportOptions ? @constructor.transportOptions
    @ws =
      if konstructor is WebSocket
      then new konstructor url # websocket will whine if extra arguments are passed
      else new konstructor url, null, options
    @ws.addEventListener 'open',    @bound 'onOpen'
    @ws.addEventListener 'close',   @bound 'onClose'
    @ws.addEventListener 'message', @bound 'onMessage'
    @ws.addEventListener 'error',   @bound 'onError'
    @ws.addEventListener 'info',    (info) => @emit 'info', info
    @emit 'info', "Trying to connect to #{ url }"
    return

  disconnect: (reconnect = false) ->
    for handle in TIMER_HANDLES when @[handle]?
      @[handle].clear()
      @[handle] = null
    @options.autoReconnect = !!reconnect
    @ws?.close()
    @emit 'notice', "Disconnecting from #{ @options.url }"
    return

  onOpen: ->
    @readyState = READY
    # FIXME: the following is ridiculous.
    @emit 'open'
    @emit 'notice', "Connected to Kite: #{ @options.url }"
    @clearBackoffTimeout?()
    return

  onClose: (event)->
    @readyState = CLOSED
    @emit 'close', event

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

  makeProperError = ({ type, message, code }) ->
    err = new KiteError message
    err.type = type
    err.code = code
    err

  bound: bound_

  initBackoff: backoff

  ready: (callback) ->
    if @readyState is READY
    then process.nextTick callback
    else @once 'open', callback
    return

  ping: (callback) ->
    @tell 'kite.ping', callback

  @disconnect = (kites...) ->
    kite.disconnect()  for kite in kites
    return

  @random = (kites) ->
    kites[Math.floor Math.random() * kites.length]

