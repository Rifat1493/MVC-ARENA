/**
 * A tiny in-memory handoff for the player setup chosen on the Home page, so
 * `Home.vue` can start Flow Mode with a plain `/flow` URL instead of leaking
 * player names into the query string. Flow Mode keeps its match state out of
 * Vuex by design, so this is a minimal module-level singleton rather than a
 * store action - it only ever holds one pending setup, read once and cleared.
 *
 * @module flow-mode/pendingSetup
 */

let pendingSetup = null

/**
 * Stashes the setup to hand off to `FlowModePage` on its next `created()`.
 * @param {Object} setup - `{ player1Name, player2IsBot, player2Name }`.
 */
function setPendingSetup (setup) {
  pendingSetup = setup
}

/**
 * Reads and clears the pending setup.
 * @return {Object|null} The stashed setup, or null if there isn't one (e.g.
 * a direct/bookmarked navigation to `/flow`).
 */
function takePendingSetup () {
  const setup = pendingSetup
  pendingSetup = null
  return setup
}

export { setPendingSetup, takePendingSetup }
