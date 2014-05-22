var EventEmitter = require('events').EventEmitter;
var util = require('util');

util.inherits(Session, EventEmitter);

module.exports = Session;

function Session(connection) {
  if (!(this instanceof Session)) {
    return new Session(options);
  }
  this.connection = connection;

  this.connection.on('data', function (message) {
    this.emit('message', message);
  }.bind(this));

  this.connection.on('close', function () {
    this.emit('close');
  }.bind(this));
}

Session.prototype.getId = function () {
  return this.connection.remoteAddress + ':' + this.connection.remotePort;
};

Session.prototype.send = function (message) {
  this.connection.write(message);
};

Session.prototype.close = function () {
  this.connection.close();
};
