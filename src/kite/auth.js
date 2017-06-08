import Promise from 'bluebird'
import handleToken from './token'
import { AuthType, WhiteList } from '../constants'

export default Promise.method((kite, method, auth, kiteKey) => {
  if (auth == null) {
    if (WhiteList.includes(method)) {
      return
    }

    if (kite.api && kite.api[method] && !kite.api[method].mustAuth) {
      return
    }

    throw new Error('Access denied!')
  }

  const { type, key } = auth

  switch (type) {
    case AuthType.token:
      return handleToken(key, kiteKey)
    default:
      throw new Error(`Unknown auth type: ${type}`)
  }
})
