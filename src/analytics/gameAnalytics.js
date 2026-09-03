/**
 * Playtest-oriented game telemetry for MVC-ARENA (Base + Flow).
 *
 * Base sessions emit a lean multi-row stream:
 *   session_started → player_action* → session_ended | session_abandoned
 *
 * Each `player_action` carries the card played and `decision_duration_ms`.
 *
 * @module analytics/gameAnalytics
 */

import { capture } from '@/analytics/capture'
import { flushSupabaseEvents } from '@/analytics/supabaseLogger'
import { isPlaytest } from '@/analytics/playtest'
import {
  createSession,
  clearSession,
  getSessionId,
  getSessionDurationMs,
  markTurnStart,
  getDecisionDurationMs,
  markSelectionStart,
  getSelectionDurationMs,
  incrementTurn,
  getTurnNumber
} from '@/analytics/session'

/**
 * Shared envelope on every event.
 * @param {Object} [extra]
 * @return {Object}
 */
function envelope (extra = {}) {
  return {
    game_session_id: getSessionId(),
    is_playtest: isPlaytest(),
    ...extra
  }
}

/**
 * @param {Object} game
 * @return {Object}
 */
function baseScoreSnapshot (game) {
  return {
    scores: game.scores.slice(),
    score_limit: game.scoreLimit,
    turn_count: game.turnHistory.length
  }
}

/**
 * @param {Object} playInfo
 * @return {Object}
 */
function playInfoProps (playInfo) {
  const card = playInfo.card
  return {
    action_type: playInfo.type,
    card_type: card?.type || null,
    component_name: card?.componentName || null,
    target_player_id: playInfo.target?.id ?? null,
    target_type: playInfo.targetType || null,
    lane_index: playInfo.laneIndex ?? playInfo.playField?.laneIndex ?? null
  }
}

/**
 * @param {Object[]} players
 * @return {Object}
 */
function opponentProps (players) {
  const humanCount = players.filter(p => !p.isAI).length
  const botCount = players.filter(p => p.isAI).length
  return {
    player_count: players.length,
    human_count: humanCount,
    bot_count: botCount,
    opponent_type: botCount > 0 ? 'bot' : 'human',
    player_names: players.map(p => p.name)
  }
}

// --- Base Mode ----------------------------------------------------------------

/**
 * @param {Object} game
 * @param {Object} level
 * @param {Object[]} players
 */
export function startBaseSession (game, level, players) {
  const id = createSession('base')
  capture('session_started', envelope({
    mode: 'base',
    level_id: level?.id || null,
    level_name: level?.name || null,
    ...opponentProps(players),
    ...baseScoreSnapshot(game)
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
  const decisionDurationMs = getDecisionDurationMs()

  incrementTurn()

  capture('player_action', envelope({
    mode: 'base',
    turn_number: getTurnNumber(),
    player_id: player?.id ?? null,
    player_name: player?.name ?? null,
    is_bot: player?.isAI ?? false,
    decision_duration_ms: decisionDurationMs,
    ...playInfoProps(playInfo),
    ...baseScoreSnapshot(game)
  }))
}

/**
 * @param {Object} game
 * @param {Object} hazard
 */
export function trackHazard (game, hazard) {
  capture('hazard_drawn', envelope({
    mode: 'base',
    hazard_type: hazard.type,
    defended: hazard.defended,
    penalty: hazard.penalty,
    ...baseScoreSnapshot(game)
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

  capture('session_ended', envelope({
    mode: 'base',
    end_reason: reason,
    session_duration_ms: getSessionDurationMs(),
    winner_ids: winners.map(w => w.id),
    winner_names: winners.map(w => w.name),
    ...baseScoreSnapshot(game)
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
    mode: 'base',
    end_reason: 'abandoned',
    session_duration_ms: getSessionDurationMs(),
    ...baseScoreSnapshot(game)
  }))
  clearSession()
  flushSupabaseEvents()
}

// --- Flow Mode ----------------------------------------------------------------

/**
 * @param {Object} match
 */
export function startFlowSession (match) {
  const id = createSession('flow')
  capture('session_started', envelope({
    mode: 'flow',
    seed: match.seed,
    player1_name: match.players.p1.displayName,
    player2_name: match.players.p2.displayName,
    player2_is_bot: match.players.p2.isBot,
    opponent_type: match.players.p2.isBot ? 'bot' : 'human',
    use_case_schedule: match.useCaseSchedule.map(u => u.id)
  }))
  trackFlowPhase(match, 'setup')
  return id
}

/**
 * @param {Object} match
 * @param {string} phase
 */
export function trackFlowPhase (match, phase) {
  if (phase === 'select') {
    markSelectionStart()
  }

  capture('phase_changed', envelope({
    mode: 'flow',
    phase,
    iteration_number: match.iterationNumber,
    use_case_id: match.currentUseCase?.id || null,
    use_case_title: match.currentUseCase?.title || null
  }))
}

/**
 * @param {Object} match
 * @param {string} playerId
 */
export function trackFlowSelectionConfirmed (match, playerId) {
  const board = match.players[playerId]
  const state = match.selectionState?.[playerId]
  if (!board || board.isBot) {
    return
  }

  capture('selection_confirmed', envelope({
    mode: 'flow',
    iteration_number: match.iterationNumber,
    selection_mode: match.selectionState?.mode || null,
    player_id: playerId,
    player_name: board.displayName,
    selected_card_ids: state?.selected?.slice() || [],
    selected_count: state?.selected?.length || 0,
    decision_duration_ms: getSelectionDurationMs(),
    use_case_id: match.currentUseCase?.id || null
  }))
}

/**
 * @param {Object} match
 * @param {Object} simulation
 */
export function trackFlowSimulationCompleted (match, simulation) {
  const { resultP1, resultP2 } = simulation

  capture('simulation_completed', envelope({
    mode: 'flow',
    iteration_number: match.iterationNumber,
    use_case_id: match.currentUseCase?.id || null,
    p1_outcome: resultP1?.outcome || null,
    p2_outcome: resultP2?.outcome || null,
    p1_fulfilled_requirements: resultP1?.fulfilledRequirements ?? null,
    p2_fulfilled_requirements: resultP2?.fulfilledRequirements ?? null,
    p1_missing_card_id: resultP1?.missingCardId || null,
    p2_missing_card_id: resultP2?.missingCardId || null,
    p1_match_score: match.players.p1.matchScore,
    p2_match_score: match.players.p2.matchScore
  }))
}

/**
 * @param {Object} match
 */
export function endFlowSession (match) {
  if (!getSessionId()) {
    return
  }

  const result = match.matchResult

  capture('session_ended', envelope({
    mode: 'flow',
    end_reason: 'completed',
    session_duration_ms: getSessionDurationMs(),
    winner_id: result?.winnerId || null,
    winner_reason: result?.reason || null,
    p1_match_score: match.players.p1.matchScore,
    p2_match_score: match.players.p2.matchScore,
    p1_requirements_fulfilled: match.players.p1.requirementsFulfilled,
    p2_requirements_fulfilled: match.players.p2.requirementsFulfilled,
    iterations_completed: match.iterationHistory.length
  }))

  clearSession()
  flushSupabaseEvents()
}

/**
 * @param {Object} match
 */
export function abandonFlowSession (match) {
  if (!getSessionId()) {
    return
  }

  capture('session_abandoned', envelope({
    mode: 'flow',
    end_reason: 'abandoned',
    session_duration_ms: getSessionDurationMs(),
    phase: match.phase,
    iteration_number: match.iterationNumber,
    p1_match_score: match.players?.p1?.matchScore ?? null,
    p2_match_score: match.players?.p2?.matchScore ?? null
  }))
  clearSession()
  flushSupabaseEvents()
}
