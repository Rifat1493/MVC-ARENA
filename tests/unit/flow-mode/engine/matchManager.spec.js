import FlowMatch from '@/flow-mode/engine/matchManager'
import { DRAFT_PICKS } from '@/flow-mode/engine/constants'
import { cardById } from '@/flow-mode/data/cards'

/** Fully drafts a human player by always picking the first offered option. */
function draftAllFirstOption (match, playerId) {
  while (match.draftState[playerId].pickIndex < DRAFT_PICKS) {
    const cardId = match.draftState[playerId].options[0].id
    match.pickDraftCard(playerId, cardId)
  }
}

/** Places every drafted card for a human player into its native layer. */
function buildAllCards (match, playerId) {
  const board = match.players[playerId]
  for (const cardId of [...board.drafted]) {
    const alreadyPlaced = ['controller', 'model', 'view'].some(l =>
      board.layers[l].some(s => s.cardId === cardId))
    if (!alreadyPlaced) {
      const card = cardById(cardId)
      match.placeCard(playerId, cardId, card.layer)
    }
  }
}

/** Runs the serve phase to completion. */
function serveRound (match) {
  while (match.serveState.currentIndex < match.currentRoundQueue.length) {
    match.resolveNextRequest()
  }
}

describe('FlowMatch - determinism', () => {
  test('the same seed produces identical round queues and match results end to end', () => {
    const run = () => {
      const match = new FlowMatch({ player1Name: 'A', player2IsBot: true, seed: 12345 })
      match.startForecast()
      match.startDraft()
      draftAllFirstOption(match, 'p1')
      buildAllCards(match, 'p1')
      match.startServe()
      serveRound(match)
      return { queue: match.roundHistory, result: match.isMatchOver() ? match.getMatchResult() : null }
    }

    const runA = run()
    const runB = run()
    expect(runA).toEqual(runB)
  })

  test('different seeds produce different round queues', () => {
    const matchA = new FlowMatch({ player1Name: 'A', player2IsBot: true, seed: 1 })
    const matchB = new FlowMatch({ player1Name: 'A', player2IsBot: true, seed: 2 })
    matchA.startForecast()
    matchB.startForecast()
    expect(matchA.currentRoundQueue).not.toEqual(matchB.currentRoundQueue)
  })
})

describe('FlowMatch - draft phase', () => {
  test('bot drafts and auto-places all 5 cards instantly', () => {
    const match = new FlowMatch({ player1Name: 'A', player2IsBot: true, seed: 1 })
    match.startForecast()
    match.startDraft()

    expect(match.players.p2.drafted).toHaveLength(DRAFT_PICKS)
    const placedCount = ['controller', 'model', 'view']
      .reduce((sum, l) => sum + match.players.p2.layers[l].length, 0)
    expect(placedCount).toEqual(DRAFT_PICKS)
  })

  test('human drafting one at a time does not auto-place', () => {
    const match = new FlowMatch({ player1Name: 'A', player2IsBot: true, seed: 1 })
    match.startForecast()
    match.startDraft()

    const firstCard = match.draftState.p1.options[0].id
    match.pickDraftCard('p1', firstCard)

    expect(match.players.p1.drafted).toEqual([firstCard])
    const placedCount = ['controller', 'model', 'view']
      .reduce((sum, l) => sum + match.players.p1.layers[l].length, 0)
    expect(placedCount).toEqual(0)
  })

  test('rejects a pick that is not currently offered', () => {
    const match = new FlowMatch({ player1Name: 'A', player2IsBot: true, seed: 1 })
    match.startForecast()
    match.startDraft()

    const result = match.pickDraftCard('p1', 'not-an-offered-card')
    expect(result.ok).toBe(false)
  })

  test('advances to build phase once both players finish drafting', () => {
    const match = new FlowMatch({ player1Name: 'A', player2Name: 'B', seed: 1 })
    match.startForecast()
    match.startDraft()

    draftAllFirstOption(match, 'p1')
    draftAllFirstOption(match, 'p2')

    expect(match.phase).toEqual('build')
  })
})

describe('FlowMatch - build phase', () => {
  test('placeCard rejects placing a card in the wrong layer', () => {
    const match = new FlowMatch({ player1Name: 'A', player2Name: 'B', seed: 1 })
    match.startForecast()
    match.startDraft()
    draftAllFirstOption(match, 'p1')
    draftAllFirstOption(match, 'p2')

    const controllerCardId = match.players.p1.drafted.find(id => cardById(id).layer === 'controller')
    if (controllerCardId) {
      const result = match.placeCard('p1', controllerCardId, 'model')
      expect(result.ok).toBe(false)
    }
  })
})

describe('FlowMatch - serve phase', () => {
  test('both players are resolved against the identical request each step', () => {
    const match = new FlowMatch({ player1Name: 'A', player2IsBot: true, seed: 7 })
    match.startForecast()
    match.startDraft()
    draftAllFirstOption(match, 'p1')
    buildAllCards(match, 'p1')
    match.startServe()

    const { request, resultP1, resultP2 } = match.resolveNextRequest()

    expect(resultP1.requestId).toEqual(request.id)
    expect(resultP2.requestId).toEqual(request.id)
  })

  test('an unblocked threat disables a card that stays disabled for the round', () => {
    const match = new FlowMatch({ player1Name: 'A', player2Name: 'B', seed: 1 })
    match.players.p1.drafted.push('model-database')
    match.placeCard('p1', 'model-database', 'model')
    match.currentRoundQueue = [
      { id: 'r1-threat0', kind: 'threat', threatType: 'SQL_INJECTION', targetLayer: 'model' }
    ]
    match.startServe()

    match.resolveNextRequest()

    expect(match.players.p1.layers.model[0].disabled).toBe(true)
  })

  test('finishes the round and rolls score into matchScore after the last request', () => {
    const match = new FlowMatch({ player1Name: 'A', player2Name: 'B', seed: 1 })
    match.players.p1.drafted.push('controller-routing', 'model-database', 'view-web-view')
    match.placeCard('p1', 'controller-routing', 'controller')
    match.placeCard('p1', 'model-database', 'model')
    match.placeCard('p1', 'view-web-view', 'view')
    match.currentRoundQueue = [
      { id: 'r1-data0', kind: 'data', route: 'Routing', dataDomain: 'Database', outputType: 'Web View' }
    ]
    match.startServe()

    match.resolveNextRequest()

    expect(match.phase).toEqual('roundSummary')
    expect(match.players.p1.matchScore).toEqual(1)
    expect(match.roundHistory).toHaveLength(1)
  })
})

describe('FlowMatch - match result', () => {
  test('declares the higher-scoring player the winner', () => {
    const match = new FlowMatch({ player1Name: 'A', player2Name: 'B', seed: 1 })
    match.players.p1.matchScore = 5
    match.players.p2.matchScore = 3

    const result = match.getMatchResult()

    expect(result.winnerId).toEqual('p1')
    expect(result.reason).toEqual('score')
    expect(match.phase).toEqual('matchEnd')
  })

  test('caches the result on repeated calls', () => {
    const match = new FlowMatch({ player1Name: 'A', player2Name: 'B', seed: 1 })
    match.players.p1.matchScore = 5
    const first = match.getMatchResult()
    const second = match.getMatchResult()
    expect(first).toBe(second)
  })

  test('runs bounded sudden death when tied and eventually resolves or draws', () => {
    const match = new FlowMatch({ player1Name: 'A', player2Name: 'B', seed: 1 })
    // both boards empty and equal - fully tied, forces sudden death to run its
    // bounded course and settle on a draw since neither side can succeed.
    const result = match.getMatchResult()

    expect(['draw', 'suddenDeath']).toContain(result.reason)
    expect(match.suddenDeath.active).toBe(true)
    expect(match.suddenDeath.requestsPlayed).toBeGreaterThan(0)
    expect(match.suddenDeath.requestsPlayed).toBeLessThanOrEqual(3)
  })

  test('isMatchOver is true once the single round has begun', () => {
    const match = new FlowMatch({ player1Name: 'A', player2Name: 'B', seed: 1 })
    expect(match.isMatchOver()).toBe(true)
  })
})
