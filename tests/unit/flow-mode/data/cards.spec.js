import fs from 'fs'
import path from 'path'
import { CARDS, cardById, cardsByLayer } from '@/flow-mode/data/cards'

describe('flow-mode cards data', () => {
  test('has exactly 16 cards (the same Model/View/Controller cards as Base Mode)', () => {
    expect(CARDS).toHaveLength(16)
  })

  test('has the same per-layer counts as Base Mode\'s cardCatalog (6/6/4)', () => {
    expect(cardsByLayer('controller')).toHaveLength(6)
    expect(cardsByLayer('model')).toHaveLength(6)
    expect(cardsByLayer('view')).toHaveLength(4)
  })

  test('has exactly 1 guard per layer', () => {
    for (const layer of ['controller', 'model', 'view']) {
      const guards = cardsByLayer(layer).filter(c => c.kind === 'guard')
      expect(guards).toHaveLength(1)
    }
  })

  test('every id is unique', () => {
    const ids = CARDS.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('guards have blocks set and matches null; non-guards the opposite', () => {
    for (const card of CARDS) {
      if (card.kind === 'guard') {
        expect(card.blocks).toEqual(expect.any(String))
        expect(card.matches).toBeNull()
      } else {
        expect(card.matches).toEqual(expect.any(String))
        expect(card.blocks).toBeNull()
      }
    }
  })

  test('every card has a non-empty description', () => {
    for (const card of CARDS) {
      expect(card.description.length).toBeGreaterThan(0)
    }
  })

  test('every card\'s image file actually exists in public/', () => {
    for (const card of CARDS) {
      expect(card.image).toMatch(/^static\/cardImages\/.+\.png$/)
      const diskPath = path.join(__dirname, '..', '..', '..', '..', 'public', card.image)
      expect(fs.existsSync(diskPath)).toBe(true)
    }
  })

  test('every card name matches a real Base Mode component name', () => {
    const realNames = [
      'Routing', 'Middleware', 'Authorization', 'CSRF Protection', 'Rate Limiting', 'Authentication',
      'Database', 'Caching', 'Data Validation', 'File Storage Adapter', 'Secrets Manager', 'ORM',
      'Web View', 'Mobile View', 'CLI View', 'Output Validation'
    ]
    for (const card of CARDS) {
      expect(realNames).toContain(card.name)
    }
  })

  describe('cardById', () => {
    test('finds a known card', () => {
      expect(cardById('controller-authentication').name).toEqual('Authentication')
    })

    test('returns undefined for an unknown id', () => {
      expect(cardById('nope')).toBeUndefined()
    })
  })
})
