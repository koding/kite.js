Delayed = require './delayed.coffee'

module.exports = class Interval extends Delayed

  begin: ->
    @handle = setInterval @fn, @ms, @params...

  clear: ->
    clearInterval @handle
