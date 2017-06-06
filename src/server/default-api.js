module.exports = () => ({
  'kite.ping'(callback) {
    return callback(null, 'pong')
  },

  'kite.log'(message, callback) {
    console.log(message)
    return callback(null)
  },

  'kite.echo'(err, callback) {
    return callback(err)
  },
})
