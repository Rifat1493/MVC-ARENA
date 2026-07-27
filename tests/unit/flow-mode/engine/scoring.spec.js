import {
  scoreIteration,
  applyIterationScoreToMatch,
  determineMatchWinner
} from '@/flow-mode/engine/scoring'
import { createPlayerBoard } from '@/flow-mode/engine/board'

describe('scoring', () => {
  test('scoreIteration awards 1 for fulfilled and 0 for failed', () => {
    expect(scoreIteration({
      outcome: 'fulfilled', fulfilledRequirements: 4, totalRequirements: 4
    })).toEqual({
      fulfilled: true,
      fulfilledRequirements: 4,
      totalRequirements: 4,
      iterationScore: 1
    })
    expect(scoreIteration({
      outcome: 'failed', fulfilledRequirements: 2, totalRequirements: 4
    }).iterationScore).toEqual(0)
  })

  test('applyIterationScoreToMatch accumulates score and requirements', () => {
    const board = createPlayerBoard('p1', 'Alice')
    applyIterationScoreToMatch(board, {
      fulfilled: true, fulfilledRequirements: 4, totalRequirements: 4, iterationScore: 1
    })
    applyIterationScoreToMatch(board, {
      fulfilled: false, fulfilledRequirements: 2, totalRequirements: 5, iterationScore: 0
    })
    expect(board.matchScore).toEqual(1)
    expect(board.requirementsFulfilled).toEqual(6)
    expect(board.roundScore).toEqual(0)
  })

  test('determineMatchWinner prefers higher matchScore, then requirements', () => {
    const a = createPlayerBoard('p1', 'A')
    const b = createPlayerBoard('p2', 'B')
    a.matchScore = 2
    b.matchScore = 1
    expect(determineMatchWinner(a, b)).toEqual({ winnerId: 'p1', reason: 'score' })

    b.matchScore = 2
    a.requirementsFulfilled = 10
    b.requirementsFulfilled = 12
    expect(determineMatchWinner(a, b)).toEqual({ winnerId: 'p2', reason: 'requirements' })

    b.requirementsFulfilled = 10
    expect(determineMatchWinner(a, b)).toEqual({ winnerId: null, reason: 'draw' })
  })
})
