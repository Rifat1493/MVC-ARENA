<template>
  <div class="layer-board">
    <h4 class="layer-board-title">
      {{ playerName }}
    </h4>

    <div class="layer-board-columns">
      <div
        v-for="layer in layerNames"
        :key="layer"
        class="layer-column"
        :class="`layer-column-${layer}`"
        @drop="onDrop($event, layer)"
        @dragover.prevent
        @dragenter.prevent
      >
        <div class="layer-column-title">
          {{ layerLabels[layer] }}
        </div>
        <div class="layer-column-cards">
          <card-chip
            v-for="entry in layers[layer]"
            :key="entry.card.id"
            :card="entry.card"
            :disabled="entry.disabled"
            size="sm"
          />
        </div>
      </div>
    </div>

    <p
      v-if="rejectMessage"
      class="layer-board-reject"
    >
      {{ rejectMessage }}
    </p>
  </div>
</template>

<script>
import CardChip from '@/flow-mode/components/CardChip'
import { cardById } from '@/flow-mode/data/cards'
import { LAYERS } from '@/flow-mode/engine/constants'

const LAYER_LABELS = { controller: 'Controller', model: 'Model', view: 'View' }

/**
 * One player's 3-column Controller/Model/View board. Accepts HTML5
 * drag-and-drop of a card (mirrors the drop pattern used by Base Mode's
 * `PlayField.vue`/`CardStack.vue`), rejecting a drop locally with a brief
 * message if the card doesn't belong in that column.
 *
 * @vue-prop {string} playerName - The board owner's display name.
 * @vue-prop {Object} layers - `{ controller: [{card, disabled}], model: [...], view: [...] }`.
 * @vue-prop {bool} interactive - False for a read-only view (e.g. a bot's board).
 * @vue-event drop-card - Emitted `{ cardId, layer }` only when the dropped card belongs in that layer.
 */
export default {
  name: 'LayerBoard',
  components: { 'card-chip': CardChip },
  props: {
    playerName: { type: String, required: true },
    layers: { type: Object, required: true },
    interactive: { type: Boolean, default: true }
  },
  emits: ['drop-card'],
  data () {
    return {
      layerNames: LAYERS,
      layerLabels: LAYER_LABELS,
      rejectMessage: ''
    }
  },
  methods: {
    /**
     * Handles a card being dropped on a layer column. Emits `drop-card` if
     * the card's own layer matches; otherwise shows a transient rejection
     * message and emits nothing.
     * @param {DragEvent} event - The drop event.
     * @param {string} layer - The column the card was dropped on.
     */
    onDrop (event, layer) {
      event.preventDefault()
      if (!this.interactive) { return }

      const cardId = event.dataTransfer.getData('cardId')
      const card = cardById(cardId)
      if (!card) { return }

      if (card.layer !== layer) {
        this.rejectMessage = `${card.name} belongs in the ${card.layer} layer, not ${layer}.`
        setTimeout(() => { this.rejectMessage = '' }, 2500)
        return
      }

      this.$emit('drop-card', { cardId, layer })
    }
  }
}
</script>

<style scoped>
.layer-board {
  background: #222222;
  border: solid white 0.15rem;
  border-radius: 0.5rem;
  padding: 1.2rem;
  color: #fff;
}

.layer-board-title {
  text-align: center;
  font-size: 1.2rem;
  margin: 0 0 1rem;
}

.layer-board-columns {
  display: flex;
  gap: 1rem;
}

.layer-column {
  flex: 1;
  min-height: 16rem;
  border: 1px dashed #555;
  border-radius: 0.4rem;
  padding: 0.7rem;
}

.layer-column-controller { border-color: #6fa8ff; }
.layer-column-model { border-color: #8bff8b; }
.layer-column-view { border-color: #ffc46b; }

.layer-column-title {
  text-align: center;
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 0.7rem;
}

.layer-column-cards {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.layer-board-reject {
  margin: 0.5rem 0 0;
  color: #ff8b8b;
  font-size: 0.8rem;
  text-align: center;
}
</style>
