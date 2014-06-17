KiteServer    = require '../../../server'

module.exports = new KiteServer
  name        : 'echo'
  username    : 'koding'
  environment : 'vagrant'
  region      : 'vagrant'
  version     : '1.0.0'
  prefix      : '/echo'
  api         :
    echo      : (it, echo) -> echo it