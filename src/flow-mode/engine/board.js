/**
 * Manages a single Flow Mode player's board: the cards they've drafted and
 * where those cards are placed across the three layer columns.
 *
 * @module flow-mode/engine/board
 */

import { LAYERS } from '@/flow-mode/engine/constants'
import { cardById } from '@/flow-mode/data/cards'

/**
 * @typedef {Object} BoardSlot
 * @prop {string} cardId - The id of the placed card.
 * @prop {bool} disabled - True if the card has been disabled by a threat penetration this round.
 */

/**
 * @typedef {Object} PlayerBoard
 * @prop {string} playerId - 'p1' | 'p2'.
 * @prop {string} displayName - The player's display name.
 * @prop {bool} isBot - True if this player is controlled by the bot strategy.
 * @prop {string[]} drafted - Ordered ids of every card drafted so far (max 5).
 * @prop {Object} layers - `{ controller: BoardSlot[], model: BoardSlot[], view: BoardSlot[] }`.
 * @prop {int} roundScore - Points scored so far in the current round.
 * @prop {int} matchScore - Cumulative points scored across the match.
 * @prop {int} penetrations - Cumulative count of unblocked threats suffered (tiebreaker).
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
    penetrations: 0
  }
}

/**
 * Finds the first active (non-disabled) slot in the given layer whose card's
 * `matches` value equals the given value.
 * @param {BoardSlot[]} layerSlots - The slots for one layer of a board.
 * @param {string} matchValue - The route/domain/output value to look for.
 * @return {BoardSlot|null} The matching slot, or null if none found.
 */
function findActiveCardByMatch (layerSlots, matchValue) {
  for (const slot of layerSlots) {
    if (slot.disabled) { continue }
    const card = cardById(slot.cardId)
    if (card && card.matches === matchValue) {
      return slot
    }
  }
  return null
}

/**
 * Finds the first active (non-disabled) guard slot in the given layer that
 * blocks the given threat type.
 * @param {BoardSlot[]} layerSlots - The slots for one layer of a board.
 * @param {string} threatType - The threat type to look for a guard against.
 * @return {BoardSlot|null} The matching guard slot, or null if none found.
 */
function findActiveGuardByBlocks (layerSlots, threatType) {
  for (const slot of layerSlots) {
    if (slot.disabled) { continue }
    const card = cardById(slot.cardId)
    if (card && card.blocks === threatType) {
      return slot
    }
  }
  return null
}

/**
 * Attempts to place a drafted card into a layer column on the board.
 *
 * Rejects the placement if the card does not belong to that layer, or if it
 * is not in the player's `drafted` list, or if it is already placed. On
 * success, mutates `board.layers[layer]` by appending the new slot.
 *
 * @param {PlayerBoard} board - The board to place the card on.
 * @param {string} cardId - The id of the card to place.
 * @param {string} layer - The layer column to place it in.
 * @return {{ok: bool, reason: (string|undefined)}} Whether the placement succeeded,
 * and a reason if it did not.
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
    return { ok: false, reason: `${card.name} has not been drafted.` }
  }
  const alreadyPlaced = LAYERS.some(l => board.layers[l].some(slot => slot.cardId === cardId))
  if (alreadyPlaced) {
    return { ok: false, reason: `${card.name} is already placed.` }
  }

  board.layers[layer].push({ cardId, disabled: false })
  return { ok: true }
}

/**
 * Disables the given card in the given layer for the remainder of the round.
 * A disabled card is skipped by {@link findActiveCardByMatch} and
 * {@link findActiveGuardByBlocks} until it is repaired.
 * @param {PlayerBoard} board - The board to apply damage to.
 * @param {string} layer - The layer the damaged card is in.
 * @param {string} cardId - The id of the card to disable.
 */
function applyDamage (board, layer, cardId) {
  const slot = board.layers[layer].find(s => s.cardId === cardId)
  if (slot) {
    slot.disabled = true
  }
}

/**
 * Repairs all disabled cards on the board (called between rounds).
 * @param {PlayerBoard} board - The board to repair.
 */
function repairBoard (board) {
  for (const layer of LAYERS) {
    for (const slot of board.layers[layer]) {
      slot.disabled = false
    }
  }
}

export {
  createPlayerBoard,
  findActiveCardByMatch,
  findActiveGuardByBlocks,
  placeCard,
  applyDamage,
  repairBoard
}
