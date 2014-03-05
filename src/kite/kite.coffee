"use strict"

EventEmitter = require 'events'

module.exports = class Kite extends EventEmitter

  dnodeProtocol = require 'dnode-protocol'

  wrapApi = require './wrap-api.coffee'

  # ready states:
  [ NOTREADY, READY, CLOSED ] = [0,1,3]

  constructor: (options) ->
    return new Kite options  unless this instanceof Kite

    @options =
      if 'string' is typeof options
      then url: options
      else options

    @options.autoReconnect ?= yes

    @readyState = NOTREADY
    
    @initBackoff()  if @options.autoReconnect

    @proto = dnodeProtocol (wrapApi @options.api)
    
    @proto.on 'request', (req) =>
      @ready => @ws.send JSON.stringify req
      @emit 'info', "proto request", req

  # connection state:
  connect: ->
    addr = @options.url
    @ws = new WebSocket addr
    @ws.onopen    = @bound 'onOpen'
    @ws.onclose   = @bound 'onClose'
    @ws.onmessage = @bound 'onMessage'
    @ws.onerror   = @bound 'onError'
    @emit 'info', "Trying to connect to #{ addr }"
    return this

  disconnect: (reconnect = true) ->
    @autoReconnect = !!reconnect  if reconnect?
    @ws.close()
    @emit 'info', "Disconnecting from #{ addr }"
    return this

  # event handlers:
  onOpen: ->
    @readyState = READY
    @emit 'connected', @name
    @emit 'ready'
    @emit 'info', "Connected to Kite: #{ @options.url }"
    @clearBackoffTimeout()
    return

  onClose: ->
    @readyState = CLOSED
    @emit 'disconnected'
    # enable below to autoReconnect when the socket has been closed
    if @autoReconnect
      process.nextTick => @setBackoffTimeout @bound "connect"
    @emit 'info', "#{ @options.url }: disconnected, trying to reconnect..."
    return

  onMessage: ({ data }) ->
    @emit 'info', "onMessage", data
    req = try JSON.parse data
    @proto.handle req  if req?
    return

  onError: ({ data }) ->
    @emit 'info', "#{ @options.url } error: #{ data }"
    return

  # tell:
  tell: (method, params, callback) ->
    options =
      authentication    : @authentication
      withArgs          : params
      responseCallback  : (response) ->
        { withArgs:[{ error: err, result }]} = response
        callback err, result
      kite             :
        username       : "#{KD.nick()}"
        environment    : "#{KD.config.environment}"
        name           : "browser"
        version        : "1.0.#{KD.config.version}"
        region         : "browser"
        hostname       : "browser"
        id             : uniqueID

    # by default, remove this callback after it is called once.
    callback.times ?= 1

    scrubbed = @proto.scrubber.scrub [options]
    scrubbed.method = method
    
    @proto.emit 'request', scrubbed

    return

  # util:
  bound: require './bound.coffee'

  initBackoff: require './backoff.coffee'

  ready: (callback) ->
    if @readyState is READY
    then process.nextTick callback
    else @once 'ready', callback
