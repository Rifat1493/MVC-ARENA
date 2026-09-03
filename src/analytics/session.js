/**
 * In-memory session and timing state for playtest metrics (decision latency,
 * session duration, turn counts).
 *
 * Durations use `performance.now()` rather than `Date.now()`. The wall clock can
 * jump during an OS time sync, which would corrupt the decision-latency metric;
 * `performance.now()` is monotonic and immune to that.
 *
 * @module analytics/session
 */

import { v4 as uuidV4 } from 'uuid'

/**
 * Monotonic timestamp in ms, falling back to the wall clock where
 * `performance` is unavailable.
 * @return {number} Monotonic time in ms.
 */
function now () {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now()
  }
  return Date.now()
}

/** @type {string|null} */
let sessionId = null

/** @type {string|null} */
let mode = null

/** @type {number|null} */
let sessionStartedAt = null

/** @type {number|null} */
let turnStartedAt = null

/** @type {number|null} */
let selectionStartedAt = null

/** @type {number} */
let turnNumber = 0

/**
 * Starts a new analytics session.
 * @param {string} sessionMode - `base` or `flow`.
 * @return {string} New session id.
 */
export function createSession (sessionMode) {
  sessionId = uuidV4()
  mode = sessionMode
  sessionStartedAt = now()
  turnNumber = 0
  turnStartedAt = null
  selectionStartedAt = null
  return sessionId
}

/** @return {string|null} */
export function getSessionId () {
  return sessionId
}

/** @return {string|null} */
export function getMode () {
  return mode
}

/**
 * Elapsed ms since session start.
 * @return {number|null}
 */
export function getSessionDurationMs () {
  if (sessionStartedAt === null) {
    return null
  }
  return Math.round(now() - sessionStartedAt)
}

/** Marks the start of a player's decision window (turn or selection). */
export function markTurnStart () {
  turnStartedAt = now()
}

/**
 * Ms since {@link markTurnStart}, or null if not marked.
 * @return {number|null}
 */
export function getDecisionDurationMs () {
  if (turnStartedAt === null) {
    return null
  }
  return Math.round(now() - turnStartedAt)
}

/** Marks when a Flow Mode selection phase opens. */
export function markSelectionStart () {
  selectionStartedAt = now()
}

/**
 * Ms since {@link markSelectionStart}, or null if not marked.
 * @return {number|null}
 */
export function getSelectionDurationMs () {
  if (selectionStartedAt === null) {
    return null
  }
  return Math.round(now() - selectionStartedAt)
}

/** Increments the turn counter (Base Mode). */
export function incrementTurn () {
  turnNumber += 1
}

/** @return {number} */
export function getTurnNumber () {
  return turnNumber
}

/** Clears session state after end or abandon. */
export function clearSession () {
  sessionId = null
  mode = null
  sessionStartedAt = null
  turnStartedAt = null
  selectionStartedAt = null
  turnNumber = 0
}
