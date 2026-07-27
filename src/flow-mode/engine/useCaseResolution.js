/**
 * Deterministic use-case resolution: a use case is fulfilled only when every
 * required card is installed on the player's board. Otherwise the flow halts
 * at the first missing requirement and reports the security consequence.
 *
 * @module flow-mode/engine/useCaseResolution
 */

import { cardById } from '@/flow-mode/data/cards'
import { LAYERS } from '@/flow-mode/engine/constants'

/**
 * Returns the set of card ids currently placed on the board.
 * @param {PlayerBoard} board - Player board.
 * @return {Set<string>} Placed card ids.
 */
function placedCardIds (board) {
  const ids = new Set()
  for (const layer of LAYERS) {
    for (const slot of board.layers[layer]) {
      ids.add(slot.cardId)
    }
  }
  return ids
}

/**
 * Counts how many of a use case's required cards are installed.
 * @param {PlayerBoard} board - Player board.
 * @param {UseCase} useCase - Use case being evaluated.
 * @return {int} Number of required cards present.
 */
function countFulfilledRequirements (board, useCase) {
  const owned = placedCardIds(board)
  return useCase.requiredCardIds.filter(id => owned.has(id)).length
}

/**
 * Resolves a use case against a player's board.
 *
 * @param {PlayerBoard} board - The player's board (read-only).
 * @param {UseCase} useCase - The use case under test.
 * @return {Object} Resolution result:
 *   `{ outcome, fulfilledRequirements, totalRequirements, missingCardId,
 *      failedAtLayer, explanation, securityRisk, consequence }`
 */
function resolveUseCase (board, useCase) {
  const owned = placedCardIds(board)
  const totalRequirements = useCase.requiredCardIds.length
  let fulfilledRequirements = 0

  for (const cardId of useCase.requiredCardIds) {
    if (!owned.has(cardId)) {
      const card = cardById(cardId)
      const cardName = card ? card.name : cardId
      const layer = card ? card.layer : null
      return {
        outcome: 'failed',
        fulfilledRequirements,
        totalRequirements,
        missingCardId: cardId,
        failedAtLayer: layer,
        explanation: `Missing ${cardName}. ${useCase.consequence}`,
        securityRisk: useCase.securityRisk,
        consequence: useCase.consequence
      }
    }
    fulfilledRequirements++
  }

  return {
    outcome: 'fulfilled',
    fulfilledRequirements,
    totalRequirements,
    missingCardId: null,
    failedAtLayer: null,
    explanation: `Fulfilled: ${useCase.title}. Request/response flow completed securely.`,
    securityRisk: useCase.securityRisk,
    consequence: null
  }
}

export { placedCardIds, countFulfilledRequirements, resolveUseCase }
