<template>
  <div id="forecast-banner">
    <h3 class="forecast-title">
      Round {{ roundNumber }} Traffic Forecast
    </h3>

    <div class="forecast-bar">
      <div
        class="forecast-bar-data"
        :style="{ width: forecast.dataPct + '%' }"
      >
        {{ forecast.dataPct }}% data
      </div>
      <div
        class="forecast-bar-threat"
        :style="{ width: forecast.threatPct + '%' }"
      >
        {{ forecast.threatPct }}% threats
      </div>
    </div>

    <p class="forecast-headline">
      {{ forecast.headline }}
    </p>

    <button
      class="btn btn-success"
      @click="$emit('continue')"
    >
      Continue
    </button>
  </div>
</template>

<script>
/**
 * Shows the approximate, bucketed traffic forecast for an upcoming round.
 *
 * @vue-prop {Object} forecast - `{ dataPct, threatPct, threatTypesPresent, headline }`.
 * @vue-prop {int} roundNumber - The round this forecast is for.
 * @vue-event continue - Emitted when the player is ready to proceed.
 */
export default {
  name: 'ForecastBanner',
  props: {
    forecast: { type: Object, required: true },
    roundNumber: { type: Number, required: true }
  },
  emits: ['continue']
}
</script>

<style scoped>
#forecast-banner {
  max-width: 42rem;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #2b2b2b;
  border: 2px solid rgba(255, 214, 0, 0.75);
  border-radius: 0.8rem;
  color: #fff;
  text-align: center;
}

.forecast-title {
  margin: 0 0 1rem;
}

.forecast-bar {
  display: flex;
  width: 100%;
  height: 1.6rem;
  border-radius: 0.4rem;
  overflow: hidden;
  font-size: 0.7rem;
  margin-bottom: 1rem;
}

.forecast-bar-data {
  background: #6fa8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #06264d;
  font-weight: 700;
}

.forecast-bar-threat {
  background: #ff2d2d;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3d0000;
  font-weight: 700;
}

.forecast-headline {
  color: #ffc46b;
  font-weight: 700;
  margin-bottom: 1rem;
}
</style>
