import { generateDraftPool } from '@/flow-mode/engine/draftPool'
import { createRng } from '@/flow-mode/engine/rng'
import { CARDS, cardsByLayer } from '@/flow-mode/data/cards'

describe('generateDraftPool', () => {
  test('returns 3 cards when nothing is excluded', () => {
    const pool = generateDraftPool(createRng(1), [])
    expect(pool).toHaveLength(3)
  })

  test('never offers a card already in excludeIds', () => {
    const excluded = ['controller-routing', 'model-database', 'view-web-view']
    for (let seed = 0; seed < 20; seed++) {
      const pool = generateDraftPool(createRng(seed), excluded)
      for (const card of pool) {
        expect(excluded).not.toContain(card.id)
      }
    }
  })

  test('offers 3 distinct layers when all 3 layers have cards available', () => {
    for (let seed = 0; seed < 20; seed++) {
      const pool = generateDraftPool(createRng(seed), [])
      const layers = new Set(pool.map(c => c.layer))
      expect(layers.size).toEqual(3)
    }
  })

  test('never offers 3-of-the-same-layer while a 2nd layer still has stock', () => {
    // Exhaust the view layer entirely; controller and model still have cards.
    const excludeIds = cardsByLayer('view').map(c => c.id)
    for (let seed = 0; seed < 20; seed++) {
      const pool = generateDraftPool(createRng(seed), excludeIds)
      const layers = new Set(pool.map(c => c.layer))
      expect(layers.size).toBeGreaterThanOrEqual(2)
    }
  })

  test('falls back to a single layer once only one has cards left', () => {
    const excludeIds = [...cardsByLayer('view').map(c => c.id), ...cardsByLayer('model').map(c => c.id)]
    const pool = generateDraftPool(createRng(3), excludeIds)
    expect(pool.every(c => c.layer === 'controller')).toBe(true)
  })

  test('is deterministic for the same seed', () => {
    const poolA = generateDraftPool(createRng(99), [])
    const poolB = generateDraftPool(createRng(99), [])
    expect(poolA).toEqual(poolB)
  })

  test('returns fewer than 3 when the whole card set is nearly exhausted', () => {
    const excludeIds = CARDS.map(c => c.id).slice(0, CARDS.length - 1)
    const pool = generateDraftPool(createRng(5), excludeIds)
    expect(pool.length).toBeLessThanOrEqual(3)
    expect(pool.length).toBeGreaterThan(0)
  })
})
