<template>
  <div id="app">
    <div class="device-warning">
      <div class="device-warning-box">
        
        <p>
          For the best experience, please open MVC ARENA on a laptop or desktop PC.
        </p>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
/**
 * Root Vue application shell. Shows a full-screen notice on phones and
 * tablets asking players to use a laptop instead.
 */
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

.device-warning {
  display: none;
}

@media (max-width: 1024px) {
  .device-warning {
    display: flex;
    position: fixed;
    inset: 0;
    z-index: 10000;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: #1a1a1a;
    color: #fff;
  }

  .device-warning-box {
    max-width: 26rem;
    padding: 1.5rem 1.25rem;
    border: 2px solid #ffc46b;
    border-radius: 0.6rem;
    background: #2b2b2b;
  }

  .device-warning-box h2 {
    margin: 0 0 0.75rem;
    color: #ffc46b;
    font-size: 1.4rem;
  }

  .device-warning-box p {
    margin: 0;
    line-height: 1.45;
    color: #ddd;
    font-size: 1rem;
  }
}
</style>
