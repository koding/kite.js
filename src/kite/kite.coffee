EventEmitter = require 'events'

module.exports = class Kite extends EventEmitter

  dnodeProtocol = require 'dnode-protocol'

  wrapApi = require './wrap-api.coffee'

  # ready states:
  [ NOTREADY, READY, CLOSED ] = [0,1,3]

  constructor: (@options) ->
    @options.autoReconnect ?= yes

    @readyState = NOTREADY
    @initBackoff()  if @options.autoReconnect

    @proto = dnodeProtocol (wrapApi @options.api)

    @proto.on 'request', (req) =>
      @emit 'info', "proto request", req
      @ready => 
        @ws.send JSON.stringify req

  # connection state:
  connect: ->
    addr = @options.url
    @emit 'info', "Trying to connect to #{addr}"
    @ws = new WebSocket addr
    @ws.onopen    = @bound 'onOpen'
    @ws.onclose   = @bound 'onClose'
    @ws.onmessage = @bound 'onMessage'
    @ws.onerror   = @bound 'onError'

  disconnect: (reconnect=true) ->
    @autoReconnect = !!reconnect  if reconnect?
    @ws.close()

  # event handlers:
  onOpen: ->
    @emit 'info', "Connected to Kite: #{@options.url}"
    @clearBackoffTimeout()
    @readyState = READY
    @emit 'connected', @name
    @emit 'ready'

  onClose: (evt)->
    @emit 'info', "#{@options.url}: disconnected, trying to reconnect..."
    @readyState = CLOSED
    @emit 'disconnected'
    # enable below to autoReconnect when the socket has been closed
    if @autoReconnect
      KD.utils.defer => @setBackoffTimeout @bound "connect"

  onMessage: (evt)->
    data = evt.data
    @emit 'info', "onMessage", data
    req = JSON.parse data
    @proto.handle(req)

  onError: (evt)->
    @emit 'info', "#{@options.url} error: #{evt.data}"

  # tell:
  tell: (method, params, callback) ->
    options =
      authentication    : @authentication
      withArgs          : params
      responseCallback  : (response) ->
        { withArgs:[{ error: err, result }]} = response
        callback err, result

    # by default, remove this callback after it is called once.
    callback.times ?= 1

    scrubbed = @proto.scrubber.scrub [options]
    scrubbed.method = method
    
    @proto.emit 'request', scrubbed

  # util:
  bound: require './bound.coffee'

  initBackoff: require './backoff.coffee'

  ready: (callback) ->
    if @readyState is READY
    then process.nextTick callback
    else @once 'ready', callback

