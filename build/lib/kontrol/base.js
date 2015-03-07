var Emitter, Kite, KiteError, Kontrol,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Emitter = require('events').EventEmitter;

Kite = require('../kite/base');

KiteError = require('../kite/error');

module.exports = Kontrol = (function(_super) {
  __extends(Kontrol, _super);

  Kontrol.version = '0.4.0-rc1';

  Kontrol.Kite = Kite;

  function Kontrol(options) {
    var _base, _base1;
    if (!(this instanceof Kontrol)) {
      return new Kontrol(options);
    }
    this.options = options;
    if ((_base = this.options).autoConnect == null) {
      _base.autoConnect = true;
    }
    if ((_base1 = this.options).autoReconnect == null) {
      _base1.autoReconnect = true;
    }
    if (this.options.autoConnect) {
      this.authenticate();
    }
  }

  Kontrol.prototype.authenticate = function(options) {
    var auth, environment, hostname, logLevel, name, prefix, region, transportClass, transportOptions, url, username, version, _ref;
    this.options = options != null ? options : this.options;
    _ref = this.options, url = _ref.url, auth = _ref.auth, username = _ref.username, environment = _ref.environment, version = _ref.version, region = _ref.region, hostname = _ref.hostname, name = _ref.name, logLevel = _ref.logLevel, transportClass = _ref.transportClass, transportOptions = _ref.transportOptions, prefix = _ref.prefix;
    if (name == null) {
      name = 'kontrol';
    }
    this.kite = new this.constructor.Kite({
      url: url,
      auth: auth,
      username: username,
      environment: environment,
      version: version,
      region: region,
      hostname: hostname,
      name: name,
      logLevel: logLevel,
      transportClass: transportClass,
      transportOptions: transportOptions,
      prefix: prefix
    });
    this.kite.on('error', this.emit.bind(this, 'error'));
    this.kite.on('open', this.emit.bind(this, 'open'));
  };

  Kontrol.prototype.createKite = function(options) {
    var autoConnect, autoReconnect, kite, kiteDescriptor, token, transportOptions, url;
    kiteDescriptor = options.kite, token = options.token, transportOptions = options.transportOptions, autoConnect = options.autoConnect, autoReconnect = options.autoReconnect, url = options.url;
    if (transportOptions == null) {
      transportOptions = this.options.transportOptions;
    }
    if (autoConnect == null) {
      autoConnect = false;
    }
    if (autoReconnect == null) {
      autoReconnect = true;
    }
    kite = new this.constructor.Kite({
      logLevel: this.options.logLevel,
      username: kiteDescriptor.username,
      environment: kiteDescriptor.environment,
      version: kiteDescriptor.version,
      region: kiteDescriptor.region,
      hostname: kiteDescriptor.hostname,
      autoConnect: autoConnect,
      autoReconnect: autoReconnect,
      name: kiteDescriptor.name,
      url: url,
      auth: {
        type: 'token',
        key: token
      },
      transportClass: this.options.transportClass,
      transportOptions: transportOptions
    }).on('tokenExpired', (function(_this) {
      return function() {
        return _this.renewToken(kite, kiteDescriptor);
      };
    })(this));
    return kite;
  };

  Kontrol.prototype.renewToken = function(kite, query) {
    return this.kite.tell('getToken', [query], function(err, token) {
      if (err) {
        console.error(err);
        return;
      }
      return kite.setToken(token);
    });
  };

  Kontrol.prototype.createKites = function(kiteDescriptors, query) {
    var k, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = kiteDescriptors.length; _i < _len; _i++) {
      k = kiteDescriptors[_i];
      _results.push(this.createKite(k));
    }
    return _results;
  };

  Kontrol.prototype.fetchKites = function(args, callback) {
    if (args == null) {
      args = {};
    }
    this.kite.tell('getKites', [args], (function(_this) {
      return function(err, result) {
        if (err != null) {
          callback(err);
          return;
        }
        if (result == null) {
          callback(_this.createKiteNotFoundError(args.query));
          return;
        }
        callback(null, _this.createKites(result.kites));
      };
    })(this));
  };

  Kontrol.prototype.fetchKite = function(args, callback) {
    if (args == null) {
      args = {};
    }
    this.fetchKites(args, (function(_this) {
      return function(err, kites) {
        if (err != null) {
          callback(err);
          return;
        }
        if ((kites != null ? kites[0] : void 0) == null) {
          callback(_this.createKiteNotFoundError(args.query));
          return;
        }
        callback(null, kites[0]);
      };
    })(this));
  };

  Kontrol.prototype.watchKites = function(args, callback) {
    var changes;
    if (args == null) {
      args = {};
    }
    changes = new Emitter;
    args.watchHandler = this.createUpdateHandler(changes);
    this.kite.tell('getKites', [args], (function(_this) {
      return function(err, result) {
        var kite, kiteDescriptors, watcherID, _i, _len, _ref;
        if (err != null) {
          callback(err);
          return;
        }
        kiteDescriptors = result.kites, watcherID = result.watcherID;
        callback(null, {
          changes: changes,
          watcherID: watcherID
        });
        _ref = _this.createKites(kiteDescriptors);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          kite = _ref[_i];
          changes.emit('register', kite);
        }
      };
    })(this));
  };

  Kontrol.prototype.cancelWatcher = function(id, callback) {
    return this.kite.tell('cancelWatcher', [id], callback);
  };

  Kontrol.prototype.createUpdateHandler = function(changes) {
    return (function(_this) {
      return function(response) {
        var action, err, eventName, kite, result, token, url;
        err = response.err, result = response.result;
        if (err != null) {
          changes.emit('error', err);
          return;
        }
        action = result.action, kite = result.kite, token = result.token, url = result.url;
        kite = _this.createKite({
          kite: kite,
          token: token,
          url: url
        });
        eventName = _this.constructor.actions[action];
        changes.emit(eventName, kite);
      };
    })(this);
  };

  Kontrol.prototype.createKiteNotFoundError = function(query) {
    var environment, hostname, id, name, region, username, version;
    username = query.username, environment = query.environment, name = query.name, version = query.version, region = query.region, hostname = query.hostname, id = query.id;
    return new KiteError("No kite found! query: " + (username != null ? username : '') + "/" + (environment != null ? environment : '') + "/" + (name != null ? name : '') + "/" + (version != null ? version : '') + "/" + (region != null ? region : '') + "/" + (hostname != null ? hostname : '') + "/" + (id != null ? id : ''));
  };

  Kontrol.prototype.connect = function() {
    return this.kite.connect();
  };

  Kontrol.prototype.disconnect = function() {
    return this.kite.disconnect();
  };

  Kontrol.prototype.register = function(url, callback) {
    var _ref;
    return (_ref = this.kite) != null ? _ref.tell('register', [url], callback) : void 0;
  };

  Kontrol.actions = {
    REGISTER: 'register',
    DEREGISTER: 'deregister'
  };

  return Kontrol;

})(Emitter);
