/**
 * Shared constants for Flow Mode.
 *
 * @module flow-mode/engine/constants
 */

/** The three MVC layers a card/column can belong to. */
export const LAYERS = ['controller', 'model', 'view']

/** The phases a FlowMatch moves through. */
export const PHASES = {
  SETUP: 'setup',
  FORECAST: 'forecast',
  DRAFT: 'draft',
  BUILD: 'build',
  SERVE: 'serve',
  ROUND_SUMMARY: 'roundSummary',
  MATCH_END: 'matchEnd'
}

/** The threat types a threat request can carry. */
export const THREAT_TYPES = ['SQL_INJECTION', 'XSS', 'SESSION_FORGERY']

/** Maps each threat type to the layer it targets. */
export const THREAT_TARGET_LAYER = {
  SQL_INJECTION: 'model',
  XSS: 'view',
  SESSION_FORGERY: 'controller'
}

/** Number of cards drafted per player per match. */
export const DRAFT_PICKS = 5

/** Number of requests served per round. */
export const REQUESTS_PER_ROUND = 5

/** Number of data requests (of the 5) in a round's queue. */
export const DATA_REQUESTS_PER_ROUND = 3

/** Number of threat requests (of the 5) in a round's queue. */
export const THREAT_REQUESTS_PER_ROUND = 2

/** Number of rounds in a match. */
export const ROUNDS_PER_MATCH = 1

/** Maximum extra requests to play in sudden death before declaring a draw. */
export const MAX_SUDDEN_DEATH_REQUESTS = 3
