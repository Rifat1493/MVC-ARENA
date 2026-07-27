import { createPlayerBoard, placeCard, placeAllUnplacedCards } from '@/flow-mode/engine/board'

describe('board', () => {
  test('creates an empty board with requirementsFulfilled', () => {
    const board = createPlayerBoard('p1', 'Alice')
    expect(board.playerId).toEqual('p1')
    expect(board.displayName).toEqual('Alice')
    expect(board.isBot).toBe(false)
    expect(board.drafted).toEqual([])
    expect(board.layers).toEqual({ controller: [], model: [], view: [] })
    expect(board.requirementsFulfilled).toEqual(0)
  })

  test('places a selected card into its own layer', () => {
    const board = createPlayerBoard('p1', 'Alice')
    board.drafted.push('controller-routing')
    expect(placeCard(board, 'controller-routing', 'controller').ok).toBe(true)
    expect(board.layers.controller).toEqual([{ cardId: 'controller-routing', disabled: false }])
  })

  test('rejects wrong layer, unselected, unknown, and duplicate placements', () => {
    const board = createPlayerBoard('p1', 'Alice')
    expect(placeCard(board, 'controller-routing', 'controller').ok).toBe(false)
    board.drafted.push('controller-routing')
    expect(placeCard(board, 'controller-routing', 'model').ok).toBe(false)
    expect(placeCard(board, 'nonexistent', 'controller').ok).toBe(false)
    placeCard(board, 'controller-routing', 'controller')
    expect(placeCard(board, 'controller-routing', 'controller').ok).toBe(false)
  })

  test('placeAllUnplacedCards installs every drafted card', () => {
    const board = createPlayerBoard('p1', 'Alice')
    board.drafted.push('controller-routing', 'model-database', 'view-web-view')
    placeAllUnplacedCards(board)
    expect(board.layers.controller.map(s => s.cardId)).toEqual(['controller-routing'])
    expect(board.layers.model.map(s => s.cardId)).toEqual(['model-database'])
    expect(board.layers.view.map(s => s.cardId)).toEqual(['view-web-view'])
  })
})
