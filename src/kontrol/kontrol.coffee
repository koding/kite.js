"use strict"

{ EventEmitter } = require 'events'

module.exports = class Kontrol extends EventEmitter

  @Kite = require '../kite/kite.coffee'

  constructor: (options) ->
    return new Kontrol options  unless this instanceof Kontrol

    @options = options

    @options.autoReconnect ?= yes
    
    @authenticate()
    
    @kite.on 'error', @emit.bind this, 'error'  # forward kite error events

  authenticate: ->
    { url, auth } = @options

    @kite = new @constructor.Kite
      name  : 'kontrol'
      url   : url
      auth  : auth

  createKite: ({ kite: { name }, token, url }) ->
    new @constructor.Kite
      autoConnect : no
      name        : name
      url         : url
      auth        :
        type      : 'token'
        key       : token

  createKites: (kiteDescriptors) ->
    (@createKite k for k in kiteDescriptors)

  fetchKites: (query = {}, callback) ->
    @kite.tell 'getKites', [query], (err, result) =>
      if err?
        callback err
        return

      unless result?
        callback new Error "No kite found!"
        return

      callback null, @createKites result.kites
      return
    return

  fetchKite: (query = {}, callback) ->
    @fetchKites query, (err, kites) ->
      if err?
        callback err
        return

      unless kites?[0]?
        callback new Error "no kite found!"
        return

      callback null, kites[0]
      return
    return

  watchKites: (query = {}, callback) ->
    changes = new EventEmitter
    handler = @createUpdateHandler changes
    @kite.tell 'getKites', [query, handler], (err, result) =>
      if err?
        callback err
        return

      { kites: kiteDescriptors, watcherID } = result

      callback null, { changes, watcherID }

      changes.emit 'register', kite  for kite in @createKites kiteDescriptors
      return
    return

  cancelWatcher: (id, callback) ->
    @kite.tell 'cancelWatcher', [id], callback

  createUpdateHandler: (changes) -> (response) =>
    { err, result } = @kite.unwrapMessage response

    if err?
      changes.emit 'error', err
      return

    { action, kite, token, url } = result

    kite = @createKite { kite, token, url }

    eventName = @constructor.actions[action]
    changes.emit eventName, kite
    return

  connect: -> @kite.connect()

  disconnect: -> @kite.disconnect()

  @actions      =
    REGISTER    : 'register'
    DEREGISTER  : 'deregister'
