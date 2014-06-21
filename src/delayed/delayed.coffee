module.exports = class Delayed

  constructor: (@ms, @fn, @params...) ->

  begin: -> throw new Error 'not implemented'

  clear: -> throw new Error 'not implemented'