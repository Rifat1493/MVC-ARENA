/** No-op analytics mocks for Jest. */

export function initSupabaseLogger () { return false }
export function initAnalytics () { return false }
export function isSupabaseLoggingEnabled () { return false }
export function getClientId () { return null }
export function logSupabaseEvent () {}
export function flushSupabaseEvents () { return Promise.resolve() }
export function stopSupabaseLogger () {}
export function capture () {}

export const PLAYTEST_CODE = 'T1K5M9'
export function setPlaytestCode () { return false }
export function isPlaytest () { return false }
export function clearPlaytest () {}

export function startBaseSession () {}
export function markBaseTurnStart () {}
export function trackBaseAction () {}
export function trackHazard () {}
export function endBaseSession () {}
export function abandonBaseSession () {}
export function startFlowSession () {}
export function trackFlowPhase () {}
export function trackFlowSelectionConfirmed () {}
export function trackFlowSimulationCompleted () {}
export function endFlowSession () {}
export function abandonFlowSession () {}
