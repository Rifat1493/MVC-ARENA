/**
 * Deterministic use-case resolution: fulfill only when every required card
 * from the use case is present on the player's board. No security narrative
 * is used as the pass/fail reason — that is only card matching.
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
 * Builds a short failure explanation for a missing required card.
 * @param {string} cardName - Display name of the missing card.
 * @param {string|null} layer - MVC layer of the missing card.
 * @return {string} Pipeline-facing explanation.
 * @private
 */
function missingCardExplanation (cardName, layer) {
  const layerLabel = layer
    ? layer.charAt(0).toUpperCase() + layer.slice(1)
    : 'system'
  return `Not fulfilled: required card "${cardName}" (${layerLabel}) is missing from your system.`
}

/**
 * Resolves a use case against a player's board by matching required cards
 * to played cards.
 *
 * @param {PlayerBoard} board - The player's board (read-only).
 * @param {UseCase} useCase - The use case under test.
 * @return {Object} Resolution result.
 */
function resolveUseCase (board, useCase) {
  const owned = placedCardIds(board)
  const totalRequirements = useCase.requiredCardIds.length
  let fulfilledRequirements = 0
  const matchedCardIds = []

  for (const cardId of useCase.requiredCardIds) {
    if (!owned.has(cardId)) {
      const card = cardById(cardId)
      const cardName = card ? card.name : cardId
      const layer = card ? card.layer : null
      return {
        outcome: 'failed',
        fulfilledRequirements,
        totalRequirements,
        matchedCardIds,
        missingCardId: cardId,
        failedAtLayer: layer,
        explanation: missingCardExplanation(cardName, layer),
        // Kept for the end-of-iteration lesson only — not used as the fail reason.
        securityRisk: useCase.securityRisk,
        consequence: useCase.consequence
      }
    }
    matchedCardIds.push(cardId)
    fulfilledRequirements++
  }

  return {
    outcome: 'fulfilled',
    fulfilledRequirements,
    totalRequirements,
    matchedCardIds,
    missingCardId: null,
    failedAtLayer: null,
    explanation: `Fulfilled: all ${totalRequirements} required cards are in your system.`,
    securityRisk: useCase.securityRisk,
    consequence: null
  }
}

export { placedCardIds, countFulfilledRequirements, resolveUseCase, missingCardExplanation }
