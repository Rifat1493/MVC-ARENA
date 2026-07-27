import FlowMatch from '@/flow-mode/engine/matchManager'
import {
  INITIAL_CARD_TOTAL,
  UPGRADE_CARDS_PER_TURN,
  ITERATIONS_PER_MATCH
} from '@/flow-mode/engine/constants'
import { validateInitialSelection } from '@/flow-mode/engine/selection'

const VALID_INITIAL = [
  'controller-routing',
  'controller-authentication',
  'model-database',
  'model-orm',
  'view-web-view'
]

function selectInitial (match, playerId, cardIds = VALID_INITIAL) {
  const state = match.selectionState[playerId]
  state.selected = []
  for (const id of cardIds) {
    match.toggleSelectCard(playerId, id)
  }
  return match.confirmSelection(playerId)
}

function playThroughIteration (match, humanIds = ['p1']) {
  expect(match.phase).toEqual('useCase')
  match.startSelect()
  for (const playerId of humanIds) {
    if (match.selectionState.mode === 'initial') {
      selectInitial(match, playerId)
    } else {
      const owned = new Set(match.players[playerId].drafted)
      const available = [
        'controller-middleware', 'controller-authorization', 'controller-csrf-protection',
        'controller-rate-limiting', 'model-caching', 'model-data-validation',
        'model-file-storage-adapter', 'model-secrets-manager', 'view-mobile-view',
        'view-cli-view', 'view-output-validation'
      ].filter(id => !owned.has(id)).slice(0, UPGRADE_CARDS_PER_TURN)
      for (const id of available) {
        match.toggleSelectCard(playerId, id)
      }
      match.confirmSelection(playerId)
    }
  }
  expect(match.phase).toEqual('build')
  expect(match.bothBoardsComplete()).toBe(true)
  match.runSimulation()
  match.finishIteration()
  expect(match.phase).toEqual('iterationSummary')
}

describe('FlowMatch - schedule and determinism', () => {
  test('same seed produces identical use-case schedules and end results', () => {
    const run = () => {
      const match = new FlowMatch({ player1Name: 'A', player2IsBot: true, seed: 12345 })
      match.startUseCasePhase()
      const schedule = match.useCaseSchedule.map(uc => uc.id)
      for (let i = 0; i < ITERATIONS_PER_MATCH; i++) {
        playThroughIteration(match, ['p1'])
        if (i < ITERATIONS_PER_MATCH - 1) {
          match.continueAfterSummary()
        } else {
          match.getMatchResult()
        }
      }
      return { schedule, result: match.matchResult, history: match.iterationHistory.length }
    }
    expect(run()).toEqual(run())
  })

  test('schedules four unique use cases at construction', () => {
    const match = new FlowMatch({ player1Name: 'A', player2IsBot: true, seed: 5 })
    expect(match.useCaseSchedule).toHaveLength(4)
    expect(new Set(match.useCaseSchedule.map(u => u.id)).size).toEqual(4)
  })
})

describe('FlowMatch - selection', () => {
  test('bot selects and confirms instantly on startSelect', () => {
    const match = new FlowMatch({ player1Name: 'A', player2IsBot: true, seed: 1 })
    match.startUseCasePhase()
    match.startSelect()
    expect(match.selectionState.p2.confirmed).toBe(true)
    expect(match.players.p2.drafted).toHaveLength(INITIAL_CARD_TOTAL)
    expect(validateInitialSelection(match.players.p2.drafted).ok).toBe(true)
  })

  test('human initial selection requires exact 2/2/1 before confirm and auto-places', () => {
    const match = new FlowMatch({ player1Name: 'A', player2IsBot: true, seed: 1 })
    match.startUseCasePhase()
    match.startSelect()
    match.toggleSelectCard('p1', 'controller-routing')
    expect(match.confirmSelection('p1').ok).toBe(false)
    selectInitial(match, 'p1')
    expect(match.players.p1.drafted).toHaveLength(INITIAL_CARD_TOTAL)
    expect(match.phase).toEqual('build')
    expect(match.bothBoardsComplete()).toBe(true)
  })

  test('upgrade forbids already-owned cards and adds exactly two', () => {
    const match = new FlowMatch({ player1Name: 'A', player2IsBot: true, seed: 2 })
    match.startUseCasePhase()
    match.startSelect()
    selectInitial(match, 'p1')
    match.runSimulation()
    match.finishIteration()
    match.continueAfterSummary()
    match.startSelect()

    expect(match.selectionState.mode).toEqual('upgrade')
    expect(match.toggleSelectCard('p1', match.players.p1.drafted[0]).ok).toBe(false)

    const owned = new Set(match.players.p1.drafted)
    const picks = ['view-mobile-view', 'model-caching'].filter(id => !owned.has(id))
    for (const id of picks) { match.toggleSelectCard('p1', id) }
    expect(match.confirmSelection('p1').ok).toBe(true)
    expect(match.players.p1.drafted).toHaveLength(INITIAL_CARD_TOTAL + UPGRADE_CARDS_PER_TURN)
    expect(match.bothBoardsComplete()).toBe(true)
  })
})

describe('FlowMatch - simulate and scoring', () => {
  test('runSimulation returns fulfillment results for both players', () => {
    const match = new FlowMatch({ player1Name: 'A', player2IsBot: true, seed: 3 })
    match.startUseCasePhase()
    match.startSelect()
    selectInitial(match, 'p1')
    const sim = match.runSimulation()
    expect(sim.useCase).toBe(match.currentUseCase)
    expect(['fulfilled', 'failed']).toContain(sim.resultP1.outcome)
    expect(['fulfilled', 'failed']).toContain(sim.resultP2.outcome)
  })

  test('four iterations end in a match result without sudden death', () => {
    const match = new FlowMatch({ player1Name: 'A', player2IsBot: true, seed: 8 })
    match.startUseCasePhase()
    for (let i = 0; i < ITERATIONS_PER_MATCH; i++) {
      playThroughIteration(match, ['p1'])
      if (i < ITERATIONS_PER_MATCH - 1) {
        match.continueAfterSummary()
      }
    }
    const result = match.getMatchResult()
    expect(match.phase).toEqual('matchEnd')
    expect(match.iterationHistory).toHaveLength(4)
    expect(['score', 'requirements', 'draw']).toContain(result.reason)
  })
})
