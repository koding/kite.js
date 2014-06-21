Delayed = require './delayed.coffee'

module.exports = class Timeout extends Delayed

  begin: ->
    @handle = setTimeout @fn, @ms, @params...

  clear: ->
    clearTimeout @handle
