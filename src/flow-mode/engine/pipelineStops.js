/**
 * Pure helpers describing the sequence of "stops" a request's pipeline
 * animation visits, and which stop it halts at. Shared between
 * `RequestPipeline.vue` (which renders the stops for a single player) and
 * `FlowModePage.vue` (which needs to know when every pipeline on screen has
 * reached its own halt, to enable the "Next" button).
 *
 * @module flow-mode/engine/pipelineStops
 */

/**
 * Builds the ordered list of stops for a request's pipeline animation.
 *
 * Every request - data or threat - travels the same full round trip:
 * Request -> Controller -> Model -> Controller (return) -> View -> Response,
 * making the second visit to the Controller explicit. This keeps the
 * pipeline shape consistent regardless of what kind of request it is: a
 * threat is just a request that happens to be attacking a specific layer,
 * not a different journey.
 *
 * @return {Array<{key: string, label: string, layer: (string|null)}>} The stops.
 */
function computeStops () {
  return [
    { key: 'request', label: 'Request', layer: null },
    { key: 'controller-out', label: 'Controller', layer: 'controller' },
    { key: 'model', label: 'Model', layer: 'model' },
    { key: 'controller-return', label: 'Controller', layer: 'controller' },
    { key: 'view', label: 'View', layer: 'view' },
    { key: 'response', label: 'Response', layer: null }
  ]
}

/**
 * Determines which stop index a request's pipeline halts at.
 *
 * A served data request reaches the last stop (Response). A failed data
 * request halts at the stop matching `result.failedAtLayer`. A threat
 * request - blocked or penetrated - always halts at the stop matching its
 * `targetLayer`, the same way a failure halts a data request: the pipeline
 * doesn't continue on to a Response, because the request never gets that far
 * either way (its outcome is decided the moment it reaches that layer).
 *
 * @param {Array} stops - The stops from {@link computeStops}.
 * @param {Object} request - The request being animated.
 * @param {Object} result - Its resolution result.
 * @return {int} The index within `stops` the animation should stop at.
 */
function computeHaltIndex (stops, request, result) {
  if (request.kind === 'data') {
    if (result.outcome === 'served') { return stops.length - 1 }
    return stops.findIndex(s => s.layer === result.failedAtLayer)
  }
  return stops.findIndex(s => s.layer === request.targetLayer)
}

export { computeStops, computeHaltIndex }
