/**
 * Durable Supabase sink for playtest telemetry.
 *
 * Events are buffered in memory + localStorage, then flushed via the
 * `log_game_events` RPC (see supabase/setup.sql).
 *
 * @module analytics/supabaseLogger
 */

import { v4 as uuidV4 } from 'uuid'
import { isPlaytest } from '@/analytics/playtest'

const BUFFER_KEY = 'mvcarena.telemetry.buffer'
const CLIENT_ID_KEY = 'mvcarena.telemetry.clientId'
const RPC = 'log_game_events'

/**
 * Normalizes the project URL from env.
 * @param {string} url - Raw env value.
 * @return {string} Project root without trailing slash.
 */
function normalizeProjectUrl (url) {
  return url.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '')
}

/**
 * @param {string} url - Raw env value.
 * @return {string} Full RPC URL.
 */
function buildEndpoint (url) {
  return `${normalizeProjectUrl(url)}/rest/v1/rpc/${RPC}`
}

const BATCH_SIZE = 20
const FLUSH_INTERVAL_MS = 15000
const MAX_BUFFERED_EVENTS = 500

let enabled = false
let endpoint = null
let apiKey = null
let clientId = null

/** @type {Object[]} */
let buffer = []

/** @type {boolean} */
let flushInFlight = false

/** @type {ReturnType<typeof setTimeout>|null} */
let flushDebounceTimer = null

/** @type {ReturnType<typeof setInterval>|null} */
let flushTimer = null

function scheduleFlush () {
  if (flushDebounceTimer) {
    clearTimeout(flushDebounceTimer)
  }
  flushDebounceTimer = setTimeout(() => {
    flushDebounceTimer = null
    flushSupabaseEvents()
  }, 2000)
}

function readStorage (key) {
  try {
    return window.localStorage.getItem(key)
  } catch (error) {
    return null
  }
}

function writeStorage (key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    // Storage unavailable.
  }
}

function resolveClientId () {
  const existing = readStorage(CLIENT_ID_KEY)
  if (existing) {
    return existing
  }
  const created = uuidV4()
  writeStorage(CLIENT_ID_KEY, created)
  return created
}

function persistBuffer () {
  writeStorage(BUFFER_KEY, JSON.stringify(buffer))
}

function restoreBuffer () {
  const raw = readStorage(BUFFER_KEY)
  if (!raw) {
    return
  }
  try {
    const restored = JSON.parse(raw)
    if (Array.isArray(restored) && restored.length) {
      buffer = restored.concat(buffer)
    }
  } catch (error) {
    writeStorage(BUFFER_KEY, '[]')
  }
}

function buildHeaders () {
  const headers = {
    'Content-Type': 'application/json',
    apikey: apiKey
  }

  if (!apiKey.startsWith('sb_')) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  return headers
}

/**
 * @param {Object[]} rows - Rows to insert.
 * @param {bool} [keepalive=false]
 * @return {Promise<bool>}
 */
async function postRows (rows, keepalive = false) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      keepalive,
      headers: buildHeaders(),
      body: JSON.stringify({ events: rows })
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      console.error(
        '[analytics] Supabase insert failed',
        response.status,
        endpoint,
        detail
      )
    }

    return response.ok
  } catch (error) {
    console.error('[analytics] Supabase insert error', endpoint, error)
    return false
  }
}

/**
 * @param {Object} [options]
 * @param {bool} [options.keepalive=false]
 * @return {Promise<void>}
 */
export async function flushSupabaseEvents ({ keepalive = false } = {}) {
  if (!enabled || flushInFlight || !buffer.length) {
    return
  }

  flushInFlight = true
  const batch = buffer.slice(0, BATCH_SIZE)

  try {
    const ok = await postRows(batch, keepalive)
    if (ok) {
      buffer = buffer.slice(batch.length)
      persistBuffer()
    }
  } finally {
    flushInFlight = false
  }
}

async function drainBuffer () {
  let guard = 0
  while (enabled && buffer.length && guard < 50) {
    const before = buffer.length
    await flushSupabaseEvents()
    if (buffer.length === before) {
      break
    }
    guard++
  }
}

function registerFlushTriggers () {
  const flushOnExit = () => {
    if (buffer.length) {
      flushSupabaseEvents({ keepalive: true })
    }
  }

  window.addEventListener('pagehide', flushOnExit)
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushOnExit()
    }
  })

  flushTimer = setInterval(() => {
    flushSupabaseEvents()
  }, FLUSH_INTERVAL_MS)
}

/**
 * @return {boolean}
 */
export function initSupabaseLogger () {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (key && (key.startsWith('sb_secret_') || key.includes('service_role'))) {
    console.error(
      '[analytics] Refusing to start: VITE_SUPABASE_PUBLISHABLE_KEY looks ' +
      'like a SECRET key. Use the publishable key (sb_publishable_...).'
    )
    return false
  }

  if (!url || !key) {
    console.info(
      '[analytics] Supabase logging disabled — set VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_PUBLISHABLE_KEY in .env'
    )
    return false
  }

  endpoint = buildEndpoint(url)
  apiKey = key
  clientId = resolveClientId()
  enabled = true

  restoreBuffer()
  registerFlushTriggers()
  drainBuffer()

  console.info(
    '[analytics] Supabase logging enabled — client_id:',
    clientId,
    'endpoint:',
    endpoint
  )

  return true
}

/** @return {boolean} */
export function isSupabaseLoggingEnabled () {
  return enabled
}

/** @return {string|null} */
export function getClientId () {
  return clientId
}

/**
 * Queues one event row matching supabase/setup.sql.
 * @param {string} event - Event name.
 * @param {Object} [properties] - Event properties (stored in jsonb).
 */
export function logSupabaseEvent (event, properties = {}) {
  if (!enabled) {
    return
  }

  const rest = { ...properties }
  const sessionId = rest.game_session_id || null
  delete rest.game_session_id
  delete rest.is_playtest

  buffer.push({
    event_id: uuidV4(),
    client_id: clientId,
    session_id: sessionId,
    event,
    is_playtest: isPlaytest(),
    client_time: new Date().toISOString(),
    properties: rest
  })

  if (buffer.length > MAX_BUFFERED_EVENTS) {
    buffer = buffer.slice(-MAX_BUFFERED_EVENTS)
  }

  persistBuffer()

  if (buffer.length >= BATCH_SIZE) {
    flushSupabaseEvents()
  } else {
    scheduleFlush()
  }
}

export function stopSupabaseLogger () {
  if (flushTimer) {
    clearInterval(flushTimer)
    flushTimer = null
  }
  if (flushDebounceTimer) {
    clearTimeout(flushDebounceTimer)
    flushDebounceTimer = null
  }
}
