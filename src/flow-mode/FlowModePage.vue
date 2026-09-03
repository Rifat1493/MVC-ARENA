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
      <use-case-banner
        v-if="phase === 'useCase'"
        :use-case="match.currentUseCase"
        :iteration-number="match.iterationNumber"
        :total-iterations="totalIterations"
        :is-upgrade="match.iterationNumber > 1"
        :continue-label="match.iterationNumber === 1 ? 'Select Cards' : 'Continue to Upgrade'"
        @continue="onUseCaseContinue"
      />

      <div
        v-else-if="phase === 'select'"
        class="flow-mode-select"
      >
        <div
          v-if="match.currentUseCase"
          class="flow-mode-select-usecase"
        >
          <p class="flow-mode-select-usecase-label">
            {{ match.selectionState.mode === 'upgrade' ? 'Upgrade for this use case' : 'Building for this use case' }}
          </p>
          <h3 class="flow-mode-select-usecase-title">
            {{ match.currentUseCase.title }}
          </h3>
          <p class="flow-mode-select-usecase-desc">
            {{ match.currentUseCase.description }}
          </p>
        </div>
        <div class="flow-mode-split">
          <div
            v-for="playerId in ['p1', 'p2']"
            :key="playerId"
          >
            <card-selector
              v-if="playerId === activeSelectPlayerId"
              :player-name="match.players[playerId].displayName"
              :mode="match.selectionState.mode"
              :selected-ids="match.selectionState[playerId].selected"
              :owned-ids="ownedIdsForSelect(playerId)"
              :use-case="match.currentUseCase"
              @toggle="cardId => onToggleSelect(playerId, cardId)"
              @confirm="onConfirmSelect(playerId)"
            />
            <div
              v-else
              class="flow-mode-hidden-panel"
            >
              <p class="flow-mode-hidden-title">
                {{ match.players[playerId].displayName }}
              </p>
              <p class="flow-mode-hidden-note">
                {{ hiddenSelectMessage(playerId) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="phase === 'build'"
        class="flow-mode-build"
      >
        <p class="flow-mode-build-hint">
          Your cards are placed automatically in their MVC layers. Review the systems, then simulate the use case.
        </p>
        <div class="flow-mode-split">
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
        <button
          class="btn btn-success flow-mode-continue"
          @click="startSimulatePhase"
        >
          Simulate Request / Response
        </button>
      </div>

      <template v-else-if="phase === 'simulate' || (phase === 'iterationSummary' && showSimulateAnimation)">
        <div
          v-if="currentSimulation"
          class="flow-mode-request-banner"
          :class="{ 'flow-mode-request-banner-threat': hasFailure }"
        >
          {{ currentSimulationSummary }}
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
              v-if="currentSimulation"
              :use-case="currentSimulation.useCase"
              :result="playerId === 'p1' ? currentSimulation.resultP1 : currentSimulation.resultP2"
              :stop-index="pipelineStopIndex"
            />
          </div>
        </div>
        <score-board
          :players="scoreBoardPlayers"
          :iteration-number="match.iterationNumber"
          :total-iterations="totalIterations"
        />
        <button
          v-if="!pipelineAnimating"
          class="btn btn-success flow-mode-continue"
          @click="onSimulateContinue"
        >
          Continue
        </button>
        <p
          v-else
          class="flow-mode-simulating"
        >
          Simulating request / response… watch where the flow succeeds or fails.
        </p>

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
        v-else-if="phase === 'iterationSummary'"
        :iteration-number="match.iterationNumber"
        :use-case-title="lastIterationTitle"
        :use-case="lastIterationUseCase"
        :iteration-result="lastIterationResult"
        :cumulative-scores="scoreBoardPlayers.map(p => ({ playerId: p.playerId, displayName: p.displayName, matchScore: p.matchScore }))"
        :next-label="match.iterationNumber >= totalIterations ? 'See Result' : 'See Next Use Case'"
        @continue="onIterationSummaryContinue"
      />

      <match-end-modal
        :match-result="match.matchResult || { winnerId: null, reason: 'draw' }"
        :players="matchEndPlayers"
        :showing="phase === 'matchEnd'"
        @rematch="onRematch"
        @exit="exitToHome"
      />
    </template>
  </div>
</template>

<script>
import FlowMatch from '@/flow-mode/engine/matchManager'
import { startFlowSession, abandonFlowSession } from '@/analytics/gameAnalytics'
import { ITERATIONS_PER_MATCH, SIMULATION_DURATION_MS } from '@/flow-mode/engine/constants'
import { computeStops, computeHaltIndex } from '@/flow-mode/engine/pipelineStops'
import { cardById } from '@/flow-mode/data/cards'
import { takePendingSetup } from '@/flow-mode/pendingSetup'

import FlowSetup from '@/flow-mode/components/FlowSetup'
import UseCaseBanner from '@/flow-mode/components/UseCaseBanner'
import CardSelector from '@/flow-mode/components/CardSelector'
import LayerBoard from '@/flow-mode/components/LayerBoard'
import RequestPipeline from '@/flow-mode/components/RequestPipeline'
import ScoreBoard from '@/flow-mode/components/ScoreBoard'
import RoundSummary from '@/flow-mode/components/RoundSummary'
import MatchEndModal from '@/flow-mode/components/MatchEndModal'

/**
 * Flow Mode entry point. Owns the {@link FlowMatch} instance and phase UI
 * for the four-iteration use-case redesign.
 */
export default {
  name: 'FlowModePage',
  components: {
    'flow-setup': FlowSetup,
    'use-case-banner': UseCaseBanner,
    'card-selector': CardSelector,
    'layer-board': LayerBoard,
    'request-pipeline': RequestPipeline,
    'score-board': ScoreBoard,
    'round-summary': RoundSummary,
    'match-end-modal': MatchEndModal
  },
  data () {
    return {
      match: null,
      matchRev: 0,
      skipAnimation: false,
      currentSimulation: null,
      pipelineStopIndex: 0,
      pipelineAnimating: false,
      pipelineTimer: null,
      totalIterations: ITERATIONS_PER_MATCH
    }
  },
  computed: {
    /** Bumped after engine mutations so templates re-read match state. */
    phase () {
      void this.matchRev
      return this.match ? this.match.phase : null
    },
    showSimulateAnimation () {
      return this.currentSimulation !== null
    },
    pipelineMaxHaltIndex () {
      if (!this.currentSimulation) { return 0 }
      const { useCase, resultP1, resultP2 } = this.currentSimulation
      const stops = computeStops(useCase)
      const haltP1 = computeHaltIndex(stops, useCase, resultP1)
      const haltP2 = computeHaltIndex(stops, useCase, resultP2)
      return Math.max(haltP1, haltP2)
    },
    currentSimulationSummary () {
      if (!this.currentSimulation) { return '' }
      return `Simulating: ${this.currentSimulation.useCase.title}`
    },
    hasFailure () {
      if (!this.currentSimulation) { return false }
      return this.currentSimulation.resultP1.outcome === 'failed' ||
        this.currentSimulation.resultP2.outcome === 'failed'
    },
    scoreBoardPlayers () {
      void this.matchRev
      return ['p1', 'p2'].map(playerId => {
        const board = this.match.players[playerId]
        return {
          playerId,
          displayName: board.displayName,
          roundScore: board.roundScore,
          matchScore: board.matchScore,
          requirementsFulfilled: board.requirementsFulfilled || 0
        }
      })
    },
    lastIterationResult () {
      void this.matchRev
      const entry = this.match.iterationHistory[this.match.iterationHistory.length - 1]
      return entry ? { p1: entry.p1, p2: entry.p2 } : { p1: {}, p2: {} }
    },
    lastIterationTitle () {
      void this.matchRev
      const entry = this.match.iterationHistory[this.match.iterationHistory.length - 1]
      return entry ? entry.useCaseTitle : ''
    },
    lastIterationUseCase () {
      void this.matchRev
      const entry = this.match.iterationHistory[this.match.iterationHistory.length - 1]
      if (!entry || !this.match) { return null }
      return this.match.useCaseSchedule.find(uc => uc.id === entry.useCaseId) || null
    },
    matchEndPlayers () {
      return ['p1', 'p2'].map(playerId => (
        { playerId, displayName: this.match.players[playerId].displayName }
      ))
    },
    /**
     * Which human player's selector is shown. Humans select one at a time
     * (p1 first) so opponent picks stay hidden.
     */
    activeSelectPlayerId () {
      void this.matchRev
      if (!this.match || !this.match.selectionState) { return null }
      for (const playerId of ['p1', 'p2']) {
        const board = this.match.players[playerId]
        const state = this.match.selectionState[playerId]
        if (!board.isBot && !state.confirmed) {
          return playerId
        }
      }
      return null
    }
  },
  watch: {
    skipAnimation (skip) {
      if (skip && this.currentSimulation && this.pipelineAnimating) {
        this.finishPipelineAnimation()
      }
    }
  },
  created () {
    const setup = takePendingSetup()
    if (setup) {
      this.onStart(setup)
    }
  },
  beforeUnmount () {
    this.clearPipelineTimer()
  },
  methods: {
    /** Notify Vue that FlowMatch internal state changed. */
    bumpMatch () {
      this.matchRev++
    },
    clearPipelineTimer () {
      if (this.pipelineTimer) {
        clearInterval(this.pipelineTimer)
        this.pipelineTimer = null
      }
    },
    finishPipelineAnimation () {
      this.clearPipelineTimer()
      this.pipelineStopIndex = this.pipelineMaxHaltIndex
      this.pipelineAnimating = false
    },
    startPipelineAnimation () {
      this.clearPipelineTimer()
      const halt = this.pipelineMaxHaltIndex
      if (this.skipAnimation || halt <= 0) {
        this.pipelineStopIndex = halt
        this.pipelineAnimating = false
        return
      }
      this.pipelineStopIndex = 0
      this.pipelineAnimating = true
      const intervalMs = SIMULATION_DURATION_MS / halt
      this.pipelineTimer = setInterval(() => {
        if (this.pipelineStopIndex >= this.pipelineMaxHaltIndex) {
          this.finishPipelineAnimation()
          return
        }
        this.pipelineStopIndex++
        if (this.pipelineStopIndex >= this.pipelineMaxHaltIndex) {
          this.finishPipelineAnimation()
        }
      }, intervalMs)
    },
    onStart (setup) {
      const match = new FlowMatch(setup)
      startFlowSession(match)
      match.startUseCasePhase()
      this.match = match
      this.bumpMatch()
    },
    ownedIdsForSelect (playerId) {
      void this.matchRev
      return this.match.players[playerId].drafted.slice()
    },
    hiddenSelectMessage (playerId) {
      void this.matchRev
      const board = this.match.players[playerId]
      const state = this.match.selectionState[playerId]
      if (board.isBot) { return 'Selected automatically — hidden until systems are revealed.' }
      if (state.confirmed) {
        return 'Selection complete — hidden until you finish your own picks.'
      }
      return 'Waiting for their turn to select cards.'
    },
    resolvedLayers (playerId) {
      void this.matchRev
      const layers = this.match.players[playerId].layers
      const resolve = slots => slots.map(slot => ({ card: cardById(slot.cardId), disabled: slot.disabled }))
      return { controller: resolve(layers.controller), model: resolve(layers.model), view: resolve(layers.view) }
    },
    onUseCaseContinue () {
      this.match.startSelect()
      this.bumpMatch()
    },
    onToggleSelect (playerId, cardId) {
      this.match.toggleSelectCard(playerId, cardId)
      this.bumpMatch()
    },
    onConfirmSelect (playerId) {
      this.match.confirmSelection(playerId)
      this.bumpMatch()
    },
    startSimulatePhase () {
      this.currentSimulation = this.match.runSimulation()
      this.pipelineStopIndex = 0
      this.pipelineAnimating = false
      this.bumpMatch()
      this.$nextTick(() => {
        this.startPipelineAnimation()
      })
    },
    onSimulateContinue () {
      if (this.pipelineAnimating) { return }
      this.clearPipelineTimer()
      this.match.finishIteration()
      this.currentSimulation = null
      this.pipelineStopIndex = 0
      this.bumpMatch()
    },
    onIterationSummaryContinue () {
      this.match.continueAfterSummary()
      this.bumpMatch()
    },
    onRematch () {
      if (this.match) {
        abandonFlowSession(this.match)
      }
      this.clearPipelineTimer()
      this.match = null
      this.currentSimulation = null
      this.pipelineStopIndex = 0
      this.pipelineAnimating = false
      this.matchRev = 0
    },
    exitToHome () {
      if (this.match) {
        abandonFlowSession(this.match)
      }
      this.clearPipelineTimer()
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

.flow-mode-select {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flow-mode-select-usecase {
  max-width: 48rem;
  width: calc(100% - 2rem);
  margin: 1rem auto 0;
  padding: 1rem 1.2rem;
  background: #1f3a5f;
  border: 2px solid #6fa8ff;
  border-radius: 0.6rem;
  text-align: center;
}

.flow-mode-select-usecase-label {
  margin: 0 0 0.3rem;
  color: #ffc46b;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.flow-mode-select-usecase-title {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
}

.flow-mode-select-usecase-desc {
  margin: 0;
  color: #d7e6ff;
  font-size: 0.9rem;
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
  max-width: 48rem;
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

.flow-mode-build-hint {
  color: #ffc46b;
  margin: 1rem 1rem 0;
  text-align: center;
}

.flow-mode-continue {
  margin: 0.5rem 0 1rem;
}

.flow-mode-simulating {
  margin: 0.8rem 0 1rem;
  color: #ffc46b;
  font-weight: 700;
  text-align: center;
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
