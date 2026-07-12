/**
 * Resolves a threat request against a player's board: either a matching
 * guard blocks it, or it penetrates and disables a card in the target layer.
 *
 * @module flow-mode/engine/threatResolution
 */

import { findActiveGuardByBlocks } from '@/flow-mode/engine/board'
import { rngPick } from '@/flow-mode/engine/rng'

/**
 * @typedef {Object} ThreatResolutionResult
 * @prop {string} requestId - The id of the request that was resolved.
 * @prop {string} outcome - 'blocked' | 'penetrated'.
 * @prop {string|null} guardCardId - The guard card that blocked it, or null if penetrated.
 * @prop {string|null} damagedCardId - The card disabled by the penetration, or null.
 * @prop {string} explanation - A short explanation of the outcome.
 */

/**
 * Resolves a threat request against the given player board.
 *
 * If the board has a non-disabled guard in `request.targetLayer` that blocks
 * `request.threatType`, the threat is blocked. Otherwise it penetrates: a
 * random non-disabled card in the target layer is chosen as the one that
 * *would* be damaged (if the target layer has no non-disabled card at all,
 * the threat still penetrates but there is nothing to damage).
 *
 * This function is pure - it does NOT mutate the board. Callers are
 * responsible for applying `damagedCardId` via {@link module:flow-mode/engine/board.applyDamage}.
 *
 * @param {PlayerBoard} board - The player's board (read-only).
 * @param {Object} request - A threat request `{ id, threatType, targetLayer }`.
 * @param {function(): number} outcomeRng - A rng function used only to pick
 * which card would be damaged on penetration.
 * @return {ThreatResolutionResult} The resolution result.
 */
function resolveThreatRequest (board, request, outcomeRng) {
  const guardSlot = findActiveGuardByBlocks(board.layers[request.targetLayer], request.threatType)

  if (guardSlot) {
    return {
      requestId: request.id,
      outcome: 'blocked',
      guardCardId: guardSlot.cardId,
      damagedCardId: null,
      explanation: `${request.threatType} blocked at ${request.targetLayer}`
    }
  }

  const undamaged = board.layers[request.targetLayer].filter(slot => !slot.disabled)
  if (undamaged.length === 0) {
    return {
      requestId: request.id,
      outcome: 'penetrated',
      guardCardId: null,
      damagedCardId: null,
      explanation: `${request.threatType} penetrated the ${request.targetLayer} layer - no defense present`
    }
  }

  const damaged = rngPick(outcomeRng, undamaged)

  return {
    requestId: request.id,
    outcome: 'penetrated',
    guardCardId: null,
    damagedCardId: damaged.cardId,
    explanation: `${request.threatType} penetrated the ${request.targetLayer} layer and disabled a card`
  }
}

export { resolveThreatRequest }
