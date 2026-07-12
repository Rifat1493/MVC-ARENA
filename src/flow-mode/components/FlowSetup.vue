<template>
  <div id="flow-setup">
    <h2>Flow Mode</h2>
    <p class="flow-setup-sub">
      Build an MVC pipeline and defend it from real-world threats.
    </p>

    <div class="flow-setup-field">
      <label for="p1-name">Player 1</label>
      <input
        id="p1-name"
        v-model="player1Name"
        type="text"
        maxlength="10"
        placeholder="Player 1 name"
      >
    </div>

    <div class="flow-setup-field">
      <label>Player 2</label>
      <div class="flow-setup-toggle">
        <button
          type="button"
          class="btn btn-info btn-sm"
          :class="{ active: !player2IsBot }"
          @click="player2IsBot = false"
        >
          Human
        </button>
        <button
          type="button"
          class="btn btn-danger btn-sm"
          :class="{ active: player2IsBot }"
          @click="player2IsBot = true"
        >
          Bot
        </button>
      </div>
      <input
        v-if="!player2IsBot"
        id="p2-name"
        v-model="player2Name"
        type="text"
        maxlength="10"
        placeholder="Player 2 name"
      >
    </div>

    <p
      v-if="errorMessage"
      class="flow-setup-error"
    >
      {{ errorMessage }}
    </p>

    <button
      class="btn btn-success"
      @click="start"
    >
      Start Match
    </button>
  </div>
</template>

<script>
/**
 * Flow Mode's own setup screen: collects player 1's name and either player
 * 2's name (human) or a bot toggle, entirely self-contained (does not touch
 * the shared Home page state used by Base Mode).
 *
 * @vue-event start - Emitted `{ player1Name, player2IsBot, player2Name }` once
 * the form is valid.
 */
export default {
  name: 'FlowSetup',
  emits: ['start'],
  data () {
    return {
      player1Name: '',
      player2Name: '',
      player2IsBot: false,
      errorMessage: ''
    }
  },
  methods: {
    /**
     * Validates the form and emits `start` if it's ready.
     */
    start () {
      const p1 = this.player1Name.trim()
      const p2 = this.player2IsBot ? 'Bot' : this.player2Name.trim()

      if (!p1) {
        this.errorMessage = 'Enter a name for Player 1.'
        return
      }
      if (!this.player2IsBot && !p2) {
        this.errorMessage = 'Enter a name for Player 2, or switch to Bot.'
        return
      }

      this.errorMessage = ''
      this.$emit('start', { player1Name: p1, player2IsBot: this.player2IsBot, player2Name: p2 })
    }
  }
}
</script>

<style scoped>
#flow-setup {
  max-width: 24rem;
  margin: 3rem auto;
  padding: 1.5rem;
  background: #2b2b2b;
  border: 2px solid rgba(255, 214, 0, 0.75);
  border-radius: 0.8rem;
  color: #fff;
  text-align: center;
}

.flow-setup-sub {
  font-size: 0.85rem;
  color: #c9c9c9;
  margin-bottom: 1.2rem;
}

.flow-setup-field {
  margin-bottom: 1rem;
  text-align: left;
}

.flow-setup-field label {
  display: block;
  font-size: 0.8rem;
  color: #bbb;
  margin-bottom: 0.2rem;
}

.flow-setup-field input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.3rem 0.5rem;
  border-radius: 0.3rem;
  border: 1px solid #555;
  background: #1f1f1f;
  color: #fff;
}

.flow-setup-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.flow-setup-toggle .btn {
  opacity: 0.5;
}

.flow-setup-toggle .btn.active {
  opacity: 1;
  box-shadow: 0 0 0.4rem rgba(255, 214, 0, 0.6);
}

.flow-setup-error {
  color: #ff8b8b;
  font-size: 0.85rem;
  margin-bottom: 0.8rem;
}
</style>
