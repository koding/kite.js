module.exports = class ClientHandler

  constructor: (@ctx) ->

  onOpen: ->
    @ctx.readyState = READY
    @ctx.emit 'connected'
    @ctx.emit 'ready'
    @ctx.emit 'info', "Connected to Kite: #{ @ctx.options.url }"
    @ctx.clearBackoffTimeout()
    return

  onClose: ->
    @ctx.readyState = CLOSED
    @ctx.emit 'disconnected'
    # enable below to autoReconnect when the socket has been closed
    if @ctx.autoReconnect
      process.nextTick => @ctx.setBackoffTimeout @ctx.bound "connect"

    if @ctx.errState is ERROR
      @ctx.emit 'error', "Websocket error!"
      @ctx.errState = OKAY

    @ctx.emit 'info', "#{ @ctx.options.url }: disconnected, trying to reconnect..."
    return

  onMessage: ({ data }) ->
    @ctx.emit 'info', "onMessage", data
    req = try JSON.parse data
    @ctx.proto.handle req  if req?
    return

  onError: (err) ->
    @ctx.errState = ERROR
    @ctx.emit 'info', "#{ @ctx.options.url } error: #{ err.data }"
    return
