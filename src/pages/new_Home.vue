<template>
  <div id="home-page">
    <page-header>
      <template #pageHeading>
        Welcome to Program Wars!
      </template>
    </page-header>

    <div
      id="game-setup"
      class="centered"
    >
      <!-- DEVELOPMENT: Game mode locked to Beginner + Malware1 Level -->
      <div id="game-mode-display" class="setup-info">
        <strong>Game Mode:</strong> Beginner - Malware 1<br>
        <small>Antivirus, Spyware, and Ransom</small>
      </div>

      <!-- DEVELOPMENT: Player selection commented out - using auto-populated players -->
      <!-- <add-players /> -->
      <div id="auto-setup-notice" class="setup-info">
        <strong>🚀 Quick Start Mode</strong><br>
        Players: {{ home.players.length > 0 ? home.players.map(p => p.name).join(', ') : 'None' }}
      </div>

      <div
        id="message"
        class="centered"
      >
        {{ home.message }}
      </div>
      <!-- DEVELOPMENT: Play button is optional - game auto-starts via mounted() hook -->
      <!-- Comment out below button section if you want to hide it -->
      <button
        id="go"
        class="centered btn btn-success"
        :disabled="!home.hasEnoughPlayers()"
        @click="playGame()"
      >
        Play (Auto-Started)
      </button>
    </div>
  </div>
</template>


<script>
import PageHeader from '@/components/shared/PageHeader'
// import GameMode from '@/components/setup/GameMode' // DEVELOPMENT: Removed - locked to Beginner mode
// import SelectLevel from '@/components/setup/SelectLevel' // DEVELOPMENT: Removed - locked to Malware1 level
// import AddPlayers from '@/components/setup/AddPlayers' // DEVELOPMENT: Commented out
import { mapActions, mapGetters } from 'vuex'

/**
 * The main landing page component for Program Wars where players set up and start games.
 */
export default {
  name: 'HomePage',
  components: {
    'page-header': PageHeader
    // 'game-mode': GameMode // DEVELOPMENT: Removed
    // 'select-level': SelectLevel // DEVELOPMENT: Removed
    // 'add-players': AddPlayers // DEVELOPMENT: Commented out
  },
  computed: {
    ...mapGetters(['home'])
  },
  mounted () {
    // DEVELOPMENT: Auto-start game on page load
    // Comment out this line to use manual Play button
    this.$nextTick(() => {
      this.playGame()
    })
  },
  methods: {
    ...mapActions([
      'startBeginnerGame'
      // 'startStandardGame' // DEVELOPMENT: Removed - locked to beginner only
    ]),
    /**
     * Starts a beginner game using the information from the home page state.
     * DEVELOPMENT: Locked to Beginner + Malware1 only
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

.setup-info {
  position: absolute;
  top: 25%;
  color: #333;
  font-size: 14px;
  padding: 1rem;
  background-color: #f0f0f0;
  border-radius: 5px;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.centered {
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
}
</style>

