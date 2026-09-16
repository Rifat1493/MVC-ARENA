/**
 * Playtest-oriented game telemetry for MVC-ARENA.
 *
 * Base Mode writes lean columnar rows to Supabase (`base_game_events`).
 * Flow Mode keeps local session/timing helpers for later; it does not write
 * to the Base table (Flow gets its own table later).
 *
 * Base stream:
 *   session_started → player_action* / hazard_drawn* →
 *   session_ended | session_abandoned
 *
 * @module analytics/gameAnalytics
 */

import { capture } from '@/analytics/capture'
import { flushSupabaseEvents } from '@/analytics/supabaseLogger'
import { isAttack } from '@/classes/card/cardData'
import {
  createSession,
  clearSession,
  getSessionId,
  getSessionDurationMs,
  markTurnStart,
  getDecisionDurationMs,
  markSelectionStart,
  incrementTurn,
  getTurnNumber
} from '@/analytics/session'

/**
 * @param {Object} [extra]
 * @return {Object}
 */
function envelope (extra = {}) {
  return {
    game_session_id: getSessionId(),
    ...extra
  }
}

/**
 * @param {Object} game
 * @return {{score_p0: number|null, score_p1: number|null}}
 */
function scores (game) {
  const list = game.scores || []
  return {
    score_p0: list[0] ?? null,
    score_p1: list[1] ?? null
  }
}

/**
 * Attacks use the same defended flag as hazards.
 * @param {Object} playInfo
 * @return {boolean|null}
 */
function defendedFromPlay (playInfo) {
  const type = playInfo.card?.type
  if (!type || !isAttack(type)) {
    return null
  }
  return !!playInfo.blockedBy
}

// --- Base Mode ----------------------------------------------------------------

/**
 * @param {Object} game
 */
export function startBaseSession (game) {
  const id = createSession('base')
  capture('session_started', envelope({
    ...scores(game)
  }))
  return id
}

/** Starts the decision timer for the active player (no separate event). */
export function markBaseTurnStart () {
  markTurnStart()
}

/**
 * @param {Object} game
 * @param {Object} playInfo
 */
export function trackBaseAction (game, playInfo) {
  const player = playInfo.player
  const card = playInfo.card
  const decisionDurationMs = getDecisionDurationMs()

  incrementTurn()

  capture('player_action', envelope({
    turn_number: getTurnNumber(),
    player_id: player?.id ?? null,
    player_name: player?.name ?? null,
    is_bot: player?.isAI ?? false,
    action_type: playInfo.type || null,
    card_type: card?.type || null,
    component_name: card?.componentName || null,
    target_player_id: playInfo.target?.id ?? null,
    defended: defendedFromPlay(playInfo),
    decision_duration_ms: decisionDurationMs,
    ...scores(game)
  }))
}

/**
 * Hazard draw (Bug / Disaster) — same defended pattern as attacks.
 * @param {Object} game
 * @param {Object} player - Player who drew the hazard.
 * @param {Object} hazard - `{ type, defended, penalty }`.
 */
export function trackHazard (game, player, hazard) {
  capture('hazard_drawn', envelope({
    player_id: player?.id ?? null,
    player_name: player?.name ?? null,
    is_bot: player?.isAI ?? false,
    card_type: hazard.type || null,
    defended: hazard.defended,
    ...scores(game)
  }))
}

/**
 * @param {Object} game
 * @param {string} [reason='completed']
 */
export function endBaseSession (game, reason = 'completed') {
  if (!getSessionId()) {
    return
  }

  const winners = typeof game.getWinners === 'function' ? game.getWinners() : []
  const winner = winners[0] || null

  capture('session_ended', envelope({
    end_reason: reason,
    session_duration_ms: getSessionDurationMs(),
    winner_id: winner?.id ?? null,
    winner_name: winner?.name ?? null,
    ...scores(game)
  }))

  clearSession()
  flushSupabaseEvents()
}

/**
 * @param {Object} game
 */
export function abandonBaseSession (game) {
  if (!getSessionId()) {
    return
  }

  capture('session_abandoned', envelope({
    end_reason: 'abandoned',
    session_duration_ms: getSessionDurationMs(),
    ...scores(game)
  }))
  clearSession()
  flushSupabaseEvents()
}

// --- Flow Mode (local session only; no Base-table writes) ---------------------

export function startFlowSession () {
  return createSession('flow')
}

/**
 * @param {Object} match - Flow match (unused until Flow logging lands).
 * @param {string} phase
 */
export function trackFlowPhase (match, phase) {
  void match
  if (phase === 'select') {
    markSelectionStart()
  }
}

export function trackFlowSelectionConfirmed () {}

export function trackFlowSimulationCompleted () {}

export function endFlowSession () {
  if (!getSessionId()) {
    return
  }
  clearSession()
}

export function abandonFlowSession () {
  if (!getSessionId()) {
    return
  }
  clearSession()
}
