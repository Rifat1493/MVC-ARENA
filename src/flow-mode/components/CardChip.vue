<template>
  <div
    class="card-chip"
    :class="[`size-${size}`, `layer-${card.layer}`, { disabled, guard: card.kind === 'guard' }]"
    :title="card.description"
    :draggable="draggable && !disabled"
    @dragstart="onDragStart"
  >
    <span
      v-if="card.kind === 'guard'"
      class="card-chip-guard-badge"
    >🛡</span>
    <img
      class="card-chip-image"
      :src="card.image"
      :alt="card.name"
    >
  </div>
</template>

<script>
/**
 * A reusable visual for a single Flow Mode card. Shows the card's real Base
 * Mode artwork at full size (the layer letter and card name are already
 * printed on the image itself, so no separate text label is drawn over it),
 * with its `description` as a native hover tooltip (mirrors the
 * `cardDescriptions.js` tooltip pattern used in Base Mode). A small shield
 * badge is overlaid for guard cards, since "this defends a threat in Flow
 * Mode" isn't information the original artwork carries.
 *
 * @vue-prop {FlowCard} card - The card to display.
 * @vue-prop {bool} disabled - True if the card is currently disabled (damaged).
 * @vue-prop {bool} draggable - True if the chip can be dragged (e.g. onto a LayerBoard).
 * @vue-prop {string} size - 'sm' | 'md', controls the chip's size.
 */
export default {
  name: 'CardChip',
  props: {
    card: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
    draggable: { type: Boolean, default: false },
    size: { type: String, default: 'md' }
  },
  methods: {
    /**
     * Sets the dragged card's id on the drag event so a drop target
     * (LayerBoard) can look it up.
     * @param {DragEvent} event - The dragstart event.
     */
    onDragStart (event) {
      event.dataTransfer.dropEffect = 'move'
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('cardId', this.card.id)
    }
  }
}
</script>

<style scoped>
.card-chip {
  position: relative;
  display: inline-flex;
  border-radius: 0.4rem;
  border: 2px solid #555;
  user-select: none;
  overflow: hidden;
  line-height: 0;
}

.card-chip-image {
  width: auto;
  display: block;
}

/* Cards keep their natural (portrait) aspect ratio - only height is fixed,
   matching Base Mode's own card sizing convention (CardStack.vue/PlayerHand.vue
   set height and let width follow), so nothing gets cropped. */
.size-sm .card-chip-image {
  height: 6.4rem;
}

.size-md .card-chip-image {
  height: 9.5rem;
}

.card-chip-guard-badge {
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  font-size: 1.1rem;
  filter: drop-shadow(0 0 0.25rem rgba(255, 214, 0, 0.9));
  z-index: 1;
}

.layer-controller { border-color: #6fa8ff; }
.layer-model { border-color: #8bff8b; }
.layer-view { border-color: #ffc46b; }

.guard {
  box-shadow: 0 0 0.5rem rgba(255, 214, 0, 0.6);
}

.disabled {
  opacity: 0.4;
  filter: grayscale(1);
}

[draggable='true'] {
  cursor: grab;
}
</style>
