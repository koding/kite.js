Delayed = require './delayed'

module.exports = class Interval extends Delayed

  begin: ->
    @handle = setInterval @fn, @ms, @params...

  clear: ->
    clearInterval @handle

