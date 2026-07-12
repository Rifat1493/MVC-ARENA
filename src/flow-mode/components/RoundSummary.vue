<template>
  <div id="round-summary">
    <h3>
      Round {{ roundNumber }} Complete
    </h3>

    <div class="round-summary-results">
      <div
        v-for="entry in resultEntries"
        :key="entry.displayName"
        class="round-summary-row"
      >
        <span class="round-summary-name">{{ entry.displayName }}</span>
        <span>Served: {{ entry.served }}</span>
        <span>Blocked: {{ entry.blocked }}</span>
        <span class="round-summary-penetrated">Breached: {{ entry.penetrated }}</span>
        <span class="round-summary-score">+{{ entry.roundScore }} pts</span>
      </div>
    </div>

    <div class="round-summary-cumulative">
      <span
        v-for="score in cumulativeScores"
        :key="score.displayName"
      >
        {{ score.displayName }}: {{ score.matchScore }} total
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
/**
 * End-of-round recap: how each player's requests resolved and their running
 * total.
 *
 * @vue-prop {int} roundNumber - The round that just finished.
 * @vue-prop {Object} roundResult - `{ p1: RoundScoreResult, p2: RoundScoreResult }`.
 * @vue-prop {Object[]} cumulativeScores - `[{ playerId, displayName, matchScore }]`.
 * @vue-prop {string} nextLabel - Label for the continue button (e.g. "See Result").
 * @vue-event continue - Emitted when the player is ready to proceed.
 */
export default {
  name: 'RoundSummary',
  props: {
    roundNumber: { type: Number, required: true },
    roundResult: { type: Object, required: true },
    cumulativeScores: { type: Array, required: true },
    nextLabel: { type: String, default: 'Continue' }
  },
  emits: ['continue'],
  computed: {
    resultEntries () {
      return Object.entries(this.roundResult).map(([playerId, result]) => {
        const score = this.cumulativeScores.find(s => s.playerId === playerId)
        return { ...result, displayName: score ? score.displayName : playerId }
      })
    }
  }
}
</script>

<style scoped>
#round-summary {
  max-width: 44rem;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #2b2b2b;
  border: 2px solid rgba(255, 214, 0, 0.75);
  border-radius: 0.8rem;
  color: #fff;
  text-align: center;
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

.round-summary-penetrated {
  color: #ff8b8b;
}

.round-summary-score {
  color: #8bff8b;
  font-weight: 700;
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
