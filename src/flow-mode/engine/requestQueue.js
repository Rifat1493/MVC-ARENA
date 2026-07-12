/**
 * Builds each round's shared request queue: the same 5 requests (3 data + 2
 * threat) that both players face, generated deterministically from the
 * match's seeded rng so a match can be reproduced and both players see
 * identical requests.
 *
 * @module flow-mode/engine/requestQueue
 */

import { THREAT_TYPES, THREAT_TARGET_LAYER, DATA_REQUESTS_PER_ROUND, THREAT_REQUESTS_PER_ROUND } from '@/flow-mode/engine/constants'
import { rngPick, rngShuffle } from '@/flow-mode/engine/rng'

/**
 * Data request archetypes, built from the real Base Mode card names (see
 * `data/cards.js`). Covers every non-guard route/handler/template card at
 * least once across the archetype list, sampled (with replacement) to build
 * each round's data requests.
 */
const DATA_ARCHETYPES = [
  { route: 'Routing', dataDomain: 'Database', outputType: 'Web View' },
  { route: 'Middleware', dataDomain: 'Caching', outputType: 'CLI View' },
  { route: 'Authorization', dataDomain: 'Data Validation', outputType: 'Mobile View' },
  { route: 'CSRF Protection', dataDomain: 'File Storage Adapter', outputType: 'Web View' },
  { route: 'Rate Limiting', dataDomain: 'Secrets Manager', outputType: 'CLI View' }
]

/**
 * Builds one round's shared request queue: 3 data requests + 2 threat
 * requests, shuffled together. Calling this consumes from `rng`, so it must
 * be called once, in round order, per match (never re-derived from scratch
 * per player) so both players receive the identical queue.
 *
 * @param {function(): number} rng - The match's shared rng function.
 * @param {int} roundNumber - The round this queue is for (used only to build
 * readable, unique request ids).
 * @return {Array} 5 requests (data and threat requests mixed), shuffled.
 */
function buildRoundRequestQueue (rng, roundNumber) {
  const requests = []

  for (let i = 0; i < DATA_REQUESTS_PER_ROUND; i++) {
    const archetype = rngPick(rng, DATA_ARCHETYPES)
    requests.push({
      id: `round${roundNumber}-data${i}`,
      kind: 'data',
      route: archetype.route,
      dataDomain: archetype.dataDomain,
      outputType: archetype.outputType
    })
  }

  for (let i = 0; i < THREAT_REQUESTS_PER_ROUND; i++) {
    const threatType = rngPick(rng, THREAT_TYPES)
    requests.push({
      id: `round${roundNumber}-threat${i}`,
      kind: 'threat',
      threatType,
      targetLayer: THREAT_TARGET_LAYER[threatType]
    })
  }

  return rngShuffle(rng, requests)
}

/**
 * Builds a single request for a sudden-death attempt (used only when a match
 * is tied after 3 rounds). Picks a data or threat request with equal
 * probability.
 *
 * @param {function(): number} rng - The match's shared rng function.
 * @param {int} attemptIndex - Which sudden-death attempt this is (0-based;
 * used only to build a readable, unique request id).
 * @return {Object} A single data or threat request.
 */
function buildSuddenDeathRequest (rng, attemptIndex) {
  const isData = rng() < 0.5
  if (isData) {
    const archetype = rngPick(rng, DATA_ARCHETYPES)
    return {
      id: `suddendeath${attemptIndex}`,
      kind: 'data',
      route: archetype.route,
      dataDomain: archetype.dataDomain,
      outputType: archetype.outputType
    }
  }
  const threatType = rngPick(rng, THREAT_TYPES)
  return {
    id: `suddendeath${attemptIndex}`,
    kind: 'threat',
    threatType,
    targetLayer: THREAT_TARGET_LAYER[threatType]
  }
}

export { buildRoundRequestQueue, buildSuddenDeathRequest, DATA_ARCHETYPES }
