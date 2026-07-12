import { resolveDataRequest } from '@/flow-mode/engine/chainResolution'
import { createPlayerBoard, placeCard } from '@/flow-mode/engine/board'

function makeRequest (overrides = {}) {
  return {
    id: 'req-1',
    route: 'Routing',
    dataDomain: 'Database',
    outputType: 'Web View',
    ...overrides
  }
}

function buildFullChainBoard () {
  const board = createPlayerBoard('p1', 'Alice')
  board.drafted.push('controller-routing', 'model-database', 'view-web-view')
  placeCard(board, 'controller-routing', 'controller')
  placeCard(board, 'model-database', 'model')
  placeCard(board, 'view-web-view', 'view')
  return board
}

describe('resolveDataRequest', () => {
  test('serves the request when the full chain is present', () => {
    const board = buildFullChainBoard()
    const result = resolveDataRequest(board, makeRequest())

    expect(result.outcome).toEqual('served')
    expect(result.failedAtLayer).toBeNull()
    expect(result.failureCode).toBeNull()
    expect(result.matchedCards).toEqual({
      controller: 'controller-routing',
      model: 'model-database',
      view: 'view-web-view'
    })
  })

  test('fails at controller when no matching route exists', () => {
    const board = createPlayerBoard('p1', 'Alice')
    const result = resolveDataRequest(board, makeRequest())

    expect(result.outcome).toEqual('failed')
    expect(result.failedAtLayer).toEqual('controller')
    expect(result.failureCode).toEqual('NO_ROUTE')
    expect(result.explanation).toMatch(/404/)
  })

  test('fails at model when route exists but no matching handler', () => {
    const board = createPlayerBoard('p1', 'Alice')
    board.drafted.push('controller-routing')
    placeCard(board, 'controller-routing', 'controller')

    const result = resolveDataRequest(board, makeRequest())

    expect(result.outcome).toEqual('failed')
    expect(result.failedAtLayer).toEqual('model')
    expect(result.failureCode).toEqual('NO_HANDLER')
    expect(result.explanation).toMatch(/500/)
    expect(result.matchedCards.controller).toEqual('controller-routing')
  })

  test('fails at view when route and handler exist but no matching template', () => {
    const board = createPlayerBoard('p1', 'Alice')
    board.drafted.push('controller-routing', 'model-database')
    placeCard(board, 'controller-routing', 'controller')
    placeCard(board, 'model-database', 'model')

    const result = resolveDataRequest(board, makeRequest())

    expect(result.outcome).toEqual('failed')
    expect(result.failedAtLayer).toEqual('view')
    expect(result.failureCode).toEqual('NO_TEMPLATE')
    expect(result.matchedCards).toEqual({
      controller: 'controller-routing', model: 'model-database', view: null
    })
  })

  test('a disabled route card is treated as missing', () => {
    const board = buildFullChainBoard()
    board.layers.controller[0].disabled = true

    const result = resolveDataRequest(board, makeRequest())

    expect(result.outcome).toEqual('failed')
    expect(result.failedAtLayer).toEqual('controller')
  })
})
