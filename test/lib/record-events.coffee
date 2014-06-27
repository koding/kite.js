recordEvents = ->

  EventEmitter = require '../../lib/event-emitter.js'
  { on: eeOn, emit: eeEmit } = EventEmitter::

  recordEvents.registered = {}
  recordEvents.dispatched = {}

  EventEmitter::on = (eventName) ->
    recordEvents.registered[eventName] = yes
    eeOn.apply this, arguments

  EventEmitter::emit = (eventName) ->
    recordEvents.dispatched[eventName] = yes
    eeEmit.apply this, arguments

module.exports = recordEvents
