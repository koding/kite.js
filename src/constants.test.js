const expect = require('expect')
const constants = require('./constants')

describe('constants', () =>
  it('should expose required constants', () => {
    expect(constants.Event).toExist()
    expect(Object.keys(constants.Event)).toEqual(constants.KnownEvents)

    expect(constants.AuthType).toExist()
    expect(constants.AuthType.token).toExist()

    expect(constants.TimerHandles).toExist()
    expect(constants.TimerHandles.includes('heartbeatHandle')).toBe(true)

    expect(constants.WhiteList).toExist()
    expect(constants.WhiteList.includes('kite.ping')).toBe(true)

    expect(constants.State.NOTREADY).toBe(0)
    expect(constants.State.READY).toBe(1)
    expect(constants.State.CLOSED).toBe(3)
    expect(constants.State.CONNECTING).toBe(5)

    expect(constants.DebugLevel.CRITICAL).toBe(0)
    expect(constants.DebugLevel.DEBUG).toBe(5)
  }))
