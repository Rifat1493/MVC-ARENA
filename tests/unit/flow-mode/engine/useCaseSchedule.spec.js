import { createRng } from '@/flow-mode/engine/rng'
import { buildUseCaseSchedule, TARGET_DIFFICULTIES } from '@/flow-mode/engine/useCaseSchedule'
import { ITERATIONS_PER_MATCH } from '@/flow-mode/engine/constants'

describe('useCaseSchedule', () => {
  test('returns exactly four unique use cases', () => {
    const schedule = buildUseCaseSchedule(createRng(42))
    expect(schedule).toHaveLength(ITERATIONS_PER_MATCH)
    const ids = schedule.map(uc => uc.id)
    expect(new Set(ids).size).toEqual(4)
  })

  test('same seed produces the same schedule', () => {
    expect(buildUseCaseSchedule(createRng(99))).toEqual(buildUseCaseSchedule(createRng(99)))
  })

  test('different seeds can produce different schedules', () => {
    const a = buildUseCaseSchedule(createRng(1)).map(uc => uc.id)
    const b = buildUseCaseSchedule(createRng(2)).map(uc => uc.id)
    expect(a).not.toEqual(b)
  })

  test('targets progressive difficulties when possible', () => {
    expect(TARGET_DIFFICULTIES).toEqual([1, 2, 2, 3])
  })
})
