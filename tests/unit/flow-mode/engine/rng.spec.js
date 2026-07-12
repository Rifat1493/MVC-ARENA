import { createRng, randomSeed, rngInt, rngPick, rngShuffle } from '@/flow-mode/engine/rng'

describe('rng', () => {
  describe('createRng', () => {
    test('is deterministic for the same seed', () => {
      const a = createRng(42)
      const b = createRng(42)
      const seqA = [a(), a(), a(), a()]
      const seqB = [b(), b(), b(), b()]
      expect(seqA).toEqual(seqB)
    })

    test('produces different sequences for different seeds', () => {
      const a = createRng(1)
      const b = createRng(2)
      expect(a()).not.toEqual(b())
    })

    test('returns floats in [0, 1)', () => {
      const rng = createRng(7)
      for (let i = 0; i < 50; i++) {
        const value = rng()
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      }
    })
  })

  test('randomSeed returns an integer', () => {
    const seed = randomSeed()
    expect(Number.isInteger(seed)).toBe(true)
  })

  describe('rngInt', () => {
    test('stays within [0, maxExclusive)', () => {
      const rng = createRng(123)
      for (let i = 0; i < 100; i++) {
        const value = rngInt(rng, 5)
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(5)
      }
    })
  })

  describe('rngPick', () => {
    test('returns an element from the array', () => {
      const rng = createRng(5)
      const array = ['a', 'b', 'c']
      expect(array).toContain(rngPick(rng, array))
    })
  })

  describe('rngShuffle', () => {
    test('returns a new array with the same elements', () => {
      const rng = createRng(9)
      const array = [1, 2, 3, 4, 5]
      const shuffled = rngShuffle(rng, array)
      expect(shuffled).not.toBe(array)
      expect(shuffled.slice().sort()).toEqual(array.slice().sort())
    })

    test('does not modify the input array', () => {
      const rng = createRng(9)
      const array = [1, 2, 3]
      rngShuffle(rng, array)
      expect(array).toEqual([1, 2, 3])
    })

    test('is deterministic for the same seed', () => {
      const shuffledA = rngShuffle(createRng(11), [1, 2, 3, 4, 5])
      const shuffledB = rngShuffle(createRng(11), [1, 2, 3, 4, 5])
      expect(shuffledA).toEqual(shuffledB)
    })
  })
})
