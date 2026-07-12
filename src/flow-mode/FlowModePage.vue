<template>
  <div id="flow-mode-page">
    <div class="flow-mode-topbar">
      <span class="flow-mode-title">Flow Mode</span>
      <label
        v-if="match"
        class="flow-mode-skip"
      >
        <input
          v-model="skipAnimation"
          type="checkbox"
        >
        Skip to result
      </label>
      <button
        class="btn btn-info btn-sm"
        @click="exitToHome"
      >
        Exit to Home
      </button>
    </div>

    <flow-setup
      v-if="!match"
      @start="onStart"
    />

    <template v-else>
      <forecast-banner
        v-if="match.phase === 'forecast'"
        :forecast="match.forecast"
        :round-number="match.roundNumber"
        @continue="onForecastContinue"
      />

      <div
        v-else-if="match.phase === 'draft'"
        class="flow-mode-split"
      >
        <div
          v-for="playerId in ['p1', 'p2']"
          :key="playerId"
        >
          <draft-picker
            v-if="playerId === activeDraftPlayerId"
            :player-name="match.players[playerId].displayName"
            :options="match.draftState[playerId].options"
            :pick-number="Math.min(match.draftState[playerId].pickIndex + 1, draftPicks)"
            :picks-remaining="draftPicks - match.draftState[playerId].pickIndex"
            :already-drafted="resolvedCards(match.players[playerId].drafted)"
            @pick="cardId => match.pickDraftCard(playerId, cardId)"
          />
          <div
            v-else
            class="flow-mode-hidden-panel"
          >
            <p class="flow-mode-hidden-title">
              {{ match.players[playerId].displayName }}
            </p>
            <p class="flow-mode-hidden-note">
              {{ hiddenDraftMessage(playerId) }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-else-if="match.phase === 'build'"
        class="flow-mode-build"
      >
        <div class="flow-mode-split">
          <div
            v-for="playerId in ['p1', 'p2']"
            :key="playerId"
          >
            <div
              v-if="!match.players[playerId].isBot"
              class="flow-mode-hand"
            >
              <span
                v-if="unplacedCards(playerId).length"
                class="flow-mode-hand-label"
              >Drag your cards onto the matching lane below:</span>
              <span
                v-else
                class="flow-mode-hand-label"
              >All cards placed.</span>
              <div class="flow-mode-hand-cards">
                <card-chip
                  v-for="card in unplacedCards(playerId)"
                  :key="card.id"
                  :card="card"
                  :draggable="true"
                  size="sm"
                />
              </div>
            </div>
            <layer-board
              :player-name="match.players[playerId].displayName + (match.players[playerId].isBot ? ' (Bot)' : '')"
              :layers="resolvedLayers(playerId)"
              :interactive="!match.players[playerId].isBot"
              @drop-card="payload => onDropCard(playerId, payload)"
            />
          </div>
        </div>
        <button
          class="btn btn-success flow-mode-continue"
          @click="startServePhase"
        >
          Continue to Serve
        </button>
      </div>

      <template v-else-if="match.phase === 'serve' || (match.phase === 'roundSummary' && showServeAnimation)">
        <div
          v-if="currentRequestData"
          class="flow-mode-request-banner"
          :class="{ 'flow-mode-request-banner-threat': currentRequestData.request.kind === 'threat' }"
        >
          {{ currentRequestSummary }}
        </div>
        <div class="flow-mode-split">
          <div
            v-for="playerId in ['p1', 'p2']"
            :key="playerId"
          >
            <h4 class="flow-mode-player-label">
              {{ match.players[playerId].displayName }}
            </h4>
            <request-pipeline
              v-if="currentRequestData"
              :request="currentRequestData.request"
              :result="playerId === 'p1' ? currentRequestData.resultP1 : currentRequestData.resultP2"
              :stop-index="pipelineStopIndex"
            />
          </div>
        </div>
        <score-board
          :players="scoreBoardPlayers"
          :round-number="match.roundNumber"
          :total-rounds="totalRounds"
        />
        <button
          class="btn btn-success flow-mode-continue"
          @click="onServeButtonClick"
        >
          {{ serveButtonLabel }}
        </button>

        <div class="flow-mode-split flow-mode-serve-boards">
          <div
            v-for="playerId in ['p1', 'p2']"
            :key="playerId"
          >
            <layer-board
              :player-name="match.players[playerId].displayName + (match.players[playerId].isBot ? ' (Bot)' : '')"
              :layers="resolvedLayers(playerId)"
              :interactive="false"
            />
          </div>
        </div>
      </template>

      <round-summary
        v-else-if="match.phase === 'roundSummary'"
        :round-number="match.roundNumber"
        :round-result="lastRoundResult"
        :cumulative-scores="scoreBoardPlayers.map(p => ({ playerId: p.playerId, displayName: p.displayName, matchScore: p.matchScore }))"
        next-label="See Result"
        @continue="onRoundSummaryContinue"
      />

      <match-end-modal
        :match-result="match.matchResult || { winnerId: null, reason: 'draw' }"
        :players="matchEndPlayers"
        :showing="match.phase === 'matchEnd'"
        @rematch="onRematch"
        @exit="exitToHome"
      />
    </template>
  </div>
</template>

<script>
import FlowMatch from '@/flow-mode/engine/matchManager'
import { DRAFT_PICKS, ROUNDS_PER_MATCH } from '@/flow-mode/engine/constants'
import { computeStops, computeHaltIndex } from '@/flow-mode/engine/pipelineStops'
import { cardById } from '@/flow-mode/data/cards'
import { takePendingSetup } from '@/flow-mode/pendingSetup'

import FlowSetup from '@/flow-mode/components/FlowSetup'
import ForecastBanner from '@/flow-mode/components/ForecastBanner'
import DraftPicker from '@/flow-mode/components/DraftPicker'
import LayerBoard from '@/flow-mode/components/LayerBoard'
import CardChip from '@/flow-mode/components/CardChip'
import RequestPipeline from '@/flow-mode/components/RequestPipeline'
import ScoreBoard from '@/flow-mode/components/ScoreBoard'
import RoundSummary from '@/flow-mode/components/RoundSummary'
import MatchEndModal from '@/flow-mode/components/MatchEndModal'

/**
 * Flow Mode's router-mounted entry point. Owns the {@link FlowMatch} instance
 * and every phase's transition logic locally (no Vuex), rendering whichever
 * child components match the match's current phase and forwarding their
 * events into `FlowMatch` method calls.
 *
 * @vue-data {FlowMatch|null} match - The active match, or null before setup.
 * @vue-data {bool} skipAnimation - When true, each new request jumps straight
 * to its final outcome instead of starting from the first pipeline stop.
 * @vue-data {int} pipelineStopIndex - How far the player has manually
 * advanced the current request's pipeline (via the "Next Step" button),
 * shared by both players' `RequestPipeline`s.
 */
export default {
  name: 'FlowModePage',
  components: {
    'flow-setup': FlowSetup,
    'forecast-banner': ForecastBanner,
    'draft-picker': DraftPicker,
    'layer-board': LayerBoard,
    'card-chip': CardChip,
    'request-pipeline': RequestPipeline,
    'score-board': ScoreBoard,
    'round-summary': RoundSummary,
    'match-end-modal': MatchEndModal
  },
  data () {
    return {
      match: null,
      skipAnimation: false,
      currentRequestData: null,
      pipelineStopIndex: 0,
      draftPicks: DRAFT_PICKS,
      totalRounds: ROUNDS_PER_MATCH
    }
  },
  computed: {
    /**
     * True while there is a request on screen to show the Serve UI for
     * (keeps it showing for the round's final request even after the engine
     * has already advanced `match.phase` to 'roundSummary', until the player
     * clicks past it).
     */
    showServeAnimation () {
      return this.currentRequestData !== null
    },
    /**
     * The furthest stop either player's pipeline can reach for the current
     * request - once `pipelineStopIndex` reaches this, both pipelines have
     * shown their full outcome and the player can move on.
     */
    pipelineMaxHaltIndex () {
      if (!this.currentRequestData) { return 0 }
      const { request, resultP1, resultP2 } = this.currentRequestData
      const haltP1 = computeHaltIndex(computeStops(request, resultP1), request, resultP1)
      const haltP2 = computeHaltIndex(computeStops(request, resultP2), request, resultP2)
      return Math.max(haltP1, haltP2)
    },
    /** Label for the button under the pipelines, reflecting what the next click will do. */
    serveButtonLabel () {
      if (this.pipelineStopIndex < this.pipelineMaxHaltIndex) { return 'Next Step ▶' }
      return this.match.phase === 'serve' ? 'Next Request ▶' : 'Continue'
    },
    /**
     * A plain-language description of what's currently traveling the
     * pipeline, so a player can relate the abstract Request/Controller/
     * Model/View animation to a concrete thing: which route/domain/output a
     * data request needs, or which threat is attacking which layer.
     */
    currentRequestSummary () {
      if (!this.currentRequestData) { return '' }
      const { request } = this.currentRequestData
      if (request.kind === 'data') {
        return `Data Request needs: ${request.route} → ${request.dataDomain} → ${request.outputType}`
      }
      const layerLabels = { controller: 'Controller', model: 'Model', view: 'View' }
      const threatLabels = { SQL_INJECTION: 'SQL Injection', XSS: 'XSS', SESSION_FORGERY: 'Session Forgery' }
      const threatLabel = threatLabels[request.threatType] || request.threatType
      return `⚠ Threat: ${threatLabel} attacking the ${layerLabels[request.targetLayer]} layer`
    },
    scoreBoardPlayers () {
      return ['p1', 'p2'].map(playerId => {
        const board = this.match.players[playerId]
        return {
          playerId,
          displayName: board.displayName,
          roundScore: board.roundScore,
          matchScore: board.matchScore,
          penetrations: board.penetrations
        }
      })
    },
    lastRoundResult () {
      const entry = this.match.roundHistory[this.match.roundHistory.length - 1]
      return entry ? { p1: entry.p1, p2: entry.p2 } : { p1: {}, p2: {} }
    },
    matchEndPlayers () {
      return ['p1', 'p2'].map(playerId => (
        { playerId, displayName: this.match.players[playerId].displayName }
      ))
    },
    /**
     * Which human player's draft picker is currently shown. Human players
     * draft one at a time (p1 first) so an opponent's picks are never on
     * screen while you're still making your own - they only become visible
     * once you've finished drafting too (in the Build phase). Bots resolve
     * their whole draft instantly during `startDraft()`, so they're never
     * "active" here; a bot-vs-human match always shows the human alone.
     * @return {string|null} 'p1' | 'p2', or null if both have finished
     * (a brief transitional state right before the phase moves to 'build').
     */
    activeDraftPlayerId () {
      if (!this.match.draftState) { return null }
      for (const playerId of ['p1', 'p2']) {
        const board = this.match.players[playerId]
        const state = this.match.draftState[playerId]
        if (!board.isBot && state.pickIndex < this.draftPicks) {
          return playerId
        }
      }
      return null
    }
  },
  created () {
    // Reuses the players already set up on the Home page (see Home.vue's
    // playFlow()) instead of asking again: Home hands them off via
    // setPendingSetup() rather than the route (so the URL stays a plain
    // /flow) since Flow Mode intentionally keeps its match state out of
    // Vuex. Falls back to the FlowSetup form for direct navigation (e.g. a
    // bookmarked/refreshed /flow URL) where there's no pending setup to read.
    const setup = takePendingSetup()
    if (setup) {
      this.onStart(setup)
    }
  },
  methods: {
    /**
     * Starts a new match from the FlowSetup form.
     * @param {Object} setup - `{ player1Name, player2IsBot, player2Name }`.
     */
    onStart (setup) {
      this.match = new FlowMatch(setup)
      this.match.startForecast()
    },
    /**
     * Resolves a card id list into full card definitions (for template display).
     * @param {string[]} cardIds - The ids to resolve.
     * @return {FlowCard[]} The resolved cards.
     */
    resolvedCards (cardIds) {
      return cardIds.map(cardById)
    },
    /**
     * The placeholder message shown in place of a player's draft panel while
     * they're not the active drafter (see {@link activeDraftPlayerId}).
     * @param {string} playerId - 'p1' | 'p2'.
     * @return {string} The message to display.
     */
    hiddenDraftMessage (playerId) {
      const board = this.match.players[playerId]
      if (board.isBot) { return 'Drafted automatically - hidden until the build phase.' }
      if (board.drafted.length >= this.draftPicks) {
        return 'Drafting complete - hidden until you finish your own picks.'
      }
      return 'Waiting for their turn to draft.'
    },
    /**
     * Returns a player's drafted cards that have not yet been placed onto
     * their board, so the Build phase can show them as a draggable hand.
     * Without this, a human player who just finished drafting has nothing
     * visible to drag - their board looks empty next to a bot's, which
     * auto-places its cards immediately during Draft.
     * @param {string} playerId - 'p1' | 'p2'.
     * @return {FlowCard[]} The unplaced drafted cards.
     */
    unplacedCards (playerId) {
      const board = this.match.players[playerId]
      const placedIds = new Set(
        ['controller', 'model', 'view'].flatMap(layer => board.layers[layer].map(slot => slot.cardId)))
      return board.drafted.filter(id => !placedIds.has(id)).map(cardById)
    },
    /**
     * Resolves a player's raw board layers (card ids + disabled flags) into
     * full card definitions for LayerBoard.
     * @param {string} playerId - 'p1' | 'p2'.
     * @return {Object} `{ controller: [{card, disabled}], model: [...], view: [...] }`.
     */
    resolvedLayers (playerId) {
      const layers = this.match.players[playerId].layers
      const resolve = slots => slots.map(slot => ({ card: cardById(slot.cardId), disabled: slot.disabled }))
      return { controller: resolve(layers.controller), model: resolve(layers.model), view: resolve(layers.view) }
    },
    /**
     * Handles the forecast banner's continue: moves into the (once-per-match) draft.
     */
    onForecastContinue () {
      this.match.startDraft()
    },
    /**
     * Handles a card being dropped onto a layer column during Build.
     * @param {string} playerId - 'p1' | 'p2'.
     * @param {{cardId: string, layer: string}} payload - The dropped card and target layer.
     */
    onDropCard (playerId, { cardId, layer }) {
      this.match.placeCard(playerId, cardId, layer)
    },
    /**
     * Enters the serve phase and resolves the first request.
     */
    startServePhase () {
      this.match.startServe()
      this.advanceServe()
    },
    /**
     * Resolves the next queued request and resets the pipeline step so both
     * players' pipelines start from Request again - or, if "Skip to result"
     * is on, jumps straight to each pipeline's final outcome.
     */
    advanceServe () {
      this.currentRequestData = this.match.resolveNextRequest()
      this.pipelineStopIndex = this.skipAnimation ? this.pipelineMaxHaltIndex : 0
    },
    /**
     * Handles a click on the button under the pipelines. While the current
     * request hasn't fully played out, advances one stop. Once both
     * pipelines have reached their outcome, either resolves the next request
     * (mid-round) or closes out the Serve view so the round summary shows
     * (end of round).
     */
    onServeButtonClick () {
      if (this.pipelineStopIndex < this.pipelineMaxHaltIndex) {
        this.pipelineStopIndex++
        return
      }
      if (this.match.phase === 'serve') {
        this.advanceServe()
      } else {
        this.currentRequestData = null
      }
    },
    /**
     * Handles the round summary's continue: finalizes the (single-round) match.
     */
    onRoundSummaryContinue () {
      this.match.getMatchResult()
    },
    /**
     * Resets back to the setup screen for a rematch.
     */
    onRematch () {
      this.match = null
      this.currentRequestData = null
      this.pipelineStopIndex = 0
    },
    /**
     * Leaves Flow Mode and returns to the Home page.
     */
    exitToHome () {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
#flow-mode-page {
  min-height: 100vh;
  background-color: #333333;
  color: #fff;
  padding-bottom: 2rem;
}

.flow-mode-topbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 0.6rem 1rem;
  border-bottom: 2px solid #555;
}

.flow-mode-title {
  margin-right: auto;
  font-size: 1.2rem;
  font-weight: 700;
}

.flow-mode-skip {
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.flow-mode-split {
  display: flex;
  gap: 2rem;
  justify-content: center;
  padding: 1.5rem 2rem;
  flex-wrap: wrap;
  max-width: 100rem;
  margin: 0 auto;
}

.flow-mode-split > div {
  flex: 1;
  min-width: 28rem;
  max-width: 48rem;
}

.flow-mode-player-label {
  text-align: center;
}

.flow-mode-request-banner {
  max-width: 42rem;
  margin: 0.5rem auto 0;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  background: #1f3a5f;
  border: 2px solid #6fa8ff;
  color: #fff;
  font-weight: 700;
  text-align: center;
}

.flow-mode-request-banner-threat {
  background: #4a1414;
  border-color: #ff2d2d;
  color: #ffb3b3;
}

.flow-mode-build {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flow-mode-continue {
  margin: 0.5rem 0 1rem;
}

.flow-mode-hand {
  background: #222222;
  border: solid white 0.15rem;
  border-radius: 0.5rem;
  padding: 0.8rem;
  margin-bottom: 0.8rem;
  text-align: center;
}

.flow-mode-hand-label {
  display: block;
  font-size: 0.85rem;
  color: #ffc46b;
  margin-bottom: 0.6rem;
}

.flow-mode-hand-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
}

.flow-mode-serve-boards {
  padding-top: 0;
}

.flow-mode-hidden-panel {
  background: #222222;
  border: dashed #777 0.15rem;
  border-radius: 0.5rem;
  padding: 2rem 1rem;
  text-align: center;
  min-height: 12rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.flow-mode-hidden-title {
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.flow-mode-hidden-note {
  font-size: 0.85rem;
  color: #bbbbbb;
}
</style>
