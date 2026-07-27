import { USE_CASES, useCaseById } from '@/flow-mode/data/useCases'
import { CARDS, cardById } from '@/flow-mode/data/cards'

describe('useCases catalog', () => {
  test('defines exactly 15 use cases', () => {
    expect(USE_CASES).toHaveLength(15)
  })

  test('every use case has unique id, title, security risk, consequence, difficulty, and required cards', () => {
    const ids = new Set()
    for (const uc of USE_CASES) {
      expect(uc.id).toBeTruthy()
      expect(ids.has(uc.id)).toBe(false)
      ids.add(uc.id)
      expect(uc.title).toBeTruthy()
      expect(uc.description).toBeTruthy()
      expect(uc.securityRisk).toBeTruthy()
      expect(uc.consequence).toBeTruthy()
      expect([1, 2, 3]).toContain(uc.difficulty)
      expect(uc.requiredCardIds.length).toBeGreaterThanOrEqual(3)
    }
  })

  test('every required card id exists in the Flow card catalog', () => {
    for (const uc of USE_CASES) {
      for (const cardId of uc.requiredCardIds) {
        expect(cardById(cardId)).toBeDefined()
      }
    }
  })

  test('catalog covers the planned software-building scenarios', () => {
    const titles = USE_CASES.map(uc => uc.title)
    expect(titles.some(t => /login/i.test(t))).toBe(true)
    expect(titles.some(t => /account|register/i.test(t))).toBe(true)
    expect(titles.some(t => /search/i.test(t))).toBe(true)
    expect(titles.some(t => /profile/i.test(t))).toBe(true)
    expect(titles.some(t => /comment/i.test(t))).toBe(true)
    expect(titles.some(t => /upload/i.test(t))).toBe(true)
    expect(titles.some(t => /admin/i.test(t))).toBe(true)
    expect(titles.some(t => /password/i.test(t))).toBe(true)
    expect(titles.some(t => /api/i.test(t))).toBe(true)
    expect(titles.some(t => /cache/i.test(t))).toBe(true)
    expect(titles.some(t => /file|download/i.test(t))).toBe(true)
    expect(titles.some(t => /secret|payment api|external/i.test(t))).toBe(true)
    expect(titles.some(t => /cli/i.test(t))).toBe(true)
    expect(titles.some(t => /checkout|pay/i.test(t))).toBe(true)
    expect(titles.some(t => /report|export/i.test(t))).toBe(true)
  })

  test('useCaseById finds known use cases', () => {
    expect(useCaseById('mobile-login').title).toMatch(/Login/)
    expect(useCaseById('missing')).toBeUndefined()
  })

  test('cards catalog still has 16 cards', () => {
    expect(CARDS).toHaveLength(16)
  })
})
