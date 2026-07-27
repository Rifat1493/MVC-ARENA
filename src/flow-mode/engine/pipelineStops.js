/**
 * Pure helpers describing the sequence of "stops" a use-case pipeline
 * animation visits, and which stop it halts at.
 *
 * @module flow-mode/engine/pipelineStops
 */

import { LAYERS } from '@/flow-mode/engine/constants'

/**
 * Builds the ordered MVC request/response pipeline stops.
 *
 * Shape: Request → Controller → Model → View → Response
 *
 * @param {UseCase} [_useCase] - Reserved for callers; stops are fixed for all use cases.
 * @return {Array<{key: string, label: string, layer: (string|null), cardId: (string|null)}>}
 */
function computeStops (_useCase) {
  return [
    { key: 'request', label: 'Request', layer: null, cardId: null },
    { key: 'controller', label: 'Controller', layer: 'controller', cardId: null },
    { key: 'model', label: 'Model', layer: 'model', cardId: null },
    { key: 'view', label: 'View', layer: 'view', cardId: null },
    { key: 'response', label: 'Response', layer: null, cardId: null }
  ]
}

/**
 * Determines which stop index a use-case pipeline halts at.
 *
 * Fulfilled → Response. Failed → the MVC layer of the first missing card.
 *
 * @param {Array} stops - The stops from {@link computeStops}.
 * @param {UseCase} _useCase - Reserved for callers.
 * @param {Object} result - Its resolution result.
 * @return {int} The index within `stops` the animation should stop at.
 */
function computeHaltIndex (stops, _useCase, result) {
  if (result.outcome === 'fulfilled') {
    return stops.length - 1
  }
  if (result.failedAtLayer && LAYERS.includes(result.failedAtLayer)) {
    const index = stops.findIndex(s => s.layer === result.failedAtLayer)
    if (index >= 0) { return index }
  }
  return Math.max(0, stops.length - 2)
}

export { computeStops, computeHaltIndex }
