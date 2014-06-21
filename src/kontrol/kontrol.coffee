"use strict"

{ EventEmitter } = require 'events'

module.exports = class Kontrol extends EventEmitter

  { @version } = require '../../package.json'

  @Kite = require '../kite/kite.coffee'

  KiteError = require '../error.coffee'

  constructor: (options) ->
    return new Kontrol options  unless this instanceof Kontrol

    @options = options

    @options.autoConnect    ?= yes
    @options.autoReconnect  ?= yes

    @authenticate()  if @options.autoConnect

  authenticate: (@options = @options) ->
    { url, auth, username, environment, version, region, hostname, name, logLevel, transportClass, transportOptions, prefix } = @options

    @kite = new @constructor.Kite
      username        : username
      environment     : environment
      version         : version
      region          : region
      hostname        : hostname
      name            : name ? 'kontrol'
      url             : url
      auth            : auth
      logLevel        : logLevel
      transportClass  : transportClass
      transportOptions: transportOptions
      prefix          : prefix

    @kite.on 'error', @emit.bind this, 'error'  # forward kite error events
    @kite.on 'connected', @emit.bind this, 'connected'

  createKite: ({ kite: kiteDescriptor, token, url }) ->
    kite = new @constructor.Kite
      username        : kiteDescriptor.username
      environment     : kiteDescriptor.environment
      version         : kiteDescriptor.version
      region          : kiteDescriptor.region
      hostname        : kiteDescriptor.hostname
      autoConnect     : no
      name            : kiteDescriptor.name
      url             : url
      auth            :
        type          : 'token'
        key           : token
      logLevel        : @options.logLevel
      transportClass  : @options.transportClass
      transportOptions: @options.transportOptions
    .on 'tokenExpired', =>
      @renewToken kite, kiteDescriptor

  renewToken: (kite, query) ->
    @kite.tell 'getToken', [query], (err, token) ->
      if err
        # FIXME: what should happen to this error?
        console.error err
        return
      kite.setToken token

  createKites: (kiteDescriptors, query) ->
    (@createKite k for k in kiteDescriptors)

  fetchKites: (args = {}, callback) ->
    @kite.tell 'getKites', [args], (err, result) =>
      if err?
        callback err
        return

      unless result?
        callback @createKiteNotFoundError args.query
        return

      callback null, @createKites result.kites
      return
    return

  fetchKite: (args = {}, callback) ->
    @fetchKites args, (err, kites) =>
      if err?
        callback err
        return

      unless kites?[0]?
        callback @createKiteNotFoundError args.query
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

  createKiteNotFoundError: (query) ->
    { username, environment, name, version, region, hostname, id } = query
    new KiteError "No kite found! query: #{
      username    ? '' }/#{
      environment ? '' }/#{
      name        ? '' }/#{
      version     ? '' }/#{
      region      ? '' }/#{
      hostname    ? '' }/#{
      id          ? '' }"

  connect: -> @kite.connect()

  disconnect: -> @kite.disconnect()

  register: (url, callback) ->
    @kite?.tell 'register', [url], callback

  @actions      =
    REGISTER    : 'register'
    DEREGISTER  : 'deregister'
