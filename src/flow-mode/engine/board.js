/**
 * Manages a single Flow Mode player's board: the cards they've selected and
 * where those cards are placed across the three layer columns.
 *
 * @module flow-mode/engine/board
 */

import { LAYERS } from '@/flow-mode/engine/constants'
import { cardById } from '@/flow-mode/data/cards'

/**
 * @typedef {Object} BoardSlot
 * @prop {string} cardId - The id of the placed card.
 * @prop {bool} disabled - Reserved for display compatibility (always false now).
 */

/**
 * @typedef {Object} PlayerBoard
 * @prop {string} playerId - 'p1' | 'p2'.
 * @prop {string} displayName - The player's display name.
 * @prop {bool} isBot - True if this player is controlled by the bot strategy.
 * @prop {string[]} drafted - Ordered ids of every card selected so far.
 * @prop {Object} layers - `{ controller: BoardSlot[], model: BoardSlot[], view: BoardSlot[] }`.
 * @prop {int} roundScore - Points scored in the current iteration (0 or 1).
 * @prop {int} matchScore - Cumulative fulfilled use cases.
 * @prop {int} requirementsFulfilled - Cumulative required cards present (tiebreaker).
 */

/**
 * Creates a new, empty player board.
 * @param {string} playerId - 'p1' | 'p2'.
 * @param {string} displayName - The player's display name.
 * @param {bool} [isBot=false] - True if this player is bot-controlled.
 * @return {PlayerBoard} A new player board.
 */
function createPlayerBoard (playerId, displayName, isBot = false) {
  return {
    playerId,
    displayName,
    isBot,
    drafted: [],
    layers: { controller: [], model: [], view: [] },
    roundScore: 0,
    matchScore: 0,
    requirementsFulfilled: 0
  }
}

/**
 * Attempts to place a selected card into a layer column on the board.
 *
 * @param {PlayerBoard} board - The board to place the card on.
 * @param {string} cardId - The id of the card to place.
 * @param {string} layer - The layer column to place it in.
 * @return {{ok: bool, reason: (string|undefined)}} Whether the placement succeeded.
 */
function placeCard (board, cardId, layer) {
  if (!LAYERS.includes(layer)) {
    return { ok: false, reason: `Not a valid layer: ${layer}` }
  }
  const card = cardById(cardId)
  if (!card) {
    return { ok: false, reason: `Unknown card: ${cardId}` }
  }
  if (card.layer !== layer) {
    return { ok: false, reason: `${card.name} belongs in the ${card.layer} layer, not ${layer}.` }
  }
  if (!board.drafted.includes(cardId)) {
    return { ok: false, reason: `${card.name} has not been selected.` }
  }
  const alreadyPlaced = LAYERS.some(l => board.layers[l].some(slot => slot.cardId === cardId))
  if (alreadyPlaced) {
    return { ok: false, reason: `${card.name} is already placed.` }
  }

  board.layers[layer].push({ cardId, disabled: false })
  return { ok: true }
}

/**
 * Places every selected card that is not already on the board into its
 * native layer. Useful for bots and for auto-completing placement.
 * @param {PlayerBoard} board - The board to update.
 */
function placeAllUnplacedCards (board) {
  const placedIds = new Set(LAYERS.flatMap(layer => board.layers[layer].map(slot => slot.cardId)))
  for (const cardId of board.drafted) {
    if (placedIds.has(cardId)) { continue }
    const card = cardById(cardId)
    if (card) { placeCard(board, cardId, card.layer) }
  }
}

export {
  createPlayerBoard,
  placeCard,
  placeAllUnplacedCards
}
