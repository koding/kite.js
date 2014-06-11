var EventEmitter = require('events').EventEmitter;
var util = require('util');

util.inherits(Session, EventEmitter);

module.exports = Session;

function Session(connection) {
  if (!(this instanceof Session)) {
    return new Session(options);
  }
  this.connection = connection;
}

Session.prototype.getId = function () {

};

Session.prototype.send = function () {

};

Session.prototype.receive = function () {

};

Session.prototype.close = function () {

}
