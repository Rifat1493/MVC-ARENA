import {
  validateInitialSelection,
  validateUpgradeSelection,
  canConfirmSelection,
  countSelectedByLayer,
  availableCards,
  selectionStatusText
} from '@/flow-mode/engine/selection'

describe('selection', () => {
  const validInitial = [
    'controller-routing',
    'controller-authentication',
    'model-database',
    'model-orm',
    'view-web-view'
  ]

  test('accepts a valid 2/2/1 initial selection', () => {
    expect(validateInitialSelection(validInitial)).toEqual({ ok: true })
    expect(canConfirmSelection('initial', validInitial)).toBe(true)
  })

  test('rejects wrong initial counts', () => {
    const bad = [
      'controller-routing',
      'controller-authentication',
      'controller-middleware',
      'model-database',
      'view-web-view'
    ]
    expect(validateInitialSelection(bad).ok).toBe(false)
  })

  test('rejects duplicates in initial selection', () => {
    const bad = [
      'controller-routing',
      'controller-routing',
      'model-database',
      'model-orm',
      'view-web-view'
    ]
    expect(validateInitialSelection(bad).ok).toBe(false)
  })

  test('accepts a valid two-card upgrade of unowned cards', () => {
    expect(validateUpgradeSelection(
      ['controller-csrf-protection', 'view-output-validation'],
      validInitial
    )).toEqual({ ok: true })
  })

  test('rejects upgrade that reuses owned cards', () => {
    const result = validateUpgradeSelection(['controller-routing', 'model-caching'], validInitial)
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/already/)
  })

  test('rejects upgrade with wrong count', () => {
    expect(validateUpgradeSelection(['model-caching'], validInitial).ok).toBe(false)
  })

  test('countSelectedByLayer and availableCards work', () => {
    expect(countSelectedByLayer(validInitial)).toEqual({
      controller: 2, model: 2, view: 1
    })
    expect(availableCards(validInitial).every(c => !validInitial.includes(c.id))).toBe(true)
  })

  test('selectionStatusText describes quotas', () => {
    expect(selectionStatusText('initial', validInitial)).toMatch(/2\/2 Controller/)
    expect(selectionStatusText('upgrade', ['a'])).toMatch(/1 \/ 2/)
  })
})
