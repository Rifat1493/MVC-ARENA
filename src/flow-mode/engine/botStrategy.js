/**
 * Rule-based bot opponent for use-case Flow Mode.
 *
 * Priority: cover missing required cards for the current use case, then fill
 * remaining quotas / upgrade slots with useful security and coverage cards.
 *
 * @module flow-mode/engine/botStrategy
 */

import { cardById } from '@/flow-mode/data/cards'
import {
  INITIAL_CONTROLLER_CARDS,
  INITIAL_MODEL_CARDS,
  INITIAL_VIEW_CARDS,
  INITIAL_CARD_TOTAL,
  UPGRADE_CARDS_PER_TURN
} from '@/flow-mode/engine/constants'
import { availableCards, countSelectedByLayer } from '@/flow-mode/engine/selection'
import { placeAllUnplacedCards } from '@/flow-mode/engine/board'
import { rngPick, rngShuffle } from '@/flow-mode/engine/rng'

/** Prefer guards / defenses when filling leftover slots. */
const DEFENSE_PRIORITY = [
  'controller-authentication',
  'model-orm',
  'view-output-validation',
  'controller-csrf-protection',
  'controller-authorization',
  'controller-rate-limiting',
  'model-data-validation',
  'model-secrets-manager',
  'model-file-storage-adapter'
]

/**
 * Cards still needed from the current use case that the bot does not own.
 * @param {PlayerBoard} board - Bot board.
 * @param {UseCase} useCase - Current use case.
 * @param {string[]} [alreadyPicking=[]] - Cards already chosen in this selection.
 * @return {FlowCard[]} Missing required cards that are still available.
 * @private
 */
function missingRequiredCards (board, useCase, alreadyPicking = []) {
  const owned = new Set([...board.drafted, ...alreadyPicking])
  return useCase.requiredCardIds
    .filter(id => !owned.has(id))
    .map(id => cardById(id))
    .filter(Boolean)
}

/**
 * Chooses the bot's initial 2 Controller / 2 Model / 1 View selection.
 * @param {function(): number} rng - Bot rng.
 * @param {PlayerBoard} board - Bot board (drafted should be empty).
 * @param {UseCase} useCase - Revealed use case.
 * @return {string[]} Selected card ids.
 */
function chooseBotInitialSelection (rng, board, useCase) {
  const selected = []
  const needed = missingRequiredCards(board, useCase)

  for (const card of needed) {
    const counts = countSelectedByLayer(selected)
    const quotas = {
      controller: INITIAL_CONTROLLER_CARDS,
      model: INITIAL_MODEL_CARDS,
      view: INITIAL_VIEW_CARDS
    }
    if (counts[card.layer] < quotas[card.layer] && !selected.includes(card.id)) {
      selected.push(card.id)
    }
    if (selected.length >= INITIAL_CARD_TOTAL) { break }
  }

  const quotas = {
    controller: INITIAL_CONTROLLER_CARDS,
    model: INITIAL_MODEL_CARDS,
    view: INITIAL_VIEW_CARDS
  }
  const pool = rngShuffle(rng, availableCards(selected))

  for (const layer of ['controller', 'model', 'view']) {
    while (countSelectedByLayer(selected)[layer] < quotas[layer]) {
      const preferred = DEFENSE_PRIORITY
        .map(id => cardById(id))
        .filter(c => c && c.layer === layer && !selected.includes(c.id))
      const candidates = preferred.length > 0
        ? preferred
        : pool.filter(c => c.layer === layer && !selected.includes(c.id))
      if (candidates.length === 0) { break }
      selected.push(rngPick(rng, candidates).id)
    }
  }

  return selected.slice(0, INITIAL_CARD_TOTAL)
}

/**
 * Chooses exactly two upgrade cards, preferring missing required cards.
 * @param {function(): number} rng - Bot rng.
 * @param {PlayerBoard} board - Bot board.
 * @param {UseCase} useCase - Revealed use case.
 * @return {string[]} Two card ids.
 */
function chooseBotUpgradeSelection (rng, board, useCase) {
  const selected = []
  const needed = missingRequiredCards(board, useCase)

  for (const card of needed) {
    if (selected.length >= UPGRADE_CARDS_PER_TURN) { break }
    selected.push(card.id)
  }

  if (selected.length < UPGRADE_CARDS_PER_TURN) {
    const pool = availableCards([...board.drafted, ...selected])
    const preferred = DEFENSE_PRIORITY
      .map(id => cardById(id))
      .filter(c => c && pool.some(p => p.id === c.id))
    const fillers = preferred.length > 0 ? preferred : rngShuffle(rng, pool)
    for (const card of fillers) {
      if (selected.length >= UPGRADE_CARDS_PER_TURN) { break }
      if (!selected.includes(card.id)) { selected.push(card.id) }
    }
  }

  while (selected.length < UPGRADE_CARDS_PER_TURN) {
    const leftover = availableCards([...board.drafted, ...selected])
    if (leftover.length === 0) { break }
    selected.push(rngPick(rng, leftover).id)
  }

  return selected.slice(0, UPGRADE_CARDS_PER_TURN)
}

/**
 * Places every unplaced selected card into its native layer.
 * @param {PlayerBoard} board - Bot board.
 */
function autoPlaceBotCards (board) {
  placeAllUnplacedCards(board)
}

export {
  chooseBotInitialSelection,
  chooseBotUpgradeSelection,
  autoPlaceBotCards,
  missingRequiredCards
}
