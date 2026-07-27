<template>
  <div class="request-pipeline">
    <div class="pipeline-stops">
      <template
        v-for="(stop, index) in stops"
        :key="stop.key + '-' + index"
      >
        <div
          class="pipeline-stop"
          :class="{
            active: index === displayIndex,
            passed: index < displayIndex,
            failed: index === haltIndex && index === displayIndex && isFailureStop
          }"
        >
          {{ stop.label }}
        </div>
        <div
          v-if="index < stops.length - 1"
          class="pipeline-arrow"
          :class="{ passed: index < displayIndex }"
        >
          →
        </div>
      </template>
    </div>

    <p
      v-if="explanationVisible"
      class="pipeline-explanation"
      :class="{ 'pipeline-explanation-fail': isFailureStop }"
    >
      {{ result.explanation }}
    </p>
  </div>
</template>

<script>
import { computeStops, computeHaltIndex } from '@/flow-mode/engine/pipelineStops'

/**
 * Displays a use-case request token moving through the MVC pipeline:
 * Request → Controller → Model → View → Response.
 * Purely presentational — parent advances `stopIndex`.
 *
 * @vue-prop {Object} useCase - The use case being simulated.
 * @vue-prop {Object} result - Its resolution result.
 * @vue-prop {int} stopIndex - How far the animation has advanced.
 */
export default {
  name: 'RequestPipeline',
  props: {
    useCase: { type: Object, required: true },
    result: { type: Object, required: true },
    stopIndex: { type: Number, default: 0 }
  },
  computed: {
    stops () {
      return computeStops(this.useCase)
    },
    haltIndex () {
      return computeHaltIndex(this.stops, this.useCase, this.result)
    },
    displayIndex () {
      return Math.min(this.stopIndex, this.haltIndex)
    },
    isFailureStop () {
      return this.result.outcome === 'failed'
    },
    explanationVisible () {
      return this.displayIndex >= this.haltIndex
    }
  }
}
</script>

<style scoped>
.request-pipeline {
  text-align: center;
  color: #fff;
  padding: 0.6rem;
}

.pipeline-stops {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.pipeline-stop {
  padding: 0.7rem 1.1rem;
  border: 1px solid #555;
  border-radius: 0.4rem;
  background: #2b2b2b;
  font-size: 0.95rem;
  font-weight: 700;
  opacity: 0.4;
  transition: opacity 0.2s, border-color 0.2s;
  min-width: 5.5rem;
}

.pipeline-stop.passed {
  opacity: 0.8;
  border-color: #8bff8b;
}

.pipeline-stop.active {
  opacity: 1;
  border-color: #ffc46b;
  box-shadow: 0 0 0.5rem rgba(255, 214, 0, 0.6);
}

.pipeline-stop.failed {
  border-color: #ff2d2d;
  box-shadow: 0 0 0.6rem rgba(255, 45, 45, 0.7);
  color: #ff8b8b;
}

.pipeline-arrow {
  padding: 0 0.25rem;
  opacity: 0.3;
}

.pipeline-arrow.passed {
  opacity: 0.9;
  color: #8bff8b;
}

.pipeline-explanation {
  margin-top: 0.6rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #8bff8b;
}

.pipeline-explanation-fail {
  color: #ff8b8b;
}
</style>
