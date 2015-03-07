var Emitter, Kite, KiteError, Timeout, WebSocket, atob, backoff, bound_, dnode, enableLogging, handleIncomingMessage, now, uuid, wrap,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

dnode = require('dnode-protocol');

WebSocket = require('ws');

atob = require('atob');

uuid = require('node-uuid');

Emitter = require('events').EventEmitter;

now = require('./now');

backoff = require('./backoff');

wrap = require('./wrap');

handleIncomingMessage = require('./handleIncomingMessage');

enableLogging = require('./enableLogging');

Timeout = require('./timeout');

KiteError = require('./error');

bound_ = require('./bound');

module.exports = Kite = (function(_super) {
  var CLOSED, CONNECTING, ERROR, NOTREADY, OKAY, READY, TIMER_HANDLES, makeProperError, _ref, _ref1;

  __extends(Kite, _super);

  Kite.version = '0.4.0-rc1';

  Kite.Error = KiteError;

  Kite.transportClass = WebSocket;

  _ref = [0, 1, 3, 5], NOTREADY = _ref[0], READY = _ref[1], CLOSED = _ref[2], CONNECTING = _ref[3];

  _ref1 = [0, 1], OKAY = _ref1[0], ERROR = _ref1[1];

  TIMER_HANDLES = ['heartbeatHandle', 'expiryHandle', 'backoffHandle'];

  function Kite(options) {
    var _base, _base1;
    if (!(this instanceof Kite)) {
      return new Kite(options);
    }
    this.id = uuid.v4();
    this.options = 'string' === typeof options ? {
      url: options
    } : options;
    if ((_base = this.options).autoConnect == null) {
      _base.autoConnect = true;
    }
    if ((_base1 = this.options).autoReconnect == null) {
      _base1.autoReconnect = true;
    }
    if (this.options.prefix) {
      this.options.url += this.options.prefix;
    }
    enableLogging(this.options.name, this, this.options.logLevel);
    this.expireTokenOnExpiry();
    this.readyState = NOTREADY;
    if (this.options.autoReconnect) {
      this.initBackoff();
    }
    this.proto = dnode(wrap.call(this, this.options.api));
    this.proto.on('request', (function(_this) {
      return function(req) {
        _this.ready(function() {
          return _this.ws.send(JSON.stringify(req));
        });
        _this.emit('debug', "Sending: ", JSON.stringify(req));
      };
    })(this));
    if (this.options.autoConnect) {
      this.connect();
    }
  }

  Kite.prototype.getToken = function() {
    return this.options.auth.key;
  };

  Kite.prototype.setToken = function(token) {
    var _ref2;
    if (((_ref2 = this.options.auth) != null ? _ref2.type : void 0) !== 'token') {
      throw new Error("Invalid auth type!");
    }
    this.options.auth.key = token;
    return this.emit('tokenSet', token);
  };

  Kite.prototype.connect = function() {
    var konstructor, options, transportClass, transportOptions, url, _ref2, _ref3;
    if ((_ref2 = this.readyState) === CONNECTING || _ref2 === READY) {
      return;
    }
    this.readyState = CONNECTING;
    _ref3 = this.options, url = _ref3.url, transportClass = _ref3.transportClass, transportOptions = _ref3.transportOptions;
    konstructor = transportClass != null ? transportClass : this.constructor.transportClass;
    options = transportOptions != null ? transportOptions : this.constructor.transportOptions;
    this.ws = konstructor === WebSocket ? new konstructor(url) : new konstructor(url, null, options);
    this.ws.addEventListener('open', this.bound('onOpen'));
    this.ws.addEventListener('close', this.bound('onClose'));
    this.ws.addEventListener('message', this.bound('onMessage'));
    this.ws.addEventListener('error', this.bound('onError'));
    this.ws.addEventListener('info', (function(_this) {
      return function(info) {
        return _this.emit('info', info);
      };
    })(this));
    this.emit('info', "Trying to connect to " + url);
  };

  Kite.prototype.disconnect = function(reconnect) {
    var handle, _i, _len, _ref2;
    if (reconnect == null) {
      reconnect = false;
    }
    for (_i = 0, _len = TIMER_HANDLES.length; _i < _len; _i++) {
      handle = TIMER_HANDLES[_i];
      if (!(this[handle] != null)) {
        continue;
      }
      this[handle].clear();
      this[handle] = null;
    }
    this.options.autoReconnect = !!reconnect;
    if ((_ref2 = this.ws) != null) {
      _ref2.close();
    }
    this.emit('notice', "Disconnecting from " + this.options.url);
  };

  Kite.prototype.onOpen = function() {
    this.readyState = READY;
    this.emit('open');
    this.emit('notice', "Connected to Kite: " + this.options.url);
    if (typeof this.clearBackoffTimeout === "function") {
      this.clearBackoffTimeout();
    }
  };

  Kite.prototype.onClose = function(event) {
    var dcInfo;
    this.readyState = CLOSED;
    this.emit('close', event);
    dcInfo = "" + this.options.url + ": disconnected";
    if (this.options.autoReconnect) {
      process.nextTick((function(_this) {
        return function() {
          return _this.setBackoffTimeout(_this.bound("connect"));
        };
      })(this));
      dcInfo += ', trying to reconnect...';
    }
    this.emit('info', dcInfo);
  };

  Kite.prototype.onMessage = function(_arg) {
    var data;
    data = _arg.data;
    handleIncomingMessage.call(this, this.proto, data);
  };

  Kite.prototype.onError = function(err) {
    console.log(err);
    this.emit('error', "Websocket error!");
  };

  Kite.prototype.getKiteInfo = function(params) {
    var _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    return {
      username: "" + ((_ref2 = this.options.username) != null ? _ref2 : 'anonymous'),
      environment: "" + ((_ref3 = this.options.environment) != null ? _ref3 : 'browser-environment'),
      name: "" + ((_ref4 = (_ref5 = params != null ? (_ref6 = params[0]) != null ? _ref6.kiteName : void 0 : void 0) != null ? _ref5 : this.options.name) != null ? _ref4 : 'browser-kite'),
      version: "" + ((_ref7 = this.options.version) != null ? _ref7 : '1.0.0'),
      region: "" + ((_ref8 = this.options.region) != null ? _ref8 : 'browser-region'),
      hostname: "" + ((_ref9 = this.options.hostname) != null ? _ref9 : 'browser-hostname'),
      id: this.id
    };
  };

  Kite.prototype.wrapMessage = function(method, params, callback) {
    return {
      kite: this.getKiteInfo(params),
      authentication: this.options.auth,
      withArgs: params,
      responseCallback: (function(_this) {
        return function(response) {
          var err, rawErr, result;
          rawErr = response.error, result = response.result;
          err = rawErr != null ? makeProperError(rawErr) : null;
          return callback(err, result);
        };
      })(this)
    };
  };

  Kite.prototype.tell = function(method, params, callback) {
    var scrubbed;
    if (callback.times == null) {
      callback.times = 1;
    }
    scrubbed = this.proto.scrubber.scrub([this.wrapMessage(method, params, callback)]);
    scrubbed.method = method;
    this.proto.emit('request', scrubbed);
  };

  Kite.prototype.expireTokenOnExpiry = function() {
    var claims, claimsA, earlyMs, expMs, nowMs, renewMs, token, _, _ref2, _ref3;
    if (((_ref2 = this.options.auth) != null ? _ref2.type : void 0) !== 'token') {
      return;
    }
    token = this.options.auth.key;
    _ref3 = token.split('.'), _ = _ref3[0], claimsA = _ref3[1];
    claims = (function() {
      try {
        return JSON.parse(atob(claimsA));
      } catch (_error) {}
    })();
    if (claims != null ? claims.exp : void 0) {
      expMs = claims.exp * 1000;
      nowMs = +now();
      earlyMs = 5 * 60 * 1000;
      renewMs = expMs - nowMs - earlyMs;
      this.expiryHandle = new Timeout(this.bound('expireToken'), renewMs);
    }
  };

  Kite.prototype.expireToken = function(callback) {
    if (callback != null) {
      this.once('tokenSet', function(newToken) {
        return callback(null, newToken);
      });
    }
    this.emit('tokenExpired');
    if (this.expiryHandle) {
      this.expiryHandle.clear();
      this.expiryHandle = null;
    }
  };

  makeProperError = function(_arg) {
    var code, err, message, type;
    type = _arg.type, message = _arg.message, code = _arg.code;
    err = new KiteError(message);
    err.type = type;
    err.code = code;
    return err;
  };

  Kite.prototype.bound = bound_;

  Kite.prototype.initBackoff = backoff;

  Kite.prototype.ready = function(callback) {
    if (this.readyState === READY) {
      process.nextTick(callback);
    } else {
      this.once('open', callback);
    }
  };

  Kite.prototype.ping = function(callback) {
    return this.tell('kite.ping', callback);
  };

  Kite.disconnect = function() {
    var kite, kites, _i, _len;
    kites = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = kites.length; _i < _len; _i++) {
      kite = kites[_i];
      kite.disconnect();
    }
  };

  Kite.random = function(kites) {
    return kites[Math.floor(Math.random() * kites.length)];
  };

  return Kite;

})(Emitter);
