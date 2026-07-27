/**
 * Builds a four-use-case schedule for a match with progressive difficulty.
 *
 * @module flow-mode/engine/useCaseSchedule
 */

import { USE_CASES } from '@/flow-mode/data/useCases'
import { ITERATIONS_PER_MATCH, DIFFICULTY } from '@/flow-mode/engine/constants'
import { rngPick, rngShuffle } from '@/flow-mode/engine/rng'

/**
 * Preferred difficulty progression across the four iterations.
 * Falls back to other unused difficulties when a tier is exhausted.
 */
const TARGET_DIFFICULTIES = [
  DIFFICULTY.EASY,
  DIFFICULTY.MEDIUM,
  DIFFICULTY.MEDIUM,
  DIFFICULTY.HARD
]

/**
 * Picks one unused use case near the target difficulty.
 * @param {function(): number} rng - Seeded rng.
 * @param {UseCase[]} remaining - Unused use cases.
 * @param {int} targetDifficulty - Preferred difficulty.
 * @return {UseCase} Chosen use case.
 * @private
 */
function pickNearDifficulty (rng, remaining, targetDifficulty) {
  const exact = remaining.filter(uc => uc.difficulty === targetDifficulty)
  if (exact.length > 0) {
    return rngPick(rng, exact)
  }

  const sorted = remaining.slice().sort((a, b) =>
    Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty))
  const bestDistance = Math.abs(sorted[0].difficulty - targetDifficulty)
  const closest = sorted.filter(uc =>
    Math.abs(uc.difficulty - targetDifficulty) === bestDistance)
  return rngPick(rng, closest)
}

/**
 * Selects four unique use cases with progressive difficulty for a match.
 * @param {function(): number} rng - The match's seeded rng.
 * @return {UseCase[]} Exactly {@link ITERATIONS_PER_MATCH} use cases.
 */
function buildUseCaseSchedule (rng) {
  const remaining = rngShuffle(rng, USE_CASES.slice())
  const schedule = []

  for (let i = 0; i < ITERATIONS_PER_MATCH; i++) {
    const chosen = pickNearDifficulty(rng, remaining, TARGET_DIFFICULTIES[i])
    schedule.push(chosen)
    const index = remaining.findIndex(uc => uc.id === chosen.id)
    remaining.splice(index, 1)
  }

  return schedule
}

export { buildUseCaseSchedule, TARGET_DIFFICULTIES }
