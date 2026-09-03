<template>
  <div id="round-summary">
    <h3>
      Iteration {{ iterationNumber }} Complete
    </h3>
    <p
      v-if="useCaseTitle"
      class="round-summary-usecase"
    >
      Use case: {{ useCaseTitle }}
    </p>

    <div
      v-if="useCase"
      class="round-summary-requirements-block"
    >
      <p class="round-summary-requirements-label">
        Required cards for this use case (must match what you played):
      </p>
      <div class="round-summary-requirements">
        <span
          v-for="card in requiredCards"
          :key="card.id"
          class="round-summary-requirement-chip"
          :class="'layer-' + card.layer"
        >
          {{ card.name }}
        </span>
      </div>
    </div>

    <div class="round-summary-results">
      <div
        v-for="entry in resultEntries"
        :key="entry.displayName"
        class="round-summary-row"
      >
        <span class="round-summary-name">{{ entry.displayName }}</span>
        <span :class="entry.fulfilled ? 'round-summary-pass' : 'round-summary-fail'">
          {{ entry.fulfilled ? 'Fulfilled' : 'Not fulfilled' }}
        </span>
        <span>Matched: {{ entry.fulfilledRequirements }}/{{ entry.totalRequirements }}</span>
        <span class="round-summary-score">+{{ entry.iterationScore }} pts</span>
      </div>
    </div>

    <div
      v-if="explanations.length"
      class="round-summary-explanations"
    >
      <p
        v-for="(text, index) in explanations"
        :key="index"
        class="round-summary-explanation"
      >
        {{ text }}
      </p>
    </div>

    <div
      v-if="useCase"
      class="round-summary-lesson"
    >
      <p class="round-summary-lesson-label">
        Security lesson (why these cards matter):
      </p>
      <div class="round-summary-security">
        <strong>{{ useCase.securityRisk }}</strong>
      </div>
      <p class="round-summary-consequence">
        {{ useCase.consequence }}
      </p>
    </div>

    <div class="round-summary-cumulative">
      <span
        v-for="score in cumulativeScores"
        :key="score.displayName"
      >
        {{ score.displayName }}: {{ score.matchScore }} fulfilled
      </span>
    </div>

    <button
      class="btn btn-success"
      @click="$emit('continue')"
    >
      {{ nextLabel }}
    </button>
  </div>
</template>

<script>
import { cardById } from '@/flow-mode/data/cards'

/**
 * End-of-iteration recap: required-vs-played card match first, then an
 * optional security lesson about why those cards matter.
 */
export default {
  name: 'RoundSummary',
  props: {
    iterationNumber: { type: Number, required: true },
    useCaseTitle: { type: String, default: '' },
    useCase: { type: Object, default: null },
    iterationResult: { type: Object, required: true },
    cumulativeScores: { type: Array, required: true },
    nextLabel: { type: String, default: 'Continue' }
  },
  emits: ['continue'],
  computed: {
    requiredCards () {
      if (!this.useCase) { return [] }
      return this.useCase.requiredCardIds.map(cardById).filter(Boolean)
    },
    resultEntries () {
      return Object.entries(this.iterationResult).map(([playerId, result]) => {
        const score = this.cumulativeScores.find(s => s.playerId === playerId)
        return {
          displayName: score ? score.displayName : playerId,
          fulfilled: !!result.fulfilled,
          fulfilledRequirements: result.fulfilledRequirements || 0,
          totalRequirements: result.totalRequirements || 0,
          iterationScore: result.iterationScore || 0
        }
      })
    },
    explanations () {
      return Object.entries(this.iterationResult).map(([playerId, entry]) => {
        const score = this.cumulativeScores.find(s => s.playerId === playerId)
        const name = score ? score.displayName : playerId
        const text = entry.result && entry.result.explanation
          ? entry.result.explanation
          : ''
        return text ? `${name}: ${text}` : null
      }).filter(Boolean)
    }
  }
}
</script>

<style scoped>
#round-summary {
  max-width: 48rem;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #2b2b2b;
  border: 2px solid rgba(255, 214, 0, 0.75);
  border-radius: 0.8rem;
  color: #fff;
  text-align: center;
}

.round-summary-usecase {
  color: #ffc46b;
  font-weight: 700;
}

.round-summary-requirements-block {
  margin: 1rem 0;
}

.round-summary-requirements-label {
  font-size: 0.85rem;
  color: #bbb;
  margin-bottom: 0.5rem;
}

.round-summary-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  align-items: center;
}

.round-summary-requirement-chip {
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid #666;
  background: #1a1a1a;
}

.round-summary-requirement-chip.layer-controller {
  border-color: #6fa8ff;
  color: #6fa8ff;
}

.round-summary-requirement-chip.layer-model {
  border-color: #8bff8b;
  color: #8bff8b;
}

.round-summary-requirement-chip.layer-view {
  border-color: #ffc46b;
  color: #ffc46b;
}

.round-summary-results {
  margin: 1rem 0;
}

.round-summary-row {
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.3rem 0.5rem;
  font-size: 0.85rem;
  border-bottom: 1px solid #444;
}

.round-summary-name {
  font-weight: 700;
}

.round-summary-pass {
  color: #8bff8b;
  font-weight: 700;
}

.round-summary-fail {
  color: #ff8b8b;
  font-weight: 700;
}

.round-summary-score {
  color: #8bff8b;
  font-weight: 700;
}

.round-summary-explanations {
  text-align: left;
  margin-bottom: 1rem;
}

.round-summary-explanation {
  font-size: 0.8rem;
  color: #ddd;
  margin: 0.3rem 0;
}

.round-summary-lesson {
  margin: 1rem 0;
  padding-top: 0.8rem;
  border-top: 1px solid #555;
  text-align: center;
}

.round-summary-lesson-label {
  font-size: 0.8rem;
  color: #aaa;
  margin-bottom: 0.5rem;
}

.round-summary-security {
  background: #4a1414;
  border: 1px solid #ff2d2d;
  border-radius: 0.4rem;
  padding: 0.5rem 0.8rem;
  color: #ffb3b3;
  margin-bottom: 0.5rem;
}

.round-summary-consequence {
  font-size: 0.85rem;
  color: #ff8b8b;
  margin-bottom: 0;
}

.round-summary-cumulative {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
  color: #ffc46b;
  font-weight: 700;
}
</style>
