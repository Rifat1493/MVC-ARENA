<template>
  <div id="score-board">
    <div class="score-board-round">
      Round {{ roundNumber }} / {{ totalRounds }}
    </div>
    <div
      v-for="player in players"
      :key="player.displayName"
      class="score-row"
    >
      <span class="score-name">{{ player.displayName }}</span>
      <span class="score-value">Round: {{ player.roundScore }}</span>
      <span class="score-value score-total">Total: {{ player.matchScore }}</span>
      <span class="score-value score-penetrations">Breaches: {{ player.penetrations }}</span>
    </div>
  </div>
</template>

<script>
/**
 * Displays each player's round and cumulative score plus their breach
 * (unblocked threat) count, used both as a tiebreaker and a "how safe is
 * your board" indicator.
 *
 * @vue-prop {Object[]} players - `[{ displayName, roundScore, matchScore, penetrations }]`.
 * @vue-prop {int} roundNumber - The current round number.
 * @vue-prop {int} totalRounds - Total rounds in the match.
 */
export default {
  name: 'ScoreBoard',
  props: {
    players: { type: Array, required: true },
    roundNumber: { type: Number, required: true },
    totalRounds: { type: Number, required: true }
  }
}
</script>

<style scoped>
#score-board {
  background: #222222;
  border: solid white 0.15rem;
  border-radius: 0.5rem;
  color: #fff;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.score-board-round {
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.4rem;
  color: #ffc46b;
}

.score-row {
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.2rem 0;
}

.score-name {
  font-weight: 700;
  min-width: 5rem;
}

.score-total {
  color: #8bff8b;
}

.score-penetrations {
  color: #ff8b8b;
}
</style>
