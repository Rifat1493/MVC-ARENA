/**
 * Iteration and match scoring for use-case Flow Mode.
 *
 * @module flow-mode/engine/scoring
 */

/**
 * @typedef {Object} IterationScoreResult
 * @prop {bool} fulfilled - Whether the use case was fully fulfilled.
 * @prop {int} fulfilledRequirements - Required cards present.
 * @prop {int} totalRequirements - Required cards for the use case.
 * @prop {int} iterationScore - 1 if fulfilled, else 0.
 */

/**
 * Tallies one iteration's resolution into a score summary.
 * @param {Object} result - A {@link resolveUseCase} result.
 * @return {IterationScoreResult} Score summary for the iteration.
 */
function scoreIteration (result) {
  const fulfilled = result.outcome === 'fulfilled'
  return {
    fulfilled,
    fulfilledRequirements: result.fulfilledRequirements,
    totalRequirements: result.totalRequirements,
    iterationScore: fulfilled ? 1 : 0
  }
}

/**
 * Rolls an iteration's score into a player's board. Mutates the board.
 * @param {PlayerBoard} board - The board to update.
 * @param {IterationScoreResult} iterationScore - Score summary.
 */
function applyIterationScoreToMatch (board, iterationScore) {
  board.roundScore = iterationScore.iterationScore
  board.matchScore += iterationScore.iterationScore
  board.requirementsFulfilled =
    (board.requirementsFulfilled || 0) + iterationScore.fulfilledRequirements
}

/**
 * Determines the winner between two player boards.
 *
 * Highest `matchScore` (fulfilled use cases) wins. If tied, higher
 * `requirementsFulfilled` wins. If still tied, draw.
 *
 * @param {PlayerBoard} boardA - First player.
 * @param {PlayerBoard} boardB - Second player.
 * @return {{winnerId: (string|null), reason: string}} Winner and reason.
 */
function determineMatchWinner (boardA, boardB) {
  if (boardA.matchScore !== boardB.matchScore) {
    const winner = boardA.matchScore > boardB.matchScore ? boardA : boardB
    return { winnerId: winner.playerId, reason: 'score' }
  }
  const reqA = boardA.requirementsFulfilled || 0
  const reqB = boardB.requirementsFulfilled || 0
  if (reqA !== reqB) {
    const winner = reqA > reqB ? boardA : boardB
    return { winnerId: winner.playerId, reason: 'requirements' }
  }
  return { winnerId: null, reason: 'draw' }
}

export { scoreIteration, applyIterationScoreToMatch, determineMatchWinner }
