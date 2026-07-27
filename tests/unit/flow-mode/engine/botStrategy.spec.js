import { createRng } from '@/flow-mode/engine/rng'
import { createPlayerBoard } from '@/flow-mode/engine/board'
import {
  chooseBotInitialSelection,
  chooseBotUpgradeSelection,
  autoPlaceBotCards
} from '@/flow-mode/engine/botStrategy'
import { useCaseById } from '@/flow-mode/data/useCases'
import { countSelectedByLayer, validateInitialSelection, validateUpgradeSelection } from '@/flow-mode/engine/selection'
import { INITIAL_CARD_TOTAL, UPGRADE_CARDS_PER_TURN } from '@/flow-mode/engine/constants'
import { cardById } from '@/flow-mode/data/cards'

describe('botStrategy', () => {
  const useCase = useCaseById('mobile-login')

  test('initial selection is a valid 2/2/1 and prefers required cards', () => {
    const board = createPlayerBoard('p2', 'Bot', true)
    const picks = chooseBotInitialSelection(createRng(7), board, useCase)
    expect(picks).toHaveLength(INITIAL_CARD_TOTAL)
    expect(validateInitialSelection(picks).ok).toBe(true)
    const requiredChosen = useCase.requiredCardIds.filter(id => picks.includes(id))
    expect(requiredChosen.length).toBeGreaterThan(0)
    expect(countSelectedByLayer(picks)).toEqual({ controller: 2, model: 2, view: 1 })
  })

  test('upgrade selection picks exactly two unowned cards and prefers missing requirements', () => {
    const board = createPlayerBoard('p2', 'Bot', true)
    board.drafted = [
      'controller-routing',
      'controller-middleware',
      'model-database',
      'model-caching',
      'view-web-view'
    ]
    const picks = chooseBotUpgradeSelection(createRng(3), board, useCase)
    expect(picks).toHaveLength(UPGRADE_CARDS_PER_TURN)
    expect(validateUpgradeSelection(picks, board.drafted).ok).toBe(true)
    // Authentication and Mobile View are still missing for mobile-login
    expect(picks).toEqual(expect.arrayContaining([
      'controller-authentication',
      'view-mobile-view'
    ]))
  })

  test('autoPlaceBotCards places drafted cards into native layers', () => {
    const board = createPlayerBoard('p2', 'Bot', true)
    board.drafted = ['controller-routing', 'model-orm', 'view-cli-view']
    autoPlaceBotCards(board)
    expect(board.layers.controller[0].cardId).toEqual('controller-routing')
    expect(board.layers.model[0].cardId).toEqual('model-orm')
    expect(board.layers.view[0].cardId).toEqual('view-cli-view')
    expect(cardById(board.layers.view[0].cardId).layer).toEqual('view')
  })
})
