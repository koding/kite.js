var EventEmitter = require('events').EventEmitter;
var util = require('util');
var sockJS = require('sockjs');
var http = require('http');

var Session = require('./session.js');

util.inherits(Server, EventEmitter)

module.exports = Server

function Server(options) {
  this.sockjs = sockJS.createServer();
  this.server = http.createServer();
  this.options = options;

  this.sockjs.on('connection', function (connection) {
    this.emit('connection', new Session(connection));
  }.bind(this));

  this.sockjs.installHandlers(this.server, { prefix: options.prefix || '' });

  // WebSocketServer connects automatically:
  this.server.listen(options.port, options.hostname);
}