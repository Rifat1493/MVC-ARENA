import {
  createPlayerBoard,
  findActiveCardByMatch,
  findActiveGuardByBlocks,
  placeCard,
  applyDamage,
  repairBoard
} from '@/flow-mode/engine/board'

describe('board', () => {
  describe('createPlayerBoard', () => {
    test('creates an empty board', () => {
      const board = createPlayerBoard('p1', 'Alice')
      expect(board.playerId).toEqual('p1')
      expect(board.displayName).toEqual('Alice')
      expect(board.isBot).toBe(false)
      expect(board.drafted).toEqual([])
      expect(board.layers).toEqual({ controller: [], model: [], view: [] })
      expect(board.roundScore).toEqual(0)
      expect(board.matchScore).toEqual(0)
      expect(board.penetrations).toEqual(0)
    })

    test('defaults isBot to false, but accepts true', () => {
      const board = createPlayerBoard('p2', 'Bot', true)
      expect(board.isBot).toBe(true)
    })
  })

  describe('placeCard', () => {
    test('places a drafted card into its own layer', () => {
      const board = createPlayerBoard('p1', 'Alice')
      board.drafted.push('controller-routing')

      const result = placeCard(board, 'controller-routing', 'controller')

      expect(result.ok).toBe(true)
      expect(board.layers.controller).toEqual([{ cardId: 'controller-routing', disabled: false }])
    })

    test('rejects a card placed in the wrong layer', () => {
      const board = createPlayerBoard('p1', 'Alice')
      board.drafted.push('controller-routing')

      const result = placeCard(board, 'controller-routing', 'model')

      expect(result.ok).toBe(false)
      expect(result.reason).toMatch(/controller/)
      expect(board.layers.model).toEqual([])
    })

    test('rejects a card that has not been drafted', () => {
      const board = createPlayerBoard('p1', 'Alice')
      const result = placeCard(board, 'controller-routing', 'controller')
      expect(result.ok).toBe(false)
      expect(result.reason).toMatch(/drafted/)
    })

    test('rejects an unknown card id', () => {
      const board = createPlayerBoard('p1', 'Alice')
      board.drafted.push('nonexistent')
      const result = placeCard(board, 'nonexistent', 'controller')
      expect(result.ok).toBe(false)
      expect(result.reason).toMatch(/Unknown card/)
    })

    test('rejects placing the same card twice', () => {
      const board = createPlayerBoard('p1', 'Alice')
      board.drafted.push('controller-routing')
      placeCard(board, 'controller-routing', 'controller')

      const second = placeCard(board, 'controller-routing', 'controller')

      expect(second.ok).toBe(false)
      expect(second.reason).toMatch(/already placed/)
      expect(board.layers.controller).toHaveLength(1)
    })

    test('rejects an invalid layer name', () => {
      const board = createPlayerBoard('p1', 'Alice')
      board.drafted.push('controller-routing')
      const result = placeCard(board, 'controller-routing', 'not-a-layer')
      expect(result.ok).toBe(false)
      expect(result.reason).toMatch(/valid layer/)
    })
  })

  describe('findActiveCardByMatch', () => {
    test('finds a matching, non-disabled slot', () => {
      const slots = [{ cardId: 'controller-routing', disabled: false }]
      expect(findActiveCardByMatch(slots, 'Routing')).toEqual(slots[0])
    })

    test('skips disabled slots', () => {
      const slots = [{ cardId: 'controller-routing', disabled: true }]
      expect(findActiveCardByMatch(slots, 'Routing')).toBeNull()
    })

    test('returns null when nothing matches', () => {
      const slots = [{ cardId: 'controller-routing', disabled: false }]
      expect(findActiveCardByMatch(slots, 'Middleware')).toBeNull()
    })
  })

  describe('findActiveGuardByBlocks', () => {
    test('finds an active guard blocking the given threat', () => {
      const slots = [{ cardId: 'controller-authentication', disabled: false }]
      expect(findActiveGuardByBlocks(slots, 'SESSION_FORGERY')).toEqual(slots[0])
    })

    test('skips disabled guards', () => {
      const slots = [{ cardId: 'controller-authentication', disabled: true }]
      expect(findActiveGuardByBlocks(slots, 'SESSION_FORGERY')).toBeNull()
    })
  })

  describe('applyDamage / repairBoard', () => {
    test('applyDamage disables the given card', () => {
      const board = createPlayerBoard('p1', 'Alice')
      board.drafted.push('controller-routing')
      placeCard(board, 'controller-routing', 'controller')

      applyDamage(board, 'controller', 'controller-routing')

      expect(board.layers.controller[0].disabled).toBe(true)
    })

    test('applyDamage on an unknown card is a no-op', () => {
      const board = createPlayerBoard('p1', 'Alice')
      expect(() => applyDamage(board, 'controller', 'nonexistent')).not.toThrow()
    })

    test('repairBoard clears all disabled flags', () => {
      const board = createPlayerBoard('p1', 'Alice')
      board.drafted.push('controller-routing', 'controller-authentication')
      placeCard(board, 'controller-routing', 'controller')
      placeCard(board, 'controller-authentication', 'controller')
      applyDamage(board, 'controller', 'controller-routing')
      applyDamage(board, 'controller', 'controller-authentication')

      repairBoard(board)

      expect(board.layers.controller.every(s => !s.disabled)).toBe(true)
    })
  })
})
