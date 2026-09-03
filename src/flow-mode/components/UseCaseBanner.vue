<template>
  <div id="use-case-banner">
    <p class="use-case-iteration">
      Iteration {{ iterationNumber }} / {{ totalIterations }}
    </p>
    <p
      v-if="isUpgrade"
      class="use-case-badge"
    >
      New use case
    </p>
    <h3 class="use-case-title">
      {{ useCase.title }}
    </h3>
    <p class="use-case-description">
      {{ useCase.description }}
    </p>
    <p
      v-if="isUpgrade"
      class="use-case-hint"
    >
      Read this new scenario first. Next you will upgrade your system by adding 2 cards, then simulate again.
    </p>

    <button
      class="btn btn-success"
      @click="$emit('continue')"
    >
      {{ continueLabel }}
    </button>
  </div>
</template>

<script>
/**
 * Reveals the current iteration's use-case scenario only (no spoilers).
 * For upgrades (iterations 2–4), stresses reading the new use case before
 * adding cards. Security risk and required cards are shown after simulation.
 *
 * @vue-prop {Object} useCase - A UseCase definition.
 * @vue-prop {int} iterationNumber - Current iteration (1–4).
 * @vue-prop {int} totalIterations - Total iterations in the match.
 * @vue-prop {string} continueLabel - Button label.
 * @vue-prop {bool} isUpgrade - True when the next step is a +2 upgrade.
 * @vue-event continue - Emitted when the player is ready to select/upgrade cards.
 */
export default {
  name: 'UseCaseBanner',
  props: {
    useCase: { type: Object, required: true },
    iterationNumber: { type: Number, required: true },
    totalIterations: { type: Number, default: 4 },
    continueLabel: { type: String, default: 'Select Cards' },
    isUpgrade: { type: Boolean, default: false }
  },
  emits: ['continue']
}
</script>

<style scoped>
#use-case-banner {
  max-width: 48rem;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #2b2b2b;
  border: 2px solid rgba(255, 214, 0, 0.75);
  border-radius: 0.8rem;
  color: #fff;
  text-align: center;
}

.use-case-iteration {
  color: #ffc46b;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.use-case-badge {
  display: inline-block;
  margin: 0 0 0.6rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: #1f3a5f;
  border: 1px solid #6fa8ff;
  color: #6fa8ff;
  font-size: 0.8rem;
  font-weight: 700;
}

.use-case-title {
  margin: 0 0 0.8rem;
}

.use-case-description {
  margin-bottom: 1.2rem;
  color: #ddd;
}

.use-case-hint {
  font-size: 0.85rem;
  color: #bbb;
  margin-bottom: 1.2rem;
}
</style>
