<template>
  <div id="home-page">
    <page-header>
      <template #pageHeading>
        Welcome to MVC-ARENA!
      </template>
    </page-header>

    <div
      id="game-setup"
      class="centered"
    >
      <add-players />

      <div
        id="message"
        class="centered"
      >
        {{ home.message }}
      </div>

      <div
        id="play-buttons"
        class="centered"
      >
        <button
          id="go"
          class="btn btn-success"
          :disabled="!home.canStart()"
          @click="playBase()"
        >
          Play Base
        </button>

        <button
          id="go-flow"
          class="btn btn-info"
          :disabled="!home.canStart()"
          @click="playFlow()"
        >
          Play Flow
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from '@/components/shared/PageHeader'
import AddPlayers from '@/components/setup/AddPlayers'
import { mapActions, mapGetters } from 'vuex'
import { setPendingSetup } from '@/flow-mode/pendingSetup'

/**
 * The main landing page component for Program Wars where players set up and start games.
 */
export default {
  name: 'HomePage',
  components: {
    'page-header': PageHeader,
    'add-players': AddPlayers
  },
  computed: {
    ...mapGetters(['home'])
  },
  methods: {
    ...mapActions([
      'startBeginnerGame'
    ]),
    /**
     * Starts a Base Mode game using the players set up on this page.
     */
    playBase () {
      if (this.home.canStart()) {
        this.startBeginnerGame({
          players: this.home.createPlayers(), level: this.home.level })
      }
    },
    /**
     * Starts Flow Mode using the same players set up on this page (via
     * AddPlayers), rather than asking again. Flow Mode is a fully separate
     * game mode (see src/flow-mode/) that keeps its own local match state
     * instead of using Vuex, so the chosen names/bot flag are handed off via
     * {@link setPendingSetup} instead of the route (keeping the URL a plain
     * `/flow`) for `FlowModePage` to pick up in its `created()` hook.
     * `home.players` is already sorted human-first (see Home.js#sortPlayers),
     * and canStart() guarantees player 1 is human.
     */
    playFlow () {
      if (!this.home.canStart()) { return }
      const [player1, player2] = this.home.players
      setPendingSetup({
        player1Name: player1.name, player2IsBot: player2.isAI, player2Name: player2.name
      })
      this.$router.push('/flow')
    }
  }
}
</script>

<style scoped>
#home-page {
  position: absolute;
  width: 100vw;
  height: 100vh;
  background-image: linear-gradient(to bottom right, purple, darkblue);
}

#game-setup {
  position: absolute;
  top: 10%;
  width: 55%;
  min-width: 52rem;
  height: 67%;
  min-height: 30rem;
  background-color: white;
  border-radius: 2rem;
}

#message {
  position: absolute;
  bottom: 13%;
  color: red;
}

#play-buttons {
  position: absolute;
  bottom: 2%;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.centered {
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
}
</style>

