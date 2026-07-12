<template>
  <div
    v-if="showing"
    id="match-end-modal"
  >
    <div class="match-end-box">
      <h2 class="match-end-title">
        {{ title }}
      </h2>
      <p class="match-end-reason">
        {{ reasonText }}
      </p>

      <div class="match-end-actions">
        <button
          class="btn btn-success"
          @click="$emit('rematch')"
        >
          Rematch
        </button>
        <button
          class="btn btn-info"
          @click="$emit('exit')"
        >
          Exit to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Final match result modal: who won (or a draw) and why.
 *
 * @vue-prop {Object} matchResult - `{ winnerId: (string|null), reason }`.
 * @vue-prop {Object[]} players - `[{ playerId, displayName }]`, used to show the winner's name.
 * @vue-prop {bool} showing - True to display the modal.
 * @vue-event rematch - Emitted when the player wants to play again.
 * @vue-event exit - Emitted when the player wants to return to Home.
 */
export default {
  name: 'MatchEndModal',
  props: {
    matchResult: { type: Object, required: true },
    players: { type: Array, required: true },
    showing: { type: Boolean, default: false }
  },
  emits: ['rematch', 'exit'],
  computed: {
    winnerName () {
      if (!this.matchResult.winnerId) { return null }
      const winner = this.players.find(p => p.playerId === this.matchResult.winnerId)
      return winner ? winner.displayName : this.matchResult.winnerId
    },
    title () {
      return this.winnerName ? `${this.winnerName} wins!` : "It's a draw!"
    },
    reasonText () {
      const reasons = {
        score: 'Highest score.',
        penetrations: 'Tied on score - won on fewer breaches.',
        suddenDeath: 'Decided in sudden death.',
        draw: 'Completely tied, even after sudden death.'
      }
      return reasons[this.matchResult.reason] || ''
    }
  }
}
</script>

<style scoped>
#match-end-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
}

.match-end-box {
  background: #fff;
  border: 2px solid rgba(255, 214, 0, 0.75);
  border-radius: 0.8rem;
  padding: 1.5rem 2rem;
  max-width: 30rem;
  text-align: center;
  color: #212529;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.7);
}

.match-end-title {
  margin: 0 0 0.5rem;
  color: #1a7a1a;
}

.match-end-reason {
  color: #8a6400;
  margin-bottom: 1.2rem;
}

.match-end-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>
