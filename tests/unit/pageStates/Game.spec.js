import Game from '@/pages/pageStates/Game'
import EffectFactory from '@/classes/statusEffect/EffectFactory'
import FixedPenaltyEffect from '@/classes/statusEffect/FixedPenaltyEffect'

jest.mock('@/classes/statusEffect/EffectFactory')

function makePlayer () {
  return {
    getScore: jest.fn(() => 20),
    getDefenseCardForAttack: jest.fn(() => { return null }),
    effects: { addNegative: jest.fn() }
  }
}

describe('Game hazard cards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('delays hazard cards until LOGGER or GIT appears', () => {
    const player = makePlayer()
    const game = new Game([player])

    const hazard = { type: 'BUG', discard: jest.fn() }
    const logger = { type: 'LOGGER' }
    const normal = { type: 'INSTRUCTION' }
    const deck = {
      cards: [],
      draw: jest.fn()
        .mockReturnValueOnce(hazard)
        .mockReturnValueOnce(logger)
        .mockReturnValueOnce(normal)
    }
    game.deck = deck

    const drawn = game.drawCard(player)

    expect(drawn).toBe(logger)
    expect(game.hazardsEnabled).toBe(true)
    expect(deck.cards).toContain(hazard)
    expect(hazard.discard).not.toHaveBeenCalled()
  })

  test('auto-applies hazard when enabled and returns next card', () => {
    const player = makePlayer()
    const game = new Game([player])
    game.hazardsEnabled = true

    const newEffect = jest.fn(() => { return 'hazard-effect' })
    EffectFactory.mockImplementationOnce(() => {
      return { newEffect }
    })

    const hazard = { type: 'BUG', discard: jest.fn() }
    const normal = { type: 'INSTRUCTION' }
    const deck = {
      cards: [],
      draw: jest.fn()
        .mockReturnValueOnce(hazard)
        .mockReturnValueOnce(normal)
    }
    game.deck = deck

    const drawn = game.drawCard(player)

    expect(drawn).toBe(normal)
    expect(hazard.discard).toHaveBeenCalledTimes(1)
    expect(player.effects.addNegative).toHaveBeenCalledTimes(2)
    const penaltyEffect = player.effects.addNegative.mock.calls[0][0]
    expect(penaltyEffect).toBeInstanceOf(FixedPenaltyEffect)
    expect(penaltyEffect.getPenalty()).toBe(-10)
    expect(player.effects.addNegative.mock.calls[1][0]).toBe('hazard-effect')
  })

  test('defense card prevents penalty but still skips turn', () => {
    const player = makePlayer()
    const game = new Game([player])
    game.hazardsEnabled = true

    const newEffect = jest.fn(() => { return 'hazard-effect' })
    EffectFactory.mockImplementationOnce(() => {
      return { newEffect }
    })

    const defenseCard = { discard: jest.fn() }
    const defenseStack = { cards: [defenseCard] }
    player.getDefenseCardForAttack = jest.fn(() => {
      return { card: defenseCard, stack: defenseStack }
    })

    const hazard = { type: 'DISASTER', discard: jest.fn() }
    const normal = { type: 'INSTRUCTION' }
    const deck = {
      cards: [],
      draw: jest.fn()
        .mockReturnValueOnce(hazard)
        .mockReturnValueOnce(normal)
    }
    game.deck = deck

    const drawn = game.drawCard(player)

    expect(drawn).toBe(normal)
    expect(defenseCard.discard).toHaveBeenCalledTimes(1)
    expect(defenseStack.cards).not.toContain(defenseCard)
    expect(player.effects.addNegative).toHaveBeenCalledTimes(1)
    expect(player.effects.addNegative.mock.calls[0][0]).toBe('hazard-effect')
  })
})
