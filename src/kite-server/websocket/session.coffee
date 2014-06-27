EventEmitter = require '../../event-emitter.coffee'

module.exports = class Session extends EventEmitter

  constructor: (connection) ->
    return new Session connection  unless this instanceof Session
    @connection = connection

    @connection.on 'message', (message) =>
      @emit 'message', message

    @connection.on 'close', =>
      @emit 'close'

  getId: ->
    "#{ @connection._socket.remoteAddress }:#{ @connection._socket.remotePort }"

  send: (message) ->
    @connection.send message

  close: ->
    @connection.close()
