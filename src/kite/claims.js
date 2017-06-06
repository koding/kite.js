const atob = require('atob')
const parse = require('try-json-parse')

export default kiteKey => {
  const kontrolClaimsA = kiteKey.split('.')[1]
  return parse(atob(kontrolClaimsA))
}
