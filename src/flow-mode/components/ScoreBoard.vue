<template>
  <div id="score-board">
    <div class="score-board-round">
      Iteration {{ iterationNumber }} / {{ totalIterations }}
    </div>
    <div
      v-for="player in players"
      :key="player.displayName"
      class="score-row"
    >
      <span class="score-name">{{ player.displayName }}</span>
      <span class="score-value">This: {{ player.roundScore }}</span>
      <span class="score-value score-total">Fulfilled: {{ player.matchScore }}</span>
      <span class="score-value score-requirements">Reqs: {{ player.requirementsFulfilled }}</span>
    </div>
  </div>
</template>

<script>
/**
 * Displays each player's current-iteration and cumulative fulfilled use-case
 * scores plus requirements covered (tiebreaker).
 *
 * @vue-prop {Object[]} players - `[{ displayName, roundScore, matchScore, requirementsFulfilled }]`.
 * @vue-prop {int} iterationNumber - The current iteration number.
 * @vue-prop {int} totalIterations - Total iterations in the match.
 */
export default {
  name: 'ScoreBoard',
  props: {
    players: { type: Array, required: true },
    iterationNumber: { type: Number, required: true },
    totalIterations: { type: Number, required: true }
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

.score-requirements {
  color: #6fa8ff;
}
</style>
