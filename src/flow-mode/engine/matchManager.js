/**
 * `FlowMatch` orchestrates a full Flow Mode match: four use-case iterations
 * where players build and improve an MVC system, then simulate request /
 * response fulfilment against each use case's required cards.
 *
 * This class is the only stateful piece of the engine; helpers it calls are
 * pure. It has no DOM/Vue dependency — `FlowModePage.vue` holds an instance
 * and calls methods in response to UI events.
 *
 * @module flow-mode/engine/matchManager
 */

import {
  PHASES,
  ITERATIONS_PER_MATCH,
  INITIAL_CARD_TOTAL,
  UPGRADE_CARDS_PER_TURN
} from '@/flow-mode/engine/constants'
import { createRng, randomSeed } from '@/flow-mode/engine/rng'
import { createPlayerBoard, placeCard as placeCardOnBoard, placeAllUnplacedCards } from '@/flow-mode/engine/board'
import { buildUseCaseSchedule } from '@/flow-mode/engine/useCaseSchedule'
import { resolveUseCase } from '@/flow-mode/engine/useCaseResolution'
import { scoreIteration, applyIterationScoreToMatch, determineMatchWinner } from '@/flow-mode/engine/scoring'
import {
  chooseBotInitialSelection,
  chooseBotUpgradeSelection,
  autoPlaceBotCards
} from '@/flow-mode/engine/botStrategy'
import {
  validateInitialSelection,
  validateUpgradeSelection
} from '@/flow-mode/engine/selection'
import {
  trackFlowPhase,
  trackFlowSelectionConfirmed,
  trackFlowSimulationCompleted,
  endFlowSession
} from '@/analytics/gameAnalytics'

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

    this.phase = PHASES.SETUP
    this.iterationNumber = 1
    this.useCaseSchedule = buildUseCaseSchedule(this.rng)
    this.currentUseCase = null

    this.players = {
      p1: createPlayerBoard('p1', player1Name, false),
      p2: createPlayerBoard('p2', player2Name, player2IsBot)
    }

    this.selectionState = null
    this.simulateState = null
    this.iterationHistory = []
    this.matchResult = null
  }

  /**
   * Reveals the current iteration's use case and enters the useCase phase.
   */
  startUseCasePhase () {
    this.currentUseCase = this.useCaseSchedule[this.iterationNumber - 1]
    this.phase = PHASES.USE_CASE
    trackFlowPhase(this, PHASES.USE_CASE)
  }

  /**
   * Begins card selection for the current iteration.
   * Iteration 1 = initial 2/2/1. Iterations 2–4 = upgrade (+2).
   * Bots resolve immediately.
   */
  startSelect () {
    const mode = this.iterationNumber === 1 ? 'initial' : 'upgrade'
    this.phase = PHASES.SELECT
    this.selectionState = {
      mode,
      requiredCount: mode === 'initial' ? INITIAL_CARD_TOTAL : UPGRADE_CARDS_PER_TURN,
      p1: { selected: [], confirmed: false },
      p2: { selected: [], confirmed: false }
    }

    trackFlowPhase(this, PHASES.SELECT)

    if (this.players.p1.isBot) { this._runBotSelect('p1') }
    if (this.players.p2.isBot) { this._runBotSelect('p2') }
    this._maybeAdvancePastSelect()
  }

  /**
   * Toggles a card in the active human player's pending selection.
   * @param {string} playerId - 'p1' | 'p2'.
   * @param {string} cardId - Card to toggle.
   * @return {{ok: bool, reason: (string|undefined)}} Whether the toggle applied.
   */
  toggleSelectCard (playerId, cardId) {
    if (this.phase !== PHASES.SELECT) {
      return { ok: false, reason: 'Not in selection phase.' }
    }
    const state = this.selectionState[playerId]
    if (!state || state.confirmed) {
      return { ok: false, reason: 'Selection already confirmed.' }
    }
    if (this.players[playerId].isBot) {
      return { ok: false, reason: 'Bot selections are automatic.' }
    }

    const index = state.selected.indexOf(cardId)
    if (index >= 0) {
      state.selected.splice(index, 1)
      return { ok: true }
    }

    if (this.selectionState.mode === 'upgrade') {
      if (this.players[playerId].drafted.includes(cardId)) {
        return { ok: false, reason: 'That card is already in your system.' }
      }
    }

    if (state.selected.length >= this.selectionState.requiredCount) {
      return {
        ok: false,
        reason: `You can only select ${this.selectionState.requiredCount} cards right now.`
      }
    }

    state.selected.push(cardId)
    return { ok: true }
  }

  /**
   * Confirms the player's current selection if it meets the quotas.
   * @param {string} playerId - 'p1' | 'p2'.
   * @return {{ok: bool, reason: (string|undefined)}} Whether confirm succeeded.
   */
  confirmSelection (playerId) {
    if (this.phase !== PHASES.SELECT) {
      return { ok: false, reason: 'Not in selection phase.' }
    }
    const state = this.selectionState[playerId]
    if (!state || state.confirmed) {
      return { ok: false, reason: 'Nothing to confirm.' }
    }

    const board = this.players[playerId]
    const validation = this.selectionState.mode === 'initial'
      ? validateInitialSelection(state.selected)
      : validateUpgradeSelection(state.selected, board.drafted)

    if (!validation.ok) { return validation }

    for (const cardId of state.selected) {
      board.drafted.push(cardId)
    }
    state.confirmed = true
    trackFlowSelectionConfirmed(this, playerId)
    this._maybeAdvancePastSelect()
    return { ok: true }
  }

  /**
   * Enters the build/review phase and auto-places every selected card into its
   * native MVC layer (no manual dragging — layer membership is fixed per card).
   */
  startBuild () {
    this.phase = PHASES.BUILD
    trackFlowPhase(this, PHASES.BUILD)
    for (const playerId of ['p1', 'p2']) {
      autoPlaceBotCards(this.players[playerId])
    }
  }

  /**
   * Places a selected card into a layer column.
   * @param {string} playerId - 'p1' | 'p2'.
   * @param {string} cardId - Card to place.
   * @param {string} layer - Target layer.
   * @return {{ok: bool, reason: (string|undefined)}} Placement result.
   */
  placeCard (playerId, cardId, layer) {
    return placeCardOnBoard(this.players[playerId], cardId, layer)
  }

  /**
   * Auto-places any remaining unplaced cards for a human who is ready.
   * @param {string} playerId - 'p1' | 'p2'.
   */
  autoPlaceRemaining (playerId) {
    placeAllUnplacedCards(this.players[playerId])
  }

  /**
   * True when every drafted card for the player is on the board.
   * @param {string} playerId - 'p1' | 'p2'.
   * @return {bool} Whether the board is fully built.
   */
  isBoardComplete (playerId) {
    const board = this.players[playerId]
    const placed = new Set(
      ['controller', 'model', 'view'].flatMap(l => board.layers[l].map(s => s.cardId)))
    return board.drafted.every(id => placed.has(id))
  }

  /**
   * True when both players have fully placed their selected cards.
   * @return {bool} Whether serve/simulate may begin.
   */
  bothBoardsComplete () {
    return this.isBoardComplete('p1') && this.isBoardComplete('p2')
  }

  /**
   * Resolves the current use case for both players and records scores.
   * @return {{useCase: UseCase, resultP1: Object, resultP2: Object}} Simulation payload.
   */
  runSimulation () {
    this.phase = PHASES.SIMULATE
    trackFlowPhase(this, PHASES.SIMULATE)
    const resultP1 = resolveUseCase(this.players.p1, this.currentUseCase)
    const resultP2 = resolveUseCase(this.players.p2, this.currentUseCase)

    this.simulateState = { resultP1, resultP2, scored: false }

    return { useCase: this.currentUseCase, resultP1, resultP2 }
  }

  /**
   * Applies iteration scores and moves to the iteration summary phase.
   * Safe to call once after the simulation animation finishes.
   */
  finishIteration () {
    if (!this.simulateState || this.simulateState.scored) { return }

    const scoreP1 = scoreIteration(this.simulateState.resultP1)
    const scoreP2 = scoreIteration(this.simulateState.resultP2)
    applyIterationScoreToMatch(this.players.p1, scoreP1)
    applyIterationScoreToMatch(this.players.p2, scoreP2)

    this.iterationHistory.push({
      iterationNumber: this.iterationNumber,
      useCaseId: this.currentUseCase.id,
      useCaseTitle: this.currentUseCase.title,
      p1: { ...scoreP1, result: this.simulateState.resultP1 },
      p2: { ...scoreP2, result: this.simulateState.resultP2 }
    })

    this.simulateState.scored = true
    this.phase = PHASES.ITERATION_SUMMARY
    trackFlowSimulationCompleted(this, {
      resultP1: this.simulateState.resultP1,
      resultP2: this.simulateState.resultP2
    })
    trackFlowPhase(this, PHASES.ITERATION_SUMMARY)
  }

  /**
   * Continues from the iteration summary: reveal the next use case first
   * (players upgrade only after acknowledging it), or end the match.
   */
  continueAfterSummary () {
    if (this.iterationNumber >= ITERATIONS_PER_MATCH) {
      this.getMatchResult()
      return
    }
    this.iterationNumber++
    this.simulateState = null
    this.selectionState = null
    this.startUseCasePhase()
  }

  /**
   * True once all four iterations have been played.
   * @return {bool} Whether the match has no more iterations.
   */
  isMatchOver () {
    return this.iterationNumber >= ITERATIONS_PER_MATCH &&
      this.phase === PHASES.ITERATION_SUMMARY &&
      this.iterationHistory.length >= ITERATIONS_PER_MATCH
  }

  /**
   * Determines (and caches) the match result.
   * @return {{winnerId: (string|null), reason: string}} The match result.
   */
  getMatchResult () {
    if (this.matchResult) { return this.matchResult }
    this.matchResult = determineMatchWinner(this.players.p1, this.players.p2)
    this.phase = PHASES.MATCH_END
    trackFlowPhase(this, PHASES.MATCH_END)
    endFlowSession(this)
    return this.matchResult
  }

  // --- internal helpers -----------------------------------------------

  /** @private */
  _runBotSelect (playerId) {
    const board = this.players[playerId]
    const state = this.selectionState[playerId]
    const picks = this.selectionState.mode === 'initial'
      ? chooseBotInitialSelection(this.rng, board, this.currentUseCase)
      : chooseBotUpgradeSelection(this.rng, board, this.currentUseCase)

    state.selected = picks.slice()
    for (const cardId of picks) {
      board.drafted.push(cardId)
    }
    state.confirmed = true
  }

  /** @private */
  _maybeAdvancePastSelect () {
    if (!this.selectionState) { return }
    if (this.selectionState.p1.confirmed && this.selectionState.p2.confirmed) {
      this.startBuild()
    }
  }
}

export default FlowMatch
