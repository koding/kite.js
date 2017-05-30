Emitter = require('events').EventEmitter
Kite = require '../kite/base'
KiteError = require '../kite/error'

module.exports = class Kontrol extends Emitter

  @version = '0.4.0-rc1'

  @Kite = Kite

  constructor: (options) ->
    return new Kontrol options  unless this instanceof Kontrol

    @options = options

    @options.autoConnect    ?= yes
    @options.autoReconnect  ?= yes

    @authenticate()  if @options.autoConnect

  authenticate: (@options = @options) ->

    { url, auth, username, environment,
      version, region, hostname, name,
      logLevel, transportClass,
      transportOptions, prefix } = @options

    name ?= 'kontrol'

    @kite = new @constructor.Kite {
      url, auth, username, environment,
      version, region, hostname, name,
      logLevel, transportClass,
      transportOptions, prefix
    }

    @kite.on 'error', @emit.bind this, 'error'  # forward kite error events
    @kite.on 'open',  @emit.bind this, 'open'

    return

  createKite: (options) ->

    { kite: kiteDescriptor, token, transportOptions
      autoConnect, autoReconnect, url } = options

    transportOptions ?= @options.transportOptions
    autoConnect      ?= no
    autoReconnect    ?= yes

    kite = new @constructor.Kite
      logLevel         : @options.logLevel
      username         : kiteDescriptor.username
      environment      : kiteDescriptor.environment
      version          : kiteDescriptor.version
      region           : kiteDescriptor.region
      hostname         : kiteDescriptor.hostname
      autoConnect      : autoConnect
      autoReconnect    : autoReconnect
      name             : kiteDescriptor.name
      url              : url
      auth             :
        type           : 'token'
        key            : token
      transportClass   : @options.transportClass
      transportOptions : transportOptions
    .on 'tokenExpired', =>
      @renewToken kite, kiteDescriptor

    return kite

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
    changes = new Emitter
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

