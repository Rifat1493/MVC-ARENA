<template>
  <div class="draft-picker">
    <h4 class="draft-picker-title">
      {{ playerName }} — Pick {{ pickNumber }} of {{ pickNumber + picksRemaining - 1 }}
    </h4>

    <div class="draft-picker-options">
      <button
        v-for="card in options"
        :key="card.id"
        class="draft-picker-option"
        @click="$emit('pick', card.id)"
      >
        <card-chip
          :card="card"
          size="md"
        />
      </button>
    </div>

    <div
      v-if="alreadyDrafted.length"
      class="draft-picker-collected"
    >
      <span class="draft-picker-collected-label">Collected:</span>
      <card-chip
        v-for="card in alreadyDrafted"
        :key="card.id"
        :card="card"
        size="sm"
      />
    </div>
  </div>
</template>

<script>
import CardChip from '@/flow-mode/components/CardChip'

/**
 * One player's 3-card draft pick panel. Shown side by side with the other
 * player's panel for a split-screen, simultaneous draft.
 *
 * @vue-prop {string} playerName - The drafting player's display name.
 * @vue-prop {FlowCard[]} options - The 3 cards currently offered.
 * @vue-prop {int} pickNumber - The 1-based pick number being made right now.
 * @vue-prop {int} picksRemaining - How many picks (including this one) are left.
 * @vue-prop {FlowCard[]} alreadyDrafted - Cards already picked this match.
 * @vue-event pick - Emitted with the chosen card's id.
 */
export default {
  name: 'DraftPicker',
  components: { 'card-chip': CardChip },
  props: {
    playerName: { type: String, required: true },
    options: { type: Array, required: true },
    pickNumber: { type: Number, required: true },
    picksRemaining: { type: Number, required: true },
    alreadyDrafted: { type: Array, default: () => [] }
  },
  emits: ['pick']
}
</script>

<style scoped>
.draft-picker {
  background: #222222;
  border: solid white 0.15rem;
  border-radius: 0.5rem;
  padding: 1.2rem;
  color: #fff;
  text-align: center;
}

.draft-picker-title {
  font-size: 1.1rem;
  margin: 0 0 1.2rem;
}

.draft-picker-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.draft-picker-option {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.draft-picker-option:hover .card-chip {
  border-color: #8bff8b;
  box-shadow: 0 0 0.5rem rgba(139, 255, 139, 0.5);
}

.draft-picker-collected {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  justify-content: center;
  border-top: 1px solid #444;
  padding-top: 0.6rem;
}

.draft-picker-collected-label {
  font-size: 0.75rem;
  color: #bbb;
  margin-right: 0.3rem;
}
</style>
