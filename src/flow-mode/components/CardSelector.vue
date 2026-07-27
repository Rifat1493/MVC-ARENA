<template>
  <div class="card-selector">
    <h4 class="card-selector-title">
      {{ playerName }} — {{ modeTitle }}
    </h4>

    <p
      v-if="useCase"
      class="card-selector-usecase"
    >
      Building for: <strong>{{ useCase.title }}</strong>
    </p>

    <p class="card-selector-status">
      {{ statusText }}
    </p>

    <div
      v-for="layer in layers"
      :key="layer"
      class="card-selector-layer"
    >
      <h5 class="card-selector-layer-title">
        {{ layerLabel(layer) }}
      </h5>
      <div class="card-selector-options">
        <button
          v-for="card in cardsForLayer(layer)"
          :key="card.id"
          class="card-selector-option"
          :class="{
            selected: isSelected(card.id),
            owned: isAlreadyOwned(card.id)
          }"
          :disabled="isAlreadyOwned(card.id)"
          @click="$emit('toggle', card.id)"
        >
          <card-chip
            :card="card"
            size="sm"
          />
          <span
            v-if="isAlreadyOwned(card.id)"
            class="card-selector-badge owned-badge"
          >Owned</span>
        </button>
      </div>
    </div>

    <button
      class="btn btn-success card-selector-confirm"
      :disabled="!canConfirm"
      @click="$emit('confirm')"
    >
      Confirm Selection
    </button>
  </div>
</template>

<script>
import CardChip from '@/flow-mode/components/CardChip'
import { CARDS } from '@/flow-mode/data/cards'
import { LAYERS } from '@/flow-mode/engine/constants'
import {
  canConfirmSelection,
  selectionStatusText
} from '@/flow-mode/engine/selection'

/**
 * Full-catalog card selection for initial 2/2/1 builds and +2 upgrades.
 * Does not reveal required cards or security risks (shown after simulation).
 *
 * @vue-prop {string} playerName - Selecting player's name.
 * @vue-prop {'initial'|'upgrade'} mode - Selection mode.
 * @vue-prop {string[]} selectedIds - Currently toggled card ids.
 * @vue-prop {string[]} ownedIds - Cards already in the player's system.
 * @vue-prop {Object|null} useCase - Current use case (title only).
 * @vue-event toggle - Emitted with a card id to toggle.
 * @vue-event confirm - Emitted when the player confirms a valid selection.
 */
export default {
  name: 'CardSelector',
  components: { 'card-chip': CardChip },
  props: {
    playerName: { type: String, required: true },
    mode: { type: String, required: true },
    selectedIds: { type: Array, default: () => [] },
    ownedIds: { type: Array, default: () => [] },
    useCase: { type: Object, default: null }
  },
  emits: ['toggle', 'confirm'],
  data () {
    return { layers: LAYERS }
  },
  computed: {
    modeTitle () {
      return this.mode === 'initial'
        ? 'Initial Build (2 Controller, 2 Model, 1 View)'
        : 'Upgrade (+2 cards, any layer)'
    },
    statusText () {
      return selectionStatusText(this.mode, this.selectedIds)
    },
    canConfirm () {
      return canConfirmSelection(this.mode, this.selectedIds, this.ownedIds)
    }
  },
  methods: {
    layerLabel (layer) {
      return layer.charAt(0).toUpperCase() + layer.slice(1)
    },
    cardsForLayer (layer) {
      return CARDS.filter(c => c.layer === layer)
    },
    isSelected (cardId) {
      return this.selectedIds.includes(cardId)
    },
    isAlreadyOwned (cardId) {
      return this.mode === 'upgrade' && this.ownedIds.includes(cardId)
    }
  }
}
</script>

<style scoped>
.card-selector {
  background: #222222;
  border: solid white 0.15rem;
  border-radius: 0.5rem;
  padding: 1.2rem;
  color: #fff;
  text-align: center;
}

.card-selector-title {
  font-size: 1.05rem;
  margin: 0 0 0.6rem;
}

.card-selector-usecase {
  color: #ffc46b;
  margin-bottom: 0.4rem;
}

.card-selector-status {
  font-size: 0.9rem;
  color: #bbb;
  margin-bottom: 0.8rem;
}

.card-selector-layer {
  margin-bottom: 0.9rem;
  text-align: left;
}

.card-selector-layer-title {
  font-size: 0.9rem;
  margin: 0 0 0.4rem;
  color: #ffc46b;
}

.card-selector-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card-selector-option {
  position: relative;
  background: none;
  border: 2px solid transparent;
  border-radius: 0.4rem;
  padding: 0.2rem;
  cursor: pointer;
  opacity: 0.85;
}

.card-selector-option.selected {
  border-color: #8bff8b;
  box-shadow: 0 0 0.4rem rgba(139, 255, 139, 0.5);
  opacity: 1;
}

.card-selector-option.owned {
  opacity: 0.45;
  cursor: not-allowed;
}

.card-selector-badge {
  position: absolute;
  top: -0.3rem;
  right: -0.2rem;
  background: #444;
  color: #fff;
  font-size: 0.55rem;
  font-weight: 700;
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
}

.card-selector-confirm {
  margin-top: 0.6rem;
}

.card-selector-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
