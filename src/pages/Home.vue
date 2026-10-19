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
      :class="{ 'game-setup-tall': playtestArmed }"
    >
      <div id="player-setup">
        <h4 class="sub-heading">
          Your name
        </h4>
        <input
          id="enter-name"
          v-model="playerName"
          type="text"
          maxlength="10"
          placeholder="Enter your name..."
          autofocus
          @keyup.enter="playBase()"
        >
        <p
          id="vs-bot"
          class="hint"
        >
          You will play against a bot
        </p>
      </div>

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
        v-if="playtestArmed"
        id="study-id-panel"
        class="centered"
      >
        <p class="study-intro">
          We ask that you generate your own study ID so we can link your
          pre-activity and post-activity questionnaires anonymously. Please
          follow the code generation steps exactly. You will not have to
          remember this study ID, as the same instructions will be provided
          at the start of the post-activity questionnaire.
        </p>
        <p class="study-sample">
          SAMPLE ANSWER: <strong>mrr15kk3b</strong> [All small letters]
        </p>
        <ol class="study-steps">
          <li>
            The first letter of your father's first name (or the person who
            is most like a father to you).
          </li>
          <li>
            The first letter of your mother's first name (or the person who
            is most like a mother to you).
          </li>
          <li>
            The first letter of the name you most commonly use (what most
            people call you).
          </li>
          <li>
            The day of your birth date (e.g. October 7 = 7, January 12 = 12,
            June 26 = 26).
          </li>
          <li>
            The last letter of your natural hair colour (e.g. Brown, Bald,
            Blonde, Red, Black, etc.).
          </li>
          <li>
            The last letter of your eye colour (e.g. Brown, Blue, Green,
            Grey, etc.).
          </li>
          <li>
            The number of your siblings (e.g. 2 brothers, 2 sisters = 4,
            only child = 0).
          </li>
          <li>
            The first letter of the city you were born in (e.g. Vancouver = v,
            Calgary = c, Ottawa = o, etc.).
          </li>
        </ol>
        <label for="study-id-input">Please enter your study ID below.</label>
        <input
          id="study-id-input"
          v-model="studyId"
          type="text"
          maxlength="24"
          autocomplete="off"
          spellcheck="false"
          placeholder="e.g. mrr15kk3b"
          @keyup.enter="playBase()"
        >
      </div>

      <div
        id="message"
        class="centered"
      >
        {{ formMessage || home.message }}
      </div>

      <div
        id="play-buttons"
        class="centered"
      >
        <button
          id="go"
          class="btn btn-success"
          :disabled="!canPlay"
          @click="playBase()"
        >
          Play
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from '@/components/shared/PageHeader'
import {
  setPlaytestCode,
  setStudyId,
  PLAYTEST_CODE
} from '@/analytics/playtest'
import { mapActions, mapGetters } from 'vuex'

/**
 * Landing page: enter a name and start a Base Mode game against a bot.
 * Playtest recruits enter T1K5M9, then a self-generated study ID.
 */
export default {
  name: 'HomePage',
  components: {
    'page-header': PageHeader
  },
  data () {
    return {
      playerName: '',
      playtestCode: '',
      studyId: '',
      formMessage: ''
    }
  },
  computed: {
    ...mapGetters(['home']),
    playtestArmed () {
      return String(this.playtestCode || '').trim().toUpperCase() === PLAYTEST_CODE
    },
    canPlay () {
      if (!String(this.playerName || '').trim()) {
        return false
      }
      if (this.playtestArmed && !String(this.studyId || '').trim()) {
        return false
      }
      return true
    }
  },
  watch: {
    playtestArmed (armed) {
      if (!armed) {
        this.studyId = ''
        this.formMessage = ''
      }
    }
  },
  methods: {
    ...mapActions([
      'startBeginnerGame'
    ]),
    /**
     * Starts a Base Mode game: one human vs one beginner bot.
     */
    playBase () {
      this.formMessage = ''
      setPlaytestCode(this.playtestCode)

      if (this.playtestArmed) {
        const id = setStudyId(this.studyId)
        if (!id) {
          this.formMessage = 'Please enter your study ID'
          return
        }
      } else {
        setStudyId('')
      }

      if (!this.home.setupSoloVsBot(this.playerName)) {
        return
      }
      this.startBeginnerGame({
        players: this.home.createPlayers(),
        level: this.home.level
      })
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
  top: 6%;
  width: 55%;
  min-width: 52rem;
  height: 72%;
  min-height: 30rem;
  background-color: white;
  border-radius: 2rem;
  overflow: hidden;
}

#game-setup.game-setup-tall {
  height: 86%;
  top: 4%;
  overflow-y: auto;
}

#player-setup {
  margin: 2rem 1rem 0;
  text-align: center;
}

.sub-heading {
  color: black;
  text-decoration: underline;
  text-decoration-skip-ink: none;
}

#enter-name {
  border: none;
  border-bottom: 0.1vh solid black;
  outline: none;
  text-align: center;
  font-size: 1.1rem;
  min-width: 14rem;
}

.hint {
  margin-top: 0.75rem;
  color: #555;
  font-size: 0.95rem;
}

#playtest-code {
  margin-top: 1.25rem;
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

#study-id-panel {
  margin: 1rem auto 0;
  width: 90%;
  max-width: 40rem;
  text-align: left;
  font-size: 0.9rem;
  color: #222;
  background: #f7f7f7;
  border: 1px solid #ddd;
  border-radius: 0.75rem;
  padding: 0.85rem 1.1rem 1rem;
}

.study-intro {
  margin: 0 0 0.6rem;
  line-height: 1.4;
}

.study-sample {
  margin: 0 0 0.5rem;
}

.study-steps {
  margin: 0 0 0.75rem;
  padding-left: 1.25rem;
  line-height: 1.45;
}

#study-id-panel label {
  display: block;
  margin-bottom: 0.35rem;
  font-weight: 600;
}

#study-id-input {
  width: 100%;
  max-width: 16rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid #888;
  border-radius: 0.25rem;
  text-transform: lowercase;
}

#message {
  margin-top: 0.75rem;
  color: red;
  text-align: center;
  min-height: 1.25rem;
}

#play-buttons {
  margin: 0.75rem 0 1.25rem;
  width: 100%;
  text-align: center;
}

.centered {
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
}
</style>
