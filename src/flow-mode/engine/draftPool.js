/**
 * Generates the 3-card pools offered during drafting.
 *
 * @module flow-mode/engine/draftPool
 */

import { LAYERS } from '@/flow-mode/engine/constants'
import { CARDS } from '@/flow-mode/data/cards'
import { rngShuffle } from '@/flow-mode/engine/rng'

/**
 * Generates a balanced pool of 3 cards to offer a player.
 *
 * Balancing rule:
 * 1. Start from every card not in `excludeIds` (cards already drafted).
 * 2. Group the remaining cards by layer:
 *    - If 3+ layers still have an available card, pick 3 distinct random
 *      layers and 1 random card from each (maximum layer variety).
 *    - If exactly 2 layers have an available card, pick 2 cards from one
 *      (randomly chosen) layer and 1 from the other, rather than ever
 *      offering 3 cards from the same layer while a second layer has stock.
 *    - If only 1 layer has an available card (a safety net that should not
 *      occur during a normal 5-pick draft, since each layer starts with 5
 *      cards), offer up to 3 random cards from it.
 * 3. The final 3 (or fewer, if not enough cards remain anywhere) are shuffled.
 *
 * @param {function(): number} rng - A rng function created by createRng.
 * @param {string[]} excludeIds - Card ids to exclude (already drafted/offered).
 * @return {FlowCard[]} Up to 3 cards to offer.
 */
function generateDraftPool (rng, excludeIds) {
  const isAvailable = card => !excludeIds.includes(card.id)

  const byLayer = {}
  for (const layer of LAYERS) {
    byLayer[layer] = CARDS.filter(c => c.layer === layer && isAvailable(c))
  }
  const eligibleLayers = LAYERS.filter(layer => byLayer[layer].length > 0)

  let picked = []

  if (eligibleLayers.length >= 3) {
    const chosenLayers = rngShuffle(rng, eligibleLayers).slice(0, 3)
    picked = chosenLayers.map(layer => rngShuffle(rng, byLayer[layer])[0])
  } else if (eligibleLayers.length === 2) {
    const [heavyLayer, lightLayer] = rngShuffle(rng, eligibleLayers)
    const heavyPicks = rngShuffle(rng, byLayer[heavyLayer]).slice(0, 2)
    const lightPicks = rngShuffle(rng, byLayer[lightLayer]).slice(0, 1)
    picked = [...heavyPicks, ...lightPicks]
  } else if (eligibleLayers.length === 1) {
    picked = rngShuffle(rng, byLayer[eligibleLayers[0]]).slice(0, 3)
  }

  return rngShuffle(rng, picked)
}

export { generateDraftPool }
