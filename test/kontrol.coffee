test = require 'tape'
fs = require 'fs'
{ join: joinPath } = require 'path'

kiteKey = fs.createReadStream joinPath(process.env.KITE_HOME, './kontrol_client.key'), 'utf-8'

test 'kontrol: register to kontrol', (t) ->
  t.plan 8

  server = require './lib/server/sockjs.coffee'

  server.listen 7777

  server.register { host: '0.0.0.0', kiteKey }

  .then ->
    t.ok yes, 'able to register to kontrol'

  .catch (err) ->
    t.ok no, 'failed to register to kontrol'

  .finally ->

    SockJs = require 'node-sockjs-client'
    Kontrol = require '../kontrol/promises.js'
    Kite = require '../promises.js'

    k = new Kontrol
      url             : 'http://localhost:4000/kite'
      transportClass  : SockJs
      username        : 'testuser'
      auth            :
        type          : 'kiteKey'
        key           : process.env.KITE_KEY

    k.fetchKite
      query           :
        name          : 'echo'
        username      : 'testuser'
        region        : 'vagrant'
        version       : '1.0.0'
        environment   : 'vagrant'

    .then (kite) ->
      t.ok kite instanceof Kite, 'it is an instance of the Kite constructor'

      oldToken = null

      kite.connect()

      kite.tell 'echo', 'ECHO'

      .then (echo) ->
        t.equal echo, 'ECHO', 'the echo method faithfully echoed'

      .catch ->
        t.ok no, 'could not echo'

      .then ->
        oldToken = kite.getToken()
        t.ok oldToken?, 'the old token was defined'
        kite.expireToken()

      .then (token) ->
        t.ok token?, 'the new token is defined'
        t.notEqual token, oldToken, 'the new token is different than the old token'
        t.equal token, kite.getToken(), 'the new token is equal to the current token of the kite'
        kite.tell 'echo', 'HELLO'

      .then (hello) ->
        t.equal hello, 'HELLO', 'the echo method still works after swapping the token'

      .finally ->
        kite.disconnect()

    .catch (err) ->
      console.log 'error', err
      t.ok no, 'could not fetch kite'

    .finally ->
      k.disconnect()
      server.close()
