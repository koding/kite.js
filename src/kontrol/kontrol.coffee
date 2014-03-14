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

  fetchKites: (selector = {}, callback) ->
    @kite.tell 'getKites', [selector], (err, { kites }) =>
      if err?
        callback err
        return

      callback null, (@createKite k for k in kites)
      return
    return

  fetchKite: (selector = {}, callback) ->
    @fetchKites selector, (err, kites) ->
      if err?
        callback err
        return

      unless kites?[0]?
        callback new Error "no kite found!"
        return

      callback null, kites[0]
      return
    return

  watchKites: (selector = {}, callback) ->
    changes = new EventEmitter
    onEvent = @createUpdateHandler changes, callback

  cancelWatcher: (id, callback) ->

  createUpdateHandler: (changes, callback) -> (err, change) =>
    # TODO: implement

  @actions      =
    REGISTER    : 'register'
    DEREGISTER  : 'deregister'
