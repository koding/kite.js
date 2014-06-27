util = require 'util'

EventEmitter = require '../../event-emitter.coffee'

module.exports = class Session extends EventEmitter

  constructor: (connection) ->
    return new Session connection  unless this instanceof Session
    @connection = connection

    @connection.on 'data', (message) =>
      @emit 'message', message

    @connection.on 'close', =>
      @emit 'close'

  getId: ->
    "#{ @connection.remoteAddress }:#{ @connection.remotePort }"

  send: (message) ->
    @connection.write message

  close: ->
    @connection.close()
