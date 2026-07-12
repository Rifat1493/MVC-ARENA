/**
 * `FlowMatch` orchestrates a full Flow Mode match: forecast, one-time
 * draft+build, then a single round of serve, ending in a match result (with
 * bounded sudden death if tied).
 *
 * This class is the only stateful piece of the engine; every method it calls
 * out to (chain/threat resolution, scoring, bot strategy) is itself pure.
 * It has no DOM/Vue dependency - `FlowModePage.vue` holds an instance of it
 * in local component state and calls its methods in response to UI events.
 *
 * @module flow-mode/engine/matchManager
 */

import { PHASES, DRAFT_PICKS, ROUNDS_PER_MATCH, MAX_SUDDEN_DEATH_REQUESTS } from '@/flow-mode/engine/constants'
import { createRng, randomSeed } from '@/flow-mode/engine/rng'
import { createPlayerBoard, placeCard as placeCardOnBoard, applyDamage } from '@/flow-mode/engine/board'
import { generateDraftPool } from '@/flow-mode/engine/draftPool'
import { buildForecast } from '@/flow-mode/engine/forecast'
import { buildRoundRequestQueue, buildSuddenDeathRequest } from '@/flow-mode/engine/requestQueue'
import { resolveDataRequest } from '@/flow-mode/engine/chainResolution'
import { resolveThreatRequest } from '@/flow-mode/engine/threatResolution'
import { scoreRound, applyRoundScoreToMatch, determineMatchWinner, resolveSuddenDeathRequest } from '@/flow-mode/engine/scoring'
import { chooseBotDraftPick, autoPlaceBotCards } from '@/flow-mode/engine/botStrategy'

/**
 * Orchestrates a Flow Mode match between two players (`p1`, optionally
 * bot-controlled `p2`).
 */
class FlowMatch {
  /**
   * Creates a new match.
   * @param {Object} opts - Match setup options.
   * @param {string} opts.player1Name - Player 1's display name.
   * @param {bool} [opts.player2IsBot=false] - True if player 2 is bot-controlled.
   * @param {string} [opts.player2Name='Bot'] - Player 2's display name.
   * @param {int} [opts.seed] - The match's rng seed. Randomized if not given.
   */
  constructor ({ player1Name, player2IsBot = false, player2Name = 'Bot', seed } = {}) {
    this.seed = seed !== undefined ? seed : randomSeed()
    this.rng = createRng(this.seed)
    this.outcomeRngs = { p1: createRng(this.seed + 1), p2: createRng(this.seed + 2) }

    this.phase = PHASES.SETUP
    this.roundNumber = 1
    this.players = {
      p1: createPlayerBoard('p1', player1Name, false),
      p2: createPlayerBoard('p2', player2Name, player2IsBot)
    }
    this.currentRoundQueue = []
    this.forecast = null
    this.draftState = null
    this.serveState = null
    this.roundHistory = []
    this.suddenDeath = { active: false, requestsPlayed: 0, results: [] }
    this.matchResult = null
  }

  /**
   * Builds this round's shared request queue and forecast. Called at the
   * start of round 1 and again at the start of every subsequent round.
   */
  startForecast () {
    this.currentRoundQueue = buildRoundRequestQueue(this.rng, this.roundNumber)
    this.forecast = buildForecast(this.currentRoundQueue)
    this.phase = PHASES.FORECAST
  }

  /**
   * Begins the (once-per-match) draft. Bot players resolve all of their
   * picks immediately; the human player proceeds via {@link pickDraftCard}.
   */
  startDraft () {
    this.phase = PHASES.DRAFT
    this.draftState = {
      p1: { pickIndex: 0, options: [] },
      p2: { pickIndex: 0, options: [] }
    }
    this._dealNextDraftOptions('p1')
    this._dealNextDraftOptions('p2')
    if (this.players.p1.isBot) { this._runBotDraft('p1') }
    if (this.players.p2.isBot) { this._runBotDraft('p2') }
    this._maybeAdvancePastDraft()
  }

  /**
   * Records a human player's draft pick and deals their next 3-card offer,
   * or finishes their draft if it was their 5th pick.
   * @param {string} playerId - 'p1' | 'p2'.
   * @param {string} cardId - The id of the card being picked (must be one of
   * the currently offered options).
   * @return {{ok: bool, reason: (string|undefined)}} Whether the pick was valid.
   */
  pickDraftCard (playerId, cardId) {
    const state = this.draftState[playerId]
    if (!state || !state.options.some(c => c.id === cardId)) {
      return { ok: false, reason: 'That card is not currently offered.' }
    }

    this.players[playerId].drafted.push(cardId)
    state.pickIndex++
    if (state.pickIndex < DRAFT_PICKS) {
      this._dealNextDraftOptions(playerId)
    } else {
      state.options = []
    }

    this._maybeAdvancePastDraft()
    return { ok: true }
  }

  /**
   * Enters the build phase. Bots have already auto-placed their cards during
   * {@link startDraft}; the human player places theirs via {@link placeCard}.
   */
  startBuild () {
    this.phase = PHASES.BUILD
  }

  /**
   * Places a drafted card into a layer column on the given player's board.
   * @param {string} playerId - 'p1' | 'p2'.
   * @param {string} cardId - The card to place.
   * @param {string} layer - The layer to place it in.
   * @return {{ok: bool, reason: (string|undefined)}} Whether the placement succeeded.
   */
  placeCard (playerId, cardId, layer) {
    return placeCardOnBoard(this.players[playerId], cardId, layer)
  }

  /**
   * Enters the serve phase for the current round, resetting per-round serve
   * tracking.
   */
  startServe () {
    this.phase = PHASES.SERVE
    this.serveState = { currentIndex: 0, results: { p1: [], p2: [] } }
  }

  /**
   * Resolves the next request in the current round's queue against both
   * players' boards, applies any resulting damage, and updates live round
   * scores. Automatically finishes the round after the 5th request.
   * @return {{request: Object, resultP1: Object, resultP2: Object}} The
   * resolved request and each player's outcome.
   */
  resolveNextRequest () {
    const index = this.serveState.currentIndex
    const request = this.currentRoundQueue[index]

    const resultP1 = this._resolveForPlayer('p1', request)
    const resultP2 = this._resolveForPlayer('p2', request)

    this.serveState.results.p1.push(resultP1)
    this.serveState.results.p2.push(resultP2)
    this.serveState.currentIndex++

    this.players.p1.roundScore = scoreRound(this.players.p1, this.serveState.results.p1).roundScore
    this.players.p2.roundScore = scoreRound(this.players.p2, this.serveState.results.p2).roundScore

    if (this.serveState.currentIndex >= this.currentRoundQueue.length) {
      this._finishRound()
    }

    return { request, resultP1, resultP2 }
  }

  /**
   * True once the (only) round has been played.
   * @return {bool} True if there are no more rounds to play.
   */
  isMatchOver () {
    return this.roundNumber >= ROUNDS_PER_MATCH
  }

  /**
   * Determines (and caches) the match result, running a bounded sudden-death
   * loop if the match is tied after the regular rounds.
   * @return {{winnerId: (string|null), reason: string}} The match result.
   */
  getMatchResult () {
    if (this.matchResult) { return this.matchResult }

    let result = determineMatchWinner(this.players.p1, this.players.p2)
    let attempts = 0
    while (result.winnerId === null && attempts < MAX_SUDDEN_DEATH_REQUESTS) {
      this.suddenDeath.active = true
      const request = buildSuddenDeathRequest(this.rng, attempts)
      const outcome = resolveSuddenDeathRequest(
        this.players.p1, this.players.p2, request, this.outcomeRngs.p1, this.outcomeRngs.p2)
      this.suddenDeath.results.push(outcome)
      this.suddenDeath.requestsPlayed++
      attempts++
      if (outcome.decided) {
        result = { winnerId: outcome.winnerId, reason: 'suddenDeath' }
      }
    }
    if (result.winnerId === null) {
      result = { winnerId: null, reason: 'draw' }
    }

    this.matchResult = result
    this.phase = PHASES.MATCH_END
    return this.matchResult
  }

  // --- internal helpers -----------------------------------------------

  /** @private */
  _dealNextDraftOptions (playerId) {
    const state = this.draftState[playerId]
    if (state.pickIndex >= DRAFT_PICKS) {
      state.options = []
      return
    }
    state.options = generateDraftPool(this.rng, this.players[playerId].drafted)
  }

  /** @private */
  _runBotDraft (playerId) {
    const board = this.players[playerId]
    const state = this.draftState[playerId]
    while (state.pickIndex < DRAFT_PICKS) {
      const cardId = chooseBotDraftPick(this.rng, state.options, board, this.forecast)
      board.drafted.push(cardId)
      state.pickIndex++
      this._dealNextDraftOptions(playerId)
    }
    autoPlaceBotCards(board)
  }

  /** @private */
  _maybeAdvancePastDraft () {
    const p1Done = this.draftState.p1.pickIndex >= DRAFT_PICKS
    const p2Done = this.draftState.p2.pickIndex >= DRAFT_PICKS
    if (p1Done && p2Done) {
      this.startBuild()
    }
  }

  /** @private */
  _resolveForPlayer (playerId, request) {
    const board = this.players[playerId]
    if (request.kind === 'data') {
      return resolveDataRequest(board, request)
    }
    const result = resolveThreatRequest(board, request, this.outcomeRngs[playerId])
    if (result.damagedCardId) {
      applyDamage(board, request.targetLayer, result.damagedCardId)
    }
    return result
  }

  /** @private */
  _finishRound () {
    const scoreP1 = scoreRound(this.players.p1, this.serveState.results.p1)
    const scoreP2 = scoreRound(this.players.p2, this.serveState.results.p2)
    applyRoundScoreToMatch(this.players.p1, scoreP1)
    applyRoundScoreToMatch(this.players.p2, scoreP2)

    this.roundHistory.push({ roundNumber: this.roundNumber, p1: scoreP1, p2: scoreP2 })
    this.phase = PHASES.ROUND_SUMMARY
  }
}

export default FlowMatch
