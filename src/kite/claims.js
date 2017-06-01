const atob = require('atob')
const parse = require('try-json-parse')

module.exports = kiteKey => {
  const kontrolClaimsA = kiteKey.split('.')[1]
  return parse(atob(kontrolClaimsA))
}
