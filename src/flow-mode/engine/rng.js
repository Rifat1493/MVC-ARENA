/**
 * A tiny deterministic pseudo-random number generator (mulberry32) used to
 * build the shared request queue and other Flow Mode randomness.
 *
 * Using a seeded RNG (rather than `Math.random`) lets a whole match be
 * reproduced from a single seed, and lets both players' round queues be
 * generated identically from the same seed.
 *
 * @module flow-mode/engine/rng
 */

/**
 * Creates a seeded pseudo-random number generator.
 * @param {int} seed - The seed to initialize the generator with.
 * @return {function(): number} A function that returns the next float in [0, 1).
 */
function createRng (seed) {
  let a = seed >>> 0
  return function rng () {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Generates a random 32-bit seed using `Math.random` (used to start a new
 * match; not itself deterministic).
 * @return {int} A random seed.
 */
function randomSeed () {
  return Math.floor(Math.random() * 0xFFFFFFFF)
}

/**
 * Returns a random integer in [0, maxExclusive) using the given rng.
 * @param {function(): number} rng - A rng function created by {@link createRng}.
 * @param {int} maxExclusive - The exclusive upper bound.
 * @return {int} A random integer.
 */
function rngInt (rng, maxExclusive) {
  return Math.floor(rng() * maxExclusive)
}

/**
 * Picks a random element from the given array using the given rng.
 * @param {function(): number} rng - A rng function created by {@link createRng}.
 * @param {Array} array - The array to pick from. Must not be empty.
 * @return {*} A random element from the array.
 */
function rngPick (rng, array) {
  return array[rngInt(rng, array.length)]
}

/**
 * Returns a new array containing the given array's elements in a random
 * order (Fisher-Yates), using the given rng. Does not modify the input array.
 * @param {function(): number} rng - A rng function created by {@link createRng}.
 * @param {Array} array - The array to shuffle.
 * @return {Array} A new, shuffled array.
 */
function rngShuffle (rng, array) {
  const result = array.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = rngInt(rng, i + 1);
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export { createRng, randomSeed, rngInt, rngPick, rngShuffle }
