test = require 'tape'
fs = require 'fs'
{ join: joinPath } = require 'path'

kiteKey = fs.createReadStream joinPath(process.env.HOME, './.kite/kite.key'), 'utf-8'

test 'kontrol: register to kontrol', (t) ->
  t.plan 3

  server = require './lib/server/sockjs.coffee'

  server.listen 7777

  kontrolUrl = 'http://localhost:4000/kite'

  server.register
    to: kontrolUrl
    host: '0.0.0.0'
    kiteKey: kiteKey
  .then ->
    t.ok yes
  .catch ->
    t.ok no
  .finally ->

    SockJs = require 'node-sockjs-client'
    Kontrol = require '../kontrol/promises.js'
    Kite = require '../promises.js'

    k = new Kontrol
      url: kontrolUrl
      transportClass: SockJs
      username: 'testuser'
      auth:
        type: 'kiteKey'
        key: process.env.KITE_KEY

    k.fetchKite
      query:
        name: 'echo'
        username: 'testuser'
        region: 'vagrant'
        version: '1.0.0'
        environment: 'vagrant'

    .then (kite) ->
      t.ok kite instanceof Kite

      kite.connect()
      kite.tell('echo', 'ECHO').then (echo) ->
        t.equal echo, 'ECHO'
      .catch ->
        t.ok no
      .finally ->
        kite.disconnect()

    .catch (err) ->
      t.ok no

    .finally ->
      k.disconnect()
      server.close()
