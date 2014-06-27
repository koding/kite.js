{ Server: WebSocketServer } = require 'ws'

EventEmitter = require '../../event-emitter.coffee'
Session = require './session.coffee'

module.exports = class Server extends EventEmitter

  @scheme = 'ws'
  @secureScheme = 'wss'

  constructor: (options) ->
    return new Server options  unless this instanceof Server
    @options = options
    @server = new WebSocketServer port: options.port

    @server.on 'connection', (connection) =>
      @emit 'connection', new Session connection

  getAddress: ->
    "#{ @server.options.host }:#{ @server.options.port }"

  close: ->
    @server?.close()
