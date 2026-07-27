/**
 * Validation helpers for initial (2 Controller / 2 Model / 1 View) and
 * upgrade (+2 any layer) card selections.
 *
 * @module flow-mode/engine/selection
 */

import { cardById, CARDS } from '@/flow-mode/data/cards'
import {
  LAYERS,
  INITIAL_CONTROLLER_CARDS,
  INITIAL_MODEL_CARDS,
  INITIAL_VIEW_CARDS,
  INITIAL_CARD_TOTAL,
  UPGRADE_CARDS_PER_TURN
} from '@/flow-mode/engine/constants'

/**
 * Counts selected card ids by MVC layer.
 * @param {string[]} cardIds - Selected card ids.
 * @return {{controller: int, model: int, view: int}} Layer counts.
 */
function countSelectedByLayer (cardIds) {
  const counts = { controller: 0, model: 0, view: 0 }
  for (const id of cardIds) {
    const card = cardById(id)
    if (card) { counts[card.layer]++ }
  }
  return counts
}

/**
 * Cards the player may still add (not already owned / drafted).
 * @param {string[]} ownedIds - Card ids already drafted.
 * @return {FlowCard[]} Available catalog cards.
 */
function availableCards (ownedIds) {
  const owned = new Set(ownedIds)
  return CARDS.filter(c => !owned.has(c.id))
}

/**
 * Validates an initial 2/2/1 selection.
 * @param {string[]} cardIds - Proposed selection.
 * @return {{ok: bool, reason: (string|undefined)}} Validation result.
 */
function validateInitialSelection (cardIds) {
  if (cardIds.length !== INITIAL_CARD_TOTAL) {
    return {
      ok: false,
      reason: `Select exactly ${INITIAL_CARD_TOTAL} cards (2 Controller, 2 Model, 1 View).`
    }
  }
  if (new Set(cardIds).size !== cardIds.length) {
    return { ok: false, reason: 'Duplicate cards are not allowed.' }
  }
  for (const id of cardIds) {
    if (!cardById(id)) {
      return { ok: false, reason: `Unknown card: ${id}` }
    }
  }
  const counts = countSelectedByLayer(cardIds)
  if (counts.controller !== INITIAL_CONTROLLER_CARDS ||
      counts.model !== INITIAL_MODEL_CARDS ||
      counts.view !== INITIAL_VIEW_CARDS) {
    return {
      ok: false,
      reason: `Need ${INITIAL_CONTROLLER_CARDS} Controller, ${INITIAL_MODEL_CARDS} Model, and ${INITIAL_VIEW_CARDS} View.`
    }
  }
  return { ok: true }
}

/**
 * Validates an upgrade selection of exactly two previously unowned cards.
 * @param {string[]} cardIds - Proposed upgrade picks.
 * @param {string[]} ownedIds - Cards already drafted.
 * @return {{ok: bool, reason: (string|undefined)}} Validation result.
 */
function validateUpgradeSelection (cardIds, ownedIds) {
  if (cardIds.length !== UPGRADE_CARDS_PER_TURN) {
    return {
      ok: false,
      reason: `Add exactly ${UPGRADE_CARDS_PER_TURN} new cards.`
    }
  }
  if (new Set(cardIds).size !== cardIds.length) {
    return { ok: false, reason: 'Duplicate cards are not allowed.' }
  }
  const owned = new Set(ownedIds)
  for (const id of cardIds) {
    if (!cardById(id)) {
      return { ok: false, reason: `Unknown card: ${id}` }
    }
    if (owned.has(id)) {
      const card = cardById(id)
      return { ok: false, reason: `${card.name} is already in your system.` }
    }
  }
  return { ok: true }
}

/**
 * Returns whether a selection is complete and valid for the current mode.
 * @param {'initial'|'upgrade'} mode - Selection mode.
 * @param {string[]} selectedIds - Currently toggled cards.
 * @param {string[]} ownedIds - Already drafted cards (upgrade only).
 * @return {bool} True if the player may confirm.
 */
function canConfirmSelection (mode, selectedIds, ownedIds = []) {
  if (mode === 'initial') {
    return validateInitialSelection(selectedIds).ok
  }
  return validateUpgradeSelection(selectedIds, ownedIds).ok
}

/**
 * Human-readable quota summary for the selection UI.
 * @param {'initial'|'upgrade'} mode - Selection mode.
 * @param {string[]} selectedIds - Currently toggled cards.
 * @return {string} Status text.
 */
function selectionStatusText (mode, selectedIds) {
  if (mode === 'upgrade') {
    return `Add ${selectedIds.length} / ${UPGRADE_CARDS_PER_TURN} new cards (any MVC layer).`
  }
  const counts = countSelectedByLayer(selectedIds)
  return `Selected ${counts.controller}/${INITIAL_CONTROLLER_CARDS} Controller, ` +
    `${counts.model}/${INITIAL_MODEL_CARDS} Model, ` +
    `${counts.view}/${INITIAL_VIEW_CARDS} View.`
}

export {
  countSelectedByLayer,
  availableCards,
  validateInitialSelection,
  validateUpgradeSelection,
  canConfirmSelection,
  selectionStatusText,
  LAYERS
}
