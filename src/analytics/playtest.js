/**
 * Playtest participant gate and anonymous study ID.
 *
 * Players may enter an optional code on the home screen. When it matches
 * {@link PLAYTEST_CODE}, Base sessions are tagged `is_playtest` and the
 * participant is asked for a self-generated study ID so pre/post questionnaires
 * can be linked anonymously.
 *
 * @module analytics/playtest
 */

/** Study code given to recruited participants. */
export const PLAYTEST_CODE = 'T1K5M9'

/** @type {boolean} */
let playtestActive = false

/** @type {string} */
let studyId = ''

/**
 * Applies the code entered on the home screen.
 * @param {string} raw - Raw text-box value.
 * @return {boolean} Whether playtest mode is now active.
 */
export function setPlaytestCode (raw) {
  const normalized = String(raw || '').trim().toUpperCase()
  playtestActive = normalized === PLAYTEST_CODE
  if (!playtestActive) {
    studyId = ''
  }
  return playtestActive
}

/**
 * Stores the participant's self-generated study ID (lowercase).
 * @param {string} raw - Raw text-box value.
 * @return {string} Normalized study ID, or '' if empty.
 */
export function setStudyId (raw) {
  studyId = String(raw || '').trim().toLowerCase()
  return studyId
}

/** @return {boolean} Whether the current browser is in playtest mode. */
export function isPlaytest () {
  return playtestActive
}

/** @return {string} Stored study ID, or ''. */
export function getStudyId () {
  return studyId
}

/** Clears playtest mode and study ID. */
export function clearPlaytest () {
  playtestActive = false
  studyId = ''
}
