/**
 * Resolves a data request against a player's board by walking the
 * Controller -> Model -> View chain.
 *
 * @module flow-mode/engine/chainResolution
 */

import { findActiveCardByMatch } from '@/flow-mode/engine/board'

/**
 * @typedef {Object} ChainResolutionResult
 * @prop {string} requestId - The id of the request that was resolved.
 * @prop {string} outcome - 'served' | 'failed'.
 * @prop {string|null} failedAtLayer - The layer the chain broke at, or null if served.
 * @prop {string|null} failureCode - 'NO_ROUTE' | 'NO_HANDLER' | 'NO_TEMPLATE' | null.
 * @prop {Object} matchedCards - `{ controller, model, view }` card ids used, or null per layer.
 * @prop {string} explanation - A short, HTTP-flavored explanation of the outcome.
 */

/**
 * Resolves a data request against the given player board.
 *
 * A data request is only served if the board has a matching route card
 * (Controller), then a matching handler card (Model), then a matching
 * template card (View) - all non-disabled. The first missing link determines
 * where and why the request fails.
 *
 * @param {PlayerBoard} board - The player's board.
 * @param {Object} request - A data request `{ id, route, dataDomain, outputType }`.
 * @return {ChainResolutionResult} The resolution result.
 */
function resolveDataRequest (board, request) {
  const matchedCards = { controller: null, model: null, view: null }

  const routeSlot = findActiveCardByMatch(board.layers.controller, request.route)
  if (!routeSlot) {
    return {
      requestId: request.id,
      outcome: 'failed',
      failedAtLayer: 'controller',
      failureCode: 'NO_ROUTE',
      matchedCards,
      explanation: `404 - no route for ${request.route}`
    }
  }
  matchedCards.controller = routeSlot.cardId

  const handlerSlot = findActiveCardByMatch(board.layers.model, request.dataDomain)
  if (!handlerSlot) {
    return {
      requestId: request.id,
      outcome: 'failed',
      failedAtLayer: 'model',
      failureCode: 'NO_HANDLER',
      matchedCards,
      explanation: `500 - no handler for ${request.dataDomain}`
    }
  }
  matchedCards.model = handlerSlot.cardId

  const templateSlot = findActiveCardByMatch(board.layers.view, request.outputType)
  if (!templateSlot) {
    return {
      requestId: request.id,
      outcome: 'failed',
      failedAtLayer: 'view',
      failureCode: 'NO_TEMPLATE',
      matchedCards,
      explanation: `Template missing for ${request.outputType}`
    }
  }
  matchedCards.view = templateSlot.cardId

  return {
    requestId: request.id,
    outcome: 'served',
    failedAtLayer: null,
    failureCode: null,
    matchedCards,
    explanation: `200 OK - ${request.route} served via ${request.dataDomain} as ${request.outputType}`
  }
}

export { resolveDataRequest }
