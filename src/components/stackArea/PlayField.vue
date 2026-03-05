<template>
  <div
    id="play-field"
    :class="{ play: isCurrentPlayer }"
    @drop="onDrop"
    @dragover.prevent
    @dragenter.prevent
  >
    <h3 id="main-func">
      {{ player.name }}_main:
    </h3>

    <div class="lanes-container">
      <div
        v-for="laneIndex in 3"
        :key="laneIndex"
        class="lane"
      >
        <div class="method">
          <card-stack :stack="player.playField.method" />
        </div>

        <ul class="stack-list">
          <li
            v-for="stack in getLaneStacks(laneIndex - 1)"
            :key="stack.id"
            class="card-stack"
          >
            <card-stack :stack="stack" />
          </li>
        </ul>
      </div>
    </div>

    <div class="info-button">
      <play-field-info />
    </div>
  </div>
</template>

<script>
import CardStack from '@/components/stackArea/CardStack'
import PlayFieldInfo from '@/components/info/PlayFieldInfo'
import { isBase } from '@/classes/card/cardData'
import { mapGetters } from 'vuex'

/**
 * Displays the player's method stack and all their other card stacks.
 *
 * Responsible for handling events to drop cards that will add new stacks to
 * the player's playField.
 *
 * @vue-prop {Player} player - The player the playField belongs to.
 * @vue-computed {bool} isCurrentPlayer - True if the player is the current player.
 */
export default {
  name: 'PlayField',
  components: {
   'card-stack': CardStack,
   'play-field-info': PlayFieldInfo
  },
  props: ['player'],
  computed: {
    ...mapGetters(['game']),
    isCurrentPlayer () {
      return this.game.currentPlayer() === this.player
    }
  },
  methods: {
    /**
     * Returns the stacks that belong in the given lane index (0, 1, or 2).
     * Stacks are distributed round-robin across the 3 lanes.
     * @param {int} laneIndex - The 0-based lane index.
     * @return {Stack[]} The stacks for that lane.
     */
    getLaneStacks (laneIndex) {
      return this.player.playField.stacks.filter((_, i) => i % 3 === laneIndex)
    },
    /**
     * Handles a given event when a card is dropped in the playField.
     *
     * Only adds new stacks for valid cards `instruction` and `method` when the
     * player is the current player.
     *
     * @param {event} event - The event to handle. Must have the `dataTransfer`
     * properties `cardId` and `playerId`.
     */
    onDrop (event) {
      const id = event.dataTransfer.getData('playerId')
      const owner = this.game.getPlayer(id)
      const cardId = event.dataTransfer.getData('cardId')
      const card = owner.hand.getCardById(cardId)
      event.preventDefault()

      if (this.isCurrentPlayer && isBase(card.type)) {
        event.stopPropagation();
        this.game.takeTurn({
          type: "newStack",
          player: this.game.currentPlayer(),
          card: card, cardOwner: owner,
          playField: this.player.playField
        })
      }
    }
  }
}
</script>

<style scoped>
#play-field {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #333333;
  border: ridge #a0a0a0 0.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  text-align: left;
  display: flex;
  flex-direction: column;
}

#main-func {
  margin: 0;
  margin-top: 0.2rem;
  margin-left: 0.2rem;
  color: #fff;
  flex-shrink: 0;
}

/* ── Lanes ─────────────────────────────────────────────────── */
.lanes-container {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
}

.lane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 0.3rem;
  border-right: 2px solid #a0a0a0;
}

.lane:last-child {
  border-right: none;
}

/* ── Method stack in each lane ──────────────────────────────── */
.method {
  flex-shrink: 0;
  background-color: #222222;
  border: solid white 0.2rem;
  color: white;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 0.3rem;
}

/* ── Regular stacks below the method stack ──────────────────── */
.stack-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.card-stack {
  display: block;
  margin-bottom: 0.3rem;
}

/* ── Info button ────────────────────────────────────────────── */
.info-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.play {
  -webkit-box-shadow: 0 0 0.7rem 0.7rem rgba(0,255,0,1);
  -moz-box-shadow: 0 0 0.7rem 0.7rem rgba(0,255,0,1);
  box-shadow: 0 0 0.7rem 0.7rem rgba(0,255,0,1);
}
</style>


