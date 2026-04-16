import Method from '@/classes/card/Method'
import MethodCardWrapper from '@/classes/card/MethodCardWrapper'
import Stack from '@/classes/stack/Stack'

jest.mock('@/classes/card/MethodCardWrapper')
jest.mock('@/classes/stack/Stack')

describe('Method class', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creating a method card', () => {
    const card = new Method('deck')
    expect(card.value).toEqual(0)
    expect(card.type).toEqual('METHOD')
    expect(card.deck).toEqual('deck')
    expect(card.image).toEqual('static/cardImages/method.png')
  })

  test('playing the method card', () => {
    const method0 = 'method0'
    const lane0 = { method: method0 }
    const playField = {
      method: method0, // backward compatibility
      player: 'player',
      lanes: [lane0, { method: 'method1' }, { method: 'method2' }],
      getLane: jest.fn((i) => playField.lanes[i]),
      addStack: jest.fn()
    }
    const playInfo = { playField, laneIndex: 0 }

    const card = new Method('deck')
    card.play(playInfo)

    expect(playField.getLane).toBeCalledWith(0)
    expect(MethodCardWrapper).toBeCalledWith(card, method0)
    expect(Stack).toBeCalledWith(MethodCardWrapper.mock.instances[0], playField.player)
    expect(playField.addStack).toBeCalledWith(Stack.mock.instances[0], 0)
  })
})
