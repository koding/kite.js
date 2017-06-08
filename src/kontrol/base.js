import { EventEmitter as Emitter } from 'events'
import Kite from '../kite/base'
import KiteError from '../kite/error'
import getPath from './getpath'
import { Event, Defaults, KontrolActions } from '../constants'

class Kontrol extends Emitter {
  constructor(options) {
    super()

    this.options = options ? options : {}

    if (this.options.autoConnect == null) {
      this.options.autoConnect = true
    }
    if (this.options.autoReconnect == null) {
      this.options.autoReconnect = true
    }

    if (this.options.autoConnect) {
      this.authenticate()
    }
  }

  authenticate(options = this.options) {
    this.options = options

    let name = this.options.name ? this.options.name : 'kontrol'

    this.kite = new this.constructor.Kite({
      url: this.options.url,
      auth: this.options.auth,
      username: this.options.username,
      environment: this.options.environment,
      version: this.options.version,
      region: this.options.region,
      hostname: this.options.hostname,
      name: name,
      logLevel: this.options.logLevel,
      transportClass: this.options.transportClass,
      transportOptions: this.options.transportOptions,
      prefix: this.options.prefix,
    })

    this.kite.on(Event.error, this.emit.bind(this, 'error')) // forward kite error events
    this.kite.on(Event.open, this.emit.bind(this, 'open'))
  }

  createKite(options) {
    let {
      kite: kiteDescriptor,
      token,
      transportOptions,
      autoConnect,
      autoReconnect,
      url,
    } = options

    if (transportOptions == null) {
      transportOptions = this.options.transportOptions
    }
    if (autoConnect == null) {
      autoConnect = false
    }
    if (autoReconnect == null) {
      autoReconnect = true
    }

    const kite = new this.constructor.Kite({
      logLevel: this.options.logLevel,
      username: kiteDescriptor.username,
      environment: kiteDescriptor.environment,
      version: kiteDescriptor.version,
      region: kiteDescriptor.region,
      hostname: kiteDescriptor.hostname,
      autoConnect,
      autoReconnect,
      name: kiteDescriptor.name,
      url,
      auth: {
        type: 'token',
        key: token,
      },
      transportClass: this.options.transportClass,
      transportOptions,
    }).on(Event.tokenExpired, () => {
      return this.renewToken(kite, kiteDescriptor)
    })

    return kite
  }

  renewToken(kite, query) {
    return this.kite.tell('getToken', [query], (err, token) => {
      if (err) {
        // FIXME: what should happen to this error?
        console.error(err)
        return
      }
      return kite.setToken(token)
    })
  }

  createKites(kiteDescriptors, query) {
    return Array.from(kiteDescriptors).map(k => this.createKite(k))
  }

  fetchKites(args = {}, callback) {
    this.kite.tell('getKites', [args], (err, result) => {
      if (err != null) {
        callback(err)
        return
      }

      if (result == null) {
        callback(this.createKiteNotFoundError(args.query))
        return
      }

      callback(null, this.createKites(result.kites))
    })
  }

  fetchKite(args = {}, callback) {
    this.fetchKites(args, (err, kites) => {
      if (err != null) {
        callback(err)
        return
      }

      if ((kites != null ? kites[0] : undefined) == null) {
        callback(this.createKiteNotFoundError(args.query))
        return
      }

      callback(null, kites[0])
    })
  }

  watchKites(args = {}, callback) {
    const changes = new Emitter()
    args.watchHandler = this.createUpdateHandler(changes)
    this.kite.tell('getKites', [args], (err, result) => {
      if (err != null) {
        callback(err)
        return
      }

      const { kites: kiteDescriptors, watcherID } = result

      callback(null, { changes, watcherID })

      for (let kite of this.createKites(kiteDescriptors)) {
        changes.emit(Event.register, kite)
      }
    })
  }

  cancelWatcher(id, callback) {
    return this.kite.tell('cancelWatcher', [id], callback)
  }

  createUpdateHandler(changes) {
    return response => {
      const { err, result } = response

      if (err != null) {
        changes.emit(Event.error, err)
        return
      }

      let { action, kite, token, url } = result

      kite = this.createKite({ kite, token, url })

      const eventName = this.constructor.actions[action]
      changes.emit(eventName, kite)
    }
  }

  createKiteNotFoundError(query) {
    return new KiteError(`No kite found for query: ${getPath(query)}`)
  }

  connect() {
    return this.kite.connect()
  }

  disconnect() {
    return this.kite.disconnect()
  }

  register(url, callback) {
    return this.kite != null
      ? this.kite.tell('register', [url], callback)
      : undefined
  }
}

Kontrol.version = Defaults.KiteInfo.version
Kontrol.Kite = Kite
Kontrol.actions = KontrolActions

export default Kontrol
