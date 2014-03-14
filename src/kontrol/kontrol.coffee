"use strict"

{ EventEmitter } = require 'events'

module.exports = class Kontrol extends EventEmitter

  @Kite = require '../kite/kite.coffee'

  constructor: (options) ->
    throw new Error "Missing option: auth"  unless options.auth

    return new Kontrol options  unless this instanceof Kontrol

    @options = options

    @options.autoReconnect ?= yes
    
    @authenticate()
    
    @kite.on 'error', @emit.bind this, 'error'  # forward kite error events

  authenticate: ->
    { url, auth: { type, key }} = @options

    type ?= 'sessionID'

    @kite = new @constructor.Kite
      name  : 'kontrol'
      url   : url
      auth  : { type, key }

  createKite: ({ kite: { name, url }, token }) ->
    new @constructor.Kite
      autoConnect : no
      name        : name
      url         : url
      auth        :
        type      : 'token'
        key       : token

  fetchKites: (query = {}, callback) ->
    @kite.tell 'getKites', [query], (err, { kites: kiteDescriptors }) =>
      if err?
        callback err
        return

      callback null, @kiteify kiteDescriptors
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

      changes.emit 'register', kite for kite in @kiteify kiteDescriptors

  cancelWatcher: (id, callback) ->

  createUpdateHandler: (changes) -> (err, { action, kite: kiteDescriptor, token }) =>
    debugger  # this is not reliable AFAICT
    if err
      changes.emit 'error', err
      return

    kite = @createKite kiteDescriptor

    eventName = @constructor.actions[action]
    changes.emit eventName, kite

  kiteify: (kiteDescriptors) -> (@createKite k for k in kiteDescriptors)

  @actions      =
    REGISTER    : 'register'
    DEREGISTER  : 'deregister'
