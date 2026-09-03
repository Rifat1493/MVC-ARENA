/**
 * Records gameplay telemetry into Supabase when credentials are configured.
 *
 * @module analytics/capture
 */

import { logSupabaseEvent } from '@/analytics/supabaseLogger'

/**
 * Queues an event for insertion into Supabase.
 * @param {string} event - Event name.
 * @param {Object} [properties] - Event properties.
 */
export function capture (event, properties = {}) {
  logSupabaseEvent(event, properties)
}
