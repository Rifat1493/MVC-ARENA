/**
 * Round and match scoring, plus match-winner and sudden-death decisions.
 *
 * @module flow-mode/engine/scoring
 */

import { resolveDataRequest } from '@/flow-mode/engine/chainResolution'
import { resolveThreatRequest } from '@/flow-mode/engine/threatResolution'

/**
 * @typedef {Object} RoundScoreResult
 * @prop {int} served - Number of data requests served this round.
 * @prop {int} blocked - Number of threats blocked this round.
 * @prop {int} penetrated - Number of threats that penetrated this round.
 * @prop {int} roundScore - Total points earned this round (served + blocked).
 */

/**
 * Tallies a player's results for a round into a score summary.
 * @param {PlayerBoard} board - The player's board (unused directly, kept for
 * API symmetry/future use, e.g. bonus scoring based on board state).
 * @param {Array} roundResults - The chain/threat resolution results for every
 * request the player faced this round.
 * @return {RoundScoreResult} The round's score summary.
 */
function scoreRound (board, roundResults) {
  let served = 0
  let blocked = 0
  let penetrated = 0

  for (const result of roundResults) {
    if (result.outcome === 'served') { served++ }
    else if (result.outcome === 'blocked') { blocked++ }
    else if (result.outcome === 'penetrated') { penetrated++ }
  }

  return { served, blocked, penetrated, roundScore: served + blocked }
}

/**
 * Rolls a round's score into a player's board: sets `board.roundScore`,
 * adds to `board.matchScore`, and adds any penetrations suffered to
 * `board.penetrations` (the tiebreaker count). Mutates the board.
 * @param {PlayerBoard} board - The board to update.
 * @param {RoundScoreResult} roundScoreResult - The round's score summary.
 */
function applyRoundScoreToMatch (board, roundScoreResult) {
  board.roundScore = roundScoreResult.roundScore
  board.matchScore += roundScoreResult.roundScore
  board.penetrations += roundScoreResult.penetrated
}

/**
 * Determines the winner between two player boards.
 *
 * Highest `matchScore` wins. If tied, fewer `penetrations` wins. If still
 * tied, no winner is decided (caller should proceed to sudden death).
 *
 * @param {PlayerBoard} boardA - The first player's board.
 * @param {PlayerBoard} boardB - The second player's board.
 * @return {{winnerId: (string|null), reason: string}} The winner's playerId
 * (or null if still tied) and the reason: 'score' | 'penetrations' | 'tie'.
 */
function determineMatchWinner (boardA, boardB) {
  if (boardA.matchScore !== boardB.matchScore) {
    const winner = boardA.matchScore > boardB.matchScore ? boardA : boardB
    return { winnerId: winner.playerId, reason: 'score' }
  }
  if (boardA.penetrations !== boardB.penetrations) {
    const winner = boardA.penetrations < boardB.penetrations ? boardA : boardB
    return { winnerId: winner.playerId, reason: 'penetrations' }
  }
  return { winnerId: null, reason: 'tie' }
}

/**
 * Resolves a single sudden-death request against both boards and decides if
 * it breaks the tie: it is decided only if exactly one player "succeeded"
 * (served the data request, or blocked the threat) and the other did not.
 * If both players have the same outcome, the tie is not broken.
 *
 * @param {PlayerBoard} boardA - The first player's board (read-only).
 * @param {PlayerBoard} boardB - The second player's board (read-only).
 * @param {Object} request - A single data or threat request.
 * @param {function(): number} rngA - Outcome rng for boardA (threat requests only).
 * @param {function(): number} rngB - Outcome rng for boardB (threat requests only).
 * @return {{resultA: Object, resultB: Object, decided: bool, winnerId: (string|undefined)}}
 */
function resolveSuddenDeathRequest (boardA, boardB, request, rngA, rngB) {
  const resolve = (board, rng) => {
    return request.kind === 'data'
      ? resolveDataRequest(board, request)
      : resolveThreatRequest(board, request, rng)
  }

  const resultA = resolve(boardA, rngA)
  const resultB = resolve(boardB, rngB)

  const succeededA = resultA.outcome === 'served' || resultA.outcome === 'blocked'
  const succeededB = resultB.outcome === 'served' || resultB.outcome === 'blocked'

  if (succeededA === succeededB) {
    return { resultA, resultB, decided: false }
  }

  return {
    resultA,
    resultB,
    decided: true,
    winnerId: succeededA ? boardA.playerId : boardB.playerId
  }
}

export { scoreRound, applyRoundScoreToMatch, determineMatchWinner, resolveSuddenDeathRequest }
