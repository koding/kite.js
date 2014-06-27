util = require 'util'
sockJS = require 'sockjs'
http = require 'http'

EventEmitter = require '../../event-emitter.coffee'
Session = require './session.js'

module.exports = class Server extends EventEmitter

  @scheme = 'http'
  @secureScheme = 'https'

  constructor: (options) ->
    return new Server options  unless this instanceof Server
    @sockjs = sockJS.createServer()
    @server = http.createServer()
    @options = options

    @sockjs.on 'connection', (connection) =>
      @emit 'connection', new Session connection

    @sockjs.installHandlers @server, prefix: options.prefix or ''

    # WebSocketServer connects automatically:
    @server.listen options.port, options.hostname


  getAddress: ->
    @server._connectionKey

  close: ->
    if @server?
      @server.close()
