test = require 'tape'
fs = require 'fs'
{ join: joinPath } = require 'path'

kiteKey = fs.createReadStream joinPath(process.env.HOME, './.kite/kite.key'), 'utf-8'

test 'kontrol: register to kontrol', (t) ->
  t.plan 1

  server = require './lib/server/sockjs.coffee'

  server.listen 7777

  server.register
    to: 'http://localhost:4000/kite'
    host: '0.0.0.0'
    kiteKey: kiteKey

  t.ok true