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

  authenticate: (@options = @options) ->
    { url, auth } = @options

    @kite = new @constructor.Kite
      name  : 'kontrol'
      url   : url
      auth  : auth

  createKite: ({ kite: { name }, token, url }, query) ->
    kite = new @constructor.Kite
      username    : @options.username
      environment : @options.environment
      version     : @options.version
      region      : @options.region
      hostname    : @options.hostname
      autoConnect : no
      name        : name
      url         : url
      auth        :
        type      : 'token'
        key       : token
    .on 'tokenExpired', =>
      @renewToken kite, query

    return kite

  renewToken: (kite, query) ->
    # TODO: need to implement #renewToken
    throw new Error 'Kontrol#renewToken is not implemented'

  createKites: (kiteDescriptors, query) ->
    (@createKite k, query for k in kiteDescriptors)

  fetchKites: (args = {}, callback) ->
    @kite.tell 'getKites', [args], (err, result) =>
      if err?
        callback err
        return

      unless result?
        callback new Error "No kite found!"
        return

      callback null, @createKites result.kites, args.query
      return
    return

  fetchKite: (args = {}, callback) ->
    @fetchKites args, (err, kites) ->
      if err?
        callback err
        return

      unless kites?[0]?
        callback new Error "No kite found!"
        return

      callback null, kites[0]
      return
    return

  watchKites: (args = {}, callback) ->
    changes = new EventEmitter
    args.watchHandler = @createUpdateHandler changes
    @kite.tell 'getKites', [args], (err, result) =>
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
    { err, result } = response

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
