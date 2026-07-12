import { chooseBotDraftPick, autoPlaceBotCards } from '@/flow-mode/engine/botStrategy'
import { createPlayerBoard, placeCard } from '@/flow-mode/engine/board'
import { createRng } from '@/flow-mode/engine/rng'
import { cardById } from '@/flow-mode/data/cards'

describe('chooseBotDraftPick', () => {
  test('prioritizes a needed guard when the forecast flags its threat', () => {
    const board = createPlayerBoard('p2', 'Bot', true)
    const options = [cardById('controller-routing'), cardById('model-orm'), cardById('model-caching')]
    const forecast = { threatTypesPresent: ['SQL_INJECTION'] }

    const pick = chooseBotDraftPick(createRng(1), options, board, forecast)

    expect(pick).toEqual('model-orm')
  })

  test('does not re-pick a guard it already has', () => {
    const board = createPlayerBoard('p2', 'Bot', true)
    board.drafted.push('model-orm')
    const options = [cardById('controller-routing'), cardById('model-orm'), cardById('model-caching')]
    const forecast = { threatTypesPresent: ['SQL_INJECTION'] }

    const pick = chooseBotDraftPick(createRng(1), options, board, forecast)

    expect(pick).not.toEqual('model-orm')
  })

  test('prefers filling an empty layer over a layer it already has cards in', () => {
    const board = createPlayerBoard('p2', 'Bot', true)
    board.drafted.push('controller-routing') // controller has 1
    const options = [cardById('controller-middleware'), cardById('model-database'), cardById('view-web-view')]
    const forecast = { threatTypesPresent: [] }

    const pick = chooseBotDraftPick(createRng(1), options, board, forecast)

    // controller already has a card; model and view are empty - should not pick controller-middleware
    expect(pick).not.toEqual('controller-middleware')
  })

  test('balances toward the layer with fewest cards when all layers are represented', () => {
    const board = createPlayerBoard('p2', 'Bot', true)
    board.drafted.push('controller-routing', 'controller-middleware', 'model-database') // controller:2, model:1
    const options = [cardById('controller-authorization'), cardById('model-caching'), cardById('view-web-view')]
    const forecast = { threatTypesPresent: [] }

    const pick = chooseBotDraftPick(createRng(1), options, board, forecast)

    // view has 0 cards - most balancing choice
    expect(pick).toEqual('view-web-view')
  })

  test('handles a null forecast (before round 1) without throwing', () => {
    const board = createPlayerBoard('p2', 'Bot', true)
    const options = [cardById('controller-routing'), cardById('model-database'), cardById('view-web-view')]
    expect(() => chooseBotDraftPick(createRng(1), options, board, null)).not.toThrow()
  })
})

describe('autoPlaceBotCards', () => {
  test('places every drafted card into its own layer', () => {
    const board = createPlayerBoard('p2', 'Bot', true)
    board.drafted.push('controller-routing', 'model-database', 'view-web-view')

    autoPlaceBotCards(board)

    expect(board.layers.controller.map(s => s.cardId)).toContain('controller-routing')
    expect(board.layers.model.map(s => s.cardId)).toContain('model-database')
    expect(board.layers.view.map(s => s.cardId)).toContain('view-web-view')
  })

  test('does not double-place an already-placed card', () => {
    const board = createPlayerBoard('p2', 'Bot', true)
    board.drafted.push('controller-routing')
    placeCard(board, 'controller-routing', 'controller')

    autoPlaceBotCards(board)

    expect(board.layers.controller).toHaveLength(1)
  })
})
