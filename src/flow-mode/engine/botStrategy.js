/**
 * A simple, rule-based (no lookahead) bot opponent for Flow Mode, matching
 * this project's existing AI design philosophy (see
 * `src/classes/AIHandler/PlayBestCard.js`: a greedy, single-ply priority list).
 *
 * @module flow-mode/engine/botStrategy
 */

import { LAYERS } from '@/flow-mode/engine/constants'
import { cardById } from '@/flow-mode/data/cards'
import { placeCard } from '@/flow-mode/engine/board'
import { rngPick } from '@/flow-mode/engine/rng'

/**
 * Counts how many drafted cards a board has in each layer.
 * @param {PlayerBoard} board - The bot's board.
 * @return {Object} `{ controller: int, model: int, view: int }`.
 * @private
 */
function countByLayer (board) {
  const counts = { controller: 0, model: 0, view: 0 }
  for (const cardId of board.drafted) {
    const card = cardById(cardId)
    if (card) { counts[card.layer]++ }
  }
  return counts
}

/**
 * Returns true if the board already has (drafted) a guard blocking the given
 * threat type.
 * @param {PlayerBoard} board - The bot's board.
 * @param {string} threatType - The threat type to check for.
 * @return {bool} True if a guard for that threat has already been drafted.
 * @private
 */
function hasGuardFor (board, threatType) {
  return board.drafted.some(id => {
    const card = cardById(id)
    return card && card.blocks === threatType
  })
}

/**
 * Chooses which of the 3 offered draft cards the bot should pick.
 *
 * Priority order:
 * 1. A guard for a threat type the forecast flags, if the bot doesn't have
 *    one yet.
 * 2. A functional (route/handler/template) card for a layer where the bot
 *    currently has zero cards.
 * 3. The card whose layer currently has the fewest drafted cards (keeps the
 *    board balanced).
 * Ties are broken randomly.
 *
 * @param {function(): number} rng - The bot's rng function.
 * @param {FlowCard[]} options - The 3 cards offered.
 * @param {PlayerBoard} board - The bot's board so far.
 * @param {Object} forecast - The current round's forecast (may be null before round 1).
 * @return {string} The chosen card's id.
 */
function chooseBotDraftPick (rng, options, board, forecast) {
  const flaggedThreats = forecast ? forecast.threatTypesPresent : []

  const neededGuards = options.filter(c =>
    c.kind === 'guard' && flaggedThreats.includes(c.blocks) && !hasGuardFor(board, c.blocks))
  if (neededGuards.length > 0) {
    return rngPick(rng, neededGuards).id
  }

  const counts = countByLayer(board)
  const emptyLayerCards = options.filter(c => c.kind !== 'guard' && counts[c.layer] === 0)
  if (emptyLayerCards.length > 0) {
    return rngPick(rng, emptyLayerCards).id
  }

  let lowestCount = Infinity
  for (const card of options) {
    if (counts[card.layer] < lowestCount) { lowestCount = counts[card.layer] }
  }
  const balancingCards = options.filter(c => counts[c.layer] === lowestCount)
  return rngPick(rng, balancingCards).id
}

/**
 * Places every one of the bot's drafted cards that isn't already on the
 * board into its own layer. Trivial - a card can only ever go in its own
 * layer, so there's no real decision to make. Mutates the board.
 * @param {PlayerBoard} board - The bot's board.
 */
function autoPlaceBotCards (board) {
  const placedIds = new Set(LAYERS.flatMap(layer => board.layers[layer].map(slot => slot.cardId)))
  for (const cardId of board.drafted) {
    if (placedIds.has(cardId)) { continue }
    const card = cardById(cardId)
    if (card) { placeCard(board, cardId, card.layer) }
  }
}

export { chooseBotDraftPick, autoPlaceBotCards }
