Delayed = require './delayed'

module.exports = class Timeout extends Delayed
  begin: ->
    @handle = setTimeout @fn, @ms, @params...

  clear: ->
    clearTimeout @handle

