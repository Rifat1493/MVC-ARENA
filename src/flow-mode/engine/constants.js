/**
 * Shared constants for Flow Mode.
 *
 * @module flow-mode/engine/constants
 */

/** The three MVC layers a card/column can belong to. */
export const LAYERS = ['controller', 'model', 'view']

/**
 * The phases a FlowMatch moves through.
 *
 * Match loop:
 * useCase → select → build → simulate → iterationSummary
 * (repeated ITERATIONS_PER_MATCH times) → matchEnd
 */
export const PHASES = {
  SETUP: 'setup',
  USE_CASE: 'useCase',
  SELECT: 'select',
  BUILD: 'build',
  SIMULATE: 'simulate',
  ITERATION_SUMMARY: 'iterationSummary',
  MATCH_END: 'matchEnd'
}

/** Number of use-case iterations in a match. */
export const ITERATIONS_PER_MATCH = 4

/** Initial selection quotas by layer. */
export const INITIAL_CONTROLLER_CARDS = 2
export const INITIAL_MODEL_CARDS = 2
export const INITIAL_VIEW_CARDS = 1

/** Total cards required in the initial selection (2+2+1). */
export const INITIAL_CARD_TOTAL =
  INITIAL_CONTROLLER_CARDS + INITIAL_MODEL_CARDS + INITIAL_VIEW_CARDS

/** Cards each player may add before iterations 2–4. */
export const UPGRADE_CARDS_PER_TURN = 2

/** Difficulty tiers used when scheduling progressive use cases. */
export const DIFFICULTY = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3
}

/** Total wall-clock time for the automatic pipeline animation (ms). */
export const SIMULATION_DURATION_MS = 30000

