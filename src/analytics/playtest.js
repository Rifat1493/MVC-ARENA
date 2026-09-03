/**
 * Playtest participant gate.
 *
 * Players may enter an optional code on the home screen. When it matches
 * {@link PLAYTEST_CODE}, Base sessions are tagged `is_playtest` so analysis
 * can separate study sessions from casual play.
 *
 * @module analytics/playtest
 */

/** Study code given to recruited participants. */
export const PLAYTEST_CODE = 'T1K5M9'

/** @type {boolean} */
let playtestActive = false

/**
 * Applies the code entered on the home screen.
 * @param {string} raw - Raw text-box value.
 * @return {boolean} Whether playtest mode is now active.
 */
export function setPlaytestCode (raw) {
  const normalized = String(raw || '').trim().toUpperCase()
  playtestActive = normalized === PLAYTEST_CODE
  return playtestActive
}

/** @return {boolean} Whether the current browser is in playtest mode. */
export function isPlaytest () {
  return playtestActive
}

/** Clears playtest mode. */
export function clearPlaytest () {
  playtestActive = false
}
