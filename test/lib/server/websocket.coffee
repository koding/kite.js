KiteServer = require '../../../server'

{ logLevels } = require '../../../logging'

module.exports = new KiteServer
  name        : 'echo'
  username    : 'testuser'
  environment : 'vagrant'
  region      : 'vagrant'
  version     : '1.0.0'
  prefix      : '/echo'
  logLevels   : logLevels.DEBUG
  api         :
    echo      : (it, echo) -> echo null, it