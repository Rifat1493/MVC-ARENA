import { buildRoundRequestQueue, buildSuddenDeathRequest, DATA_ARCHETYPES } from '@/flow-mode/engine/requestQueue'
import { createRng } from '@/flow-mode/engine/rng'
import { THREAT_TARGET_LAYER } from '@/flow-mode/engine/constants'

describe('buildRoundRequestQueue', () => {
  test('returns 5 requests: 3 data and 2 threat', () => {
    const queue = buildRoundRequestQueue(createRng(1), 1)
    expect(queue).toHaveLength(5)
    expect(queue.filter(r => r.kind === 'data')).toHaveLength(3)
    expect(queue.filter(r => r.kind === 'threat')).toHaveLength(2)
  })

  test('every data request matches a known archetype', () => {
    const queue = buildRoundRequestQueue(createRng(2), 1)
    for (const req of queue.filter(r => r.kind === 'data')) {
      const matches = DATA_ARCHETYPES.some(a =>
        a.route === req.route && a.dataDomain === req.dataDomain && a.outputType === req.outputType)
      expect(matches).toBe(true)
    }
  })

  test('every threat request has the correct targetLayer for its type', () => {
    const queue = buildRoundRequestQueue(createRng(3), 1)
    for (const req of queue.filter(r => r.kind === 'threat')) {
      expect(req.targetLayer).toEqual(THREAT_TARGET_LAYER[req.threatType])
    }
  })

  test('all request ids within a round are unique', () => {
    const queue = buildRoundRequestQueue(createRng(4), 1)
    const ids = queue.map(r => r.id)
    expect(new Set(ids).size).toEqual(ids.length)
  })

  test('is deterministic: same seed and round produce the identical queue', () => {
    const queueA = buildRoundRequestQueue(createRng(42), 1)
    const queueB = buildRoundRequestQueue(createRng(42), 1)
    expect(queueA).toEqual(queueB)
  })

  test('the same shared rng produces different queues for consecutive rounds', () => {
    const rng = createRng(42)
    const round1 = buildRoundRequestQueue(rng, 1)
    const round2 = buildRoundRequestQueue(rng, 2)
    expect(round1).not.toEqual(round2)
  })
})

describe('buildSuddenDeathRequest', () => {
  test('returns a single valid data or threat request', () => {
    const req = buildSuddenDeathRequest(createRng(1), 0)
    expect(['data', 'threat']).toContain(req.kind)
  })

  test('is deterministic for the same seed', () => {
    const reqA = buildSuddenDeathRequest(createRng(7), 0)
    const reqB = buildSuddenDeathRequest(createRng(7), 0)
    expect(reqA).toEqual(reqB)
  })
})
