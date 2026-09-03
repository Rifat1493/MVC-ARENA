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
        id="playtest-code"
        class="centered"
      >
        <label for="playtest-code-input">Playtest code (optional)</label>
        <input
          id="playtest-code-input"
          v-model="playtestCode"
          type="text"
          maxlength="16"
          autocomplete="off"
          spellcheck="false"
          placeholder="Enter code if recruited"
        >
        <span
          v-if="playtestArmed"
          id="playtest-armed"
        >Playtest mode on</span>
      </div>

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
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from '@/components/shared/PageHeader'
import AddPlayers from '@/components/setup/AddPlayers'
import { setPlaytestCode, PLAYTEST_CODE } from '@/analytics/playtest'
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
  data () {
    return {
      playtestCode: ''
    }
  },
  computed: {
    ...mapGetters(['home']),
    playtestArmed () {
      return String(this.playtestCode || '').trim().toUpperCase() === PLAYTEST_CODE
    }
  },
  methods: {
    ...mapActions([
      'startBeginnerGame'
    ]),
    /**
     * Starts a Base Mode game using the players set up on this page.
     */
    playBase () {
      setPlaytestCode(this.playtestCode)
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

#playtest-code {
  position: absolute;
  bottom: 18%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

#playtest-code label {
  margin: 0;
  color: #333;
}

#playtest-code-input {
  width: 11rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #888;
  border-radius: 0.25rem;
}

#playtest-armed {
  color: #0a7a2f;
  font-weight: 600;
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
}

.centered {
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
}
</style>

