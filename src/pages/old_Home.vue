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

      <button
        id="go"
        class="centered btn btn-success"
        :disabled="!home.canStart()"
        @click="playGame()"
      >
        Play
      </button>
    </div>
  </div>
</template>

<script>
import PageHeader from '@/components/shared/PageHeader'
import AddPlayers from '@/components/setup/AddPlayers'
import { mapActions, mapGetters } from 'vuex'

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
     * Starts a beginner game using the information from the home page state.
     */
    playGame () {
      if (this.home.canStart()) {
        this.startBeginnerGame({
          players: this.home.createPlayers(), level: this.home.level })
      }
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

#go {
  display: inline-block;
  position: absolute;
  bottom: 2%;
}

.centered {
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
}
</style>

