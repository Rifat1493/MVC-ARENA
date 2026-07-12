import { resolveThreatRequest } from '@/flow-mode/engine/threatResolution'
import { createPlayerBoard, placeCard } from '@/flow-mode/engine/board'
import { createRng } from '@/flow-mode/engine/rng'

function makeThreat (overrides = {}) {
  return {
    id: 'threat-1',
    threatType: 'SQL_INJECTION',
    targetLayer: 'model',
    ...overrides
  }
}

describe('resolveThreatRequest', () => {
  const guardMatrix = [
    { threatType: 'SQL_INJECTION', targetLayer: 'model', guardId: 'model-orm' },
    { threatType: 'XSS', targetLayer: 'view', guardId: 'view-output-validation' },
    { threatType: 'SESSION_FORGERY', targetLayer: 'controller', guardId: 'controller-authentication' }
  ]

  test.each(guardMatrix)('$threatType is blocked by its matching guard ($guardId)', ({ threatType, targetLayer, guardId }) => {
    const board = createPlayerBoard('p1', 'Alice')
    board.drafted.push(guardId)
    placeCard(board, guardId, targetLayer)

    const result = resolveThreatRequest(board, makeThreat({ threatType, targetLayer }), createRng(1))

    expect(result.outcome).toEqual('blocked')
    expect(result.guardCardId).toEqual(guardId)
    expect(result.damagedCardId).toBeNull()
  })

  test.each(guardMatrix)('$threatType is NOT blocked by a guard from a different layer', ({ threatType, targetLayer, guardId }) => {
    // place every OTHER guard, but not the correct one for this threat
    const board = createPlayerBoard('p1', 'Alice')
    const otherGuards = guardMatrix.filter(g => g.guardId !== guardId)
    for (const other of otherGuards) {
      board.drafted.push(other.guardId)
      placeCard(board, other.guardId, other.targetLayer)
    }

    const result = resolveThreatRequest(board, makeThreat({ threatType, targetLayer }), createRng(1))

    expect(result.outcome).toEqual('penetrated')
  })

  test('penetrates and picks a card to damage when no guard is present', () => {
    const board = createPlayerBoard('p1', 'Alice')
    board.drafted.push('model-database')
    placeCard(board, 'model-database', 'model')

    const result = resolveThreatRequest(board, makeThreat(), createRng(1))

    expect(result.outcome).toEqual('penetrated')
    expect(result.damagedCardId).toEqual('model-database')
    expect(result.guardCardId).toBeNull()
  })

  test('penetrates with no damagedCardId when the target layer is empty', () => {
    const board = createPlayerBoard('p1', 'Alice')
    const result = resolveThreatRequest(board, makeThreat(), createRng(1))

    expect(result.outcome).toEqual('penetrated')
    expect(result.damagedCardId).toBeNull()
  })

  test('does not mutate the board (pure function)', () => {
    const board = createPlayerBoard('p1', 'Alice')
    board.drafted.push('model-database')
    placeCard(board, 'model-database', 'model')

    resolveThreatRequest(board, makeThreat(), createRng(1))

    expect(board.layers.model[0].disabled).toBe(false)
  })

  test('skips a disabled guard, treating it as not present', () => {
    const board = createPlayerBoard('p1', 'Alice')
    board.drafted.push('model-orm')
    placeCard(board, 'model-orm', 'model')
    board.layers.model[0].disabled = true

    const result = resolveThreatRequest(board, makeThreat(), createRng(1))

    expect(result.outcome).toEqual('penetrated')
  })
})
