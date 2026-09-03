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

  test('descriptions are hypothetical prompts that do not reveal card names', () => {
    for (const uc of USE_CASES) {
      expect(uc.description).toMatch(/^Imagine /)
      for (const card of CARDS) {
        const escapedName = card.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        expect(uc.description).not.toMatch(new RegExp(`\\b${escapedName}\\b`, 'i'))
      }
    }
  })

  test('every use case requires at least one card from each MVC layer', () => {
    for (const uc of USE_CASES) {
      const layers = new Set(uc.requiredCardIds.map(id => cardById(id).layer))
      expect(layers).toEqual(new Set(['controller', 'model', 'view']))
      expect(new Set(uc.requiredCardIds).size).toEqual(uc.requiredCardIds.length)
    }
  })

  test('the use-case catalog gives every available card a teaching role', () => {
    const requiredIds = new Set(USE_CASES.flatMap(uc => uc.requiredCardIds))
    for (const card of CARDS) {
      expect(requiredIds.has(card.id)).toBe(true)
    }
  })

  test('easy use cases fit the initial 2 Controller / 2 Model / 1 View build', () => {
    for (const uc of USE_CASES.filter(uc => uc.difficulty === 1)) {
      const cards = uc.requiredCardIds.map(cardById)
      expect(cards.filter(c => c.layer === 'controller').length).toBeLessThanOrEqual(2)
      expect(cards.filter(c => c.layer === 'model').length).toBeLessThanOrEqual(2)
      expect(cards.filter(c => c.layer === 'view').length).toBeLessThanOrEqual(1)
      expect(cards.length).toBeLessThanOrEqual(5)
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
    expect(titles.some(t => /public.*dashboard/i.test(t))).toBe(true)
    expect(titles.some(t => /cache/i.test(t))).toBe(true)
    expect(titles.some(t => /file|download/i.test(t))).toBe(true)
    expect(titles.some(t => /delivery quote/i.test(t))).toBe(true)
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
