/**
 * Builds an approximate, bucketed traffic forecast for a round from the
 * actual request queue that was generated for it - honest, but not an exact
 * reveal of the queue's contents.
 *
 * @module flow-mode/engine/forecast
 */

/**
 * @typedef {Object} Forecast
 * @prop {int} dataPct - Rounded percentage of the round's requests that are data requests.
 * @prop {int} threatPct - Rounded percentage that are threats.
 * @prop {string[]} threatTypesPresent - The distinct threat types present this round.
 * @prop {string} headline - A one-line human-readable summary.
 */

/**
 * Builds a forecast describing (approximately) the given round request queue.
 * @param {Array} requestQueue - The round's requests (data and threat requests mixed).
 * @return {Forecast} The forecast.
 */
function buildForecast (requestQueue) {
  const total = requestQueue.length
  const dataCount = requestQueue.filter(r => r.kind === 'data').length
  const threatRequests = requestQueue.filter(r => r.kind === 'threat')
  const threatTypesPresent = [...new Set(threatRequests.map(r => r.threatType))]

  const dataPct = Math.round((dataCount / total) * 100)
  const threatPct = 100 - dataPct

  let headline = `~${dataPct}% data requests, ~${threatPct}% threats`
  if (threatTypesPresent.length > 0) {
    headline += `, expect ${threatTypesPresent.join(' and ')}`
  }

  return { dataPct, threatPct, threatTypesPresent, headline }
}

export { buildForecast }
