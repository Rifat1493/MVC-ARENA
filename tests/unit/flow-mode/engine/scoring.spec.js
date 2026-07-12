import { scoreRound, applyRoundScoreToMatch, determineMatchWinner, resolveSuddenDeathRequest } from '@/flow-mode/engine/scoring'
import { createPlayerBoard, placeCard } from '@/flow-mode/engine/board'
import { createRng } from '@/flow-mode/engine/rng'

describe('scoreRound', () => {
  test('tallies served, blocked, and penetrated outcomes', () => {
    const results = [
      { outcome: 'served' }, { outcome: 'served' }, { outcome: 'failed' },
      { outcome: 'blocked' }, { outcome: 'penetrated' }
    ]
    const summary = scoreRound(createPlayerBoard('p1', 'Alice'), results)

    expect(summary).toEqual({ served: 2, blocked: 1, penetrated: 1, roundScore: 3 })
  })

  test('a round with no successes scores 0', () => {
    const results = [{ outcome: 'failed' }, { outcome: 'penetrated' }]
    const summary = scoreRound(createPlayerBoard('p1', 'Alice'), results)
    expect(summary.roundScore).toEqual(0)
  })
})

describe('applyRoundScoreToMatch', () => {
  test('mutates the board with the round result', () => {
    const board = createPlayerBoard('p1', 'Alice')
    applyRoundScoreToMatch(board, { served: 2, blocked: 1, penetrated: 1, roundScore: 3 })

    expect(board.roundScore).toEqual(3)
    expect(board.matchScore).toEqual(3)
    expect(board.penetrations).toEqual(1)
  })

  test('accumulates across multiple rounds', () => {
    const board = createPlayerBoard('p1', 'Alice')
    applyRoundScoreToMatch(board, { served: 2, blocked: 0, penetrated: 1, roundScore: 2 })
    applyRoundScoreToMatch(board, { served: 1, blocked: 1, penetrated: 0, roundScore: 2 })

    expect(board.matchScore).toEqual(4)
    expect(board.penetrations).toEqual(1)
    expect(board.roundScore).toEqual(2) // reflects the most recent round only
  })
})

describe('determineMatchWinner', () => {
  test('higher matchScore wins', () => {
    const a = { ...createPlayerBoard('p1', 'A'), matchScore: 5, penetrations: 0 }
    const b = { ...createPlayerBoard('p2', 'B'), matchScore: 3, penetrations: 0 }
    expect(determineMatchWinner(a, b)).toEqual({ winnerId: 'p1', reason: 'score' })
  })

  test('tied score falls back to fewer penetrations', () => {
    const a = { ...createPlayerBoard('p1', 'A'), matchScore: 5, penetrations: 2 }
    const b = { ...createPlayerBoard('p2', 'B'), matchScore: 5, penetrations: 0 }
    expect(determineMatchWinner(a, b)).toEqual({ winnerId: 'p2', reason: 'penetrations' })
  })

  test('tied score and tied penetrations is undecided', () => {
    const a = { ...createPlayerBoard('p1', 'A'), matchScore: 5, penetrations: 1 }
    const b = { ...createPlayerBoard('p2', 'B'), matchScore: 5, penetrations: 1 }
    expect(determineMatchWinner(a, b)).toEqual({ winnerId: null, reason: 'tie' })
  })
})

describe('resolveSuddenDeathRequest', () => {
  test('decides in favor of the player who served a data request the other failed', () => {
    const boardA = createPlayerBoard('p1', 'A')
    boardA.drafted.push('controller-routing', 'model-database', 'view-web-view')
    placeCard(boardA, 'controller-routing', 'controller')
    placeCard(boardA, 'model-database', 'model')
    placeCard(boardA, 'view-web-view', 'view')
    const boardB = createPlayerBoard('p2', 'B')

    const request = { id: 'sd0', kind: 'data', route: 'Routing', dataDomain: 'Database', outputType: 'Web View' }
    const outcome = resolveSuddenDeathRequest(boardA, boardB, request, createRng(1), createRng(1))

    expect(outcome.decided).toBe(true)
    expect(outcome.winnerId).toEqual('p1')
  })

  test('is undecided when both players succeed', () => {
    const makeFullBoard = id => {
      const board = createPlayerBoard(id, id)
      board.drafted.push('controller-routing', 'model-database', 'view-web-view')
      placeCard(board, 'controller-routing', 'controller')
      placeCard(board, 'model-database', 'model')
      placeCard(board, 'view-web-view', 'view')
      return board
    }
    const boardA = makeFullBoard('p1')
    const boardB = makeFullBoard('p2')
    const request = { id: 'sd0', kind: 'data', route: 'Routing', dataDomain: 'Database', outputType: 'Web View' }

    const outcome = resolveSuddenDeathRequest(boardA, boardB, request, createRng(1), createRng(1))

    expect(outcome.decided).toBe(false)
    expect(outcome.winnerId).toBeUndefined()
  })

  test('is undecided when both players fail', () => {
    const boardA = createPlayerBoard('p1', 'A')
    const boardB = createPlayerBoard('p2', 'B')
    const request = { id: 'sd0', kind: 'data', route: 'Routing', dataDomain: 'Database', outputType: 'Web View' }

    const outcome = resolveSuddenDeathRequest(boardA, boardB, request, createRng(1), createRng(1))

    expect(outcome.decided).toBe(false)
  })

  test('works for a threat request too', () => {
    const boardA = createPlayerBoard('p1', 'A')
    boardA.drafted.push('model-orm')
    placeCard(boardA, 'model-orm', 'model')
    const boardB = createPlayerBoard('p2', 'B')

    const request = { id: 'sd0', kind: 'threat', threatType: 'SQL_INJECTION', targetLayer: 'model' }
    const outcome = resolveSuddenDeathRequest(boardA, boardB, request, createRng(1), createRng(1))

    expect(outcome.decided).toBe(true)
    expect(outcome.winnerId).toEqual('p1')
  })
})
