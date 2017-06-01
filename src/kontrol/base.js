let Kontrol
const Emitter = require('events').EventEmitter
const Kite = require('../kite/base')
const KiteError = require('../kite/error')

module.exports = Kontrol = (() => {
  let getPath
  Kontrol = class Kontrol extends Emitter {
    static initClass () {
      this.version = '1.0.0'

      this.Kite = Kite

      getPath = query => {
        const val = query.username
        const username = val != null ? val : ''
        const val1 = query.environment
        const environment = val1 != null ? val1 : ''
        const val2 = query.name
        const name = val2 != null ? val2 : ''
        const val3 = query.version
        const version = val3 != null ? val3 : ''
        const val4 = query.region
        const region = val4 != null ? val4 : ''
        const val5 = query.hostname
        const hostname = val5 != null ? val5 : ''
        const val6 = query.id
        const id = val6 != null ? val6 : ''

        return `${username}/${environment}/${name}/${version}/${region}/${hostname}/${id}`
      }

      this.actions = {
        REGISTER  : 'register',
        DEREGISTER: 'deregister',
      }
    }

    constructor (options) {
      if (!(this instanceof Kontrol)) {
        return new Kontrol(options)
      }

      this.options = options

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

    authenticate (options = this.options) {
      this.options = options
      let { url, auth, username, environment, version, region, hostname, name, logLevel, transportClass, transportOptions, prefix } = this.options

      if (name == null) {
        name = 'kontrol'
      }

      this.kite = new this.constructor.Kite({
        url,
        auth,
        username,
        environment,
        version,
        region,
        hostname,
        name,
        logLevel,
        transportClass,
        transportOptions,
        prefix,
      })

      this.kite.on('error', this.emit.bind(this, 'error')) // forward kite error events
      this.kite.on('open', this.emit.bind(this, 'open'))
    }

    createKite (options) {
      let { kite: kiteDescriptor, token, transportOptions, autoConnect, autoReconnect, url } = options

      if (transportOptions == null) {
        ({ transportOptions } = this.options)
      }
      if (autoConnect == null) {
        autoConnect = false
      }
      if (autoReconnect == null) {
        autoReconnect = true
      }

      const kite = new this.constructor.Kite({
        logLevel   : this.options.logLevel,
        username   : kiteDescriptor.username,
        environment: kiteDescriptor.environment,
        version    : kiteDescriptor.version,
        region     : kiteDescriptor.region,
        hostname   : kiteDescriptor.hostname,
        autoConnect,
        autoReconnect,
        name       : kiteDescriptor.name,
        url,
        auth       : {
          type: 'token',
          key : token,
        },
        transportClass: this.options.transportClass,
        transportOptions,
      }).on('tokenExpired', () => {
        return this.renewToken(kite, kiteDescriptor)
      })

      return kite
    }

    renewToken (kite, query) {
      return this.kite.tell('getToken', [query], (err, token) => {
        if (err) {
          // FIXME: what should happen to this error?
          console.error(err)
          return
        }
        return kite.setToken(token)
      })
    }

    createKites (kiteDescriptors, query) {
      return Array.from(kiteDescriptors).map(k => this.createKite(k))
    }

    fetchKites (args = {}, callback) {
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

    fetchKite (args = {}, callback) {
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

    watchKites (args = {}, callback) {
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
          changes.emit('register', kite)
        }
      })
    }

    cancelWatcher (id, callback) {
      return this.kite.tell('cancelWatcher', [id], callback)
    }

    createUpdateHandler (changes) {
      return response => {
        const { err, result } = response

        if (err != null) {
          changes.emit('error', err)
          return
        }

        let { action, kite, token, url } = result

        kite = this.createKite({ kite, token, url })

        const eventName = this.constructor.actions[action]
        changes.emit(eventName, kite)
      }
    }

    createKiteNotFoundError (query) {
      return new KiteError(`No kite found for query: ${getPath(query)}`)
    }

    connect () {
      return this.kite.connect()
    }

    disconnect () {
      return this.kite.disconnect()
    }

    register (url, callback) {
      return this.kite != null ? this.kite.tell('register', [url], callback) : undefined
    }
  }
  Kontrol.initClass()
  return Kontrol
})()
