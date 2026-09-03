/**
 * Playtest telemetry entry point (Supabase).
 *
 * @module analytics
 */

import { initSupabaseLogger } from '@/analytics/supabaseLogger'

export {
  initSupabaseLogger,
  isSupabaseLoggingEnabled,
  getClientId,
  flushSupabaseEvents
} from '@/analytics/supabaseLogger'
export { capture } from '@/analytics/capture'
export {
  PLAYTEST_CODE,
  setPlaytestCode,
  isPlaytest,
  clearPlaytest
} from '@/analytics/playtest'
export * from '@/analytics/gameAnalytics'

/**
 * Initializes Supabase logging when credentials are configured.
 * @return {boolean} Whether logging is active.
 */
export function initAnalytics () {
  return initSupabaseLogger()
}
