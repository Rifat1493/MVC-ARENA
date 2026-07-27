import { createPlayerBoard, placeCard } from '@/flow-mode/engine/board'
import { resolveUseCase, countFulfilledRequirements } from '@/flow-mode/engine/useCaseResolution'
import { useCaseById } from '@/flow-mode/data/useCases'
import { cardById } from '@/flow-mode/data/cards'

function installCards (board, cardIds) {
  for (const id of cardIds) {
    board.drafted.push(id)
    placeCard(board, id, cardById(id).layer)
  }
}

describe('useCaseResolution', () => {
  const mobileLogin = useCaseById('mobile-login')

  test('fulfills when every required card is installed', () => {
    const board = createPlayerBoard('p1', 'Alice')
    installCards(board, mobileLogin.requiredCardIds)

    const result = resolveUseCase(board, mobileLogin)

    expect(result.outcome).toEqual('fulfilled')
    expect(result.fulfilledRequirements).toEqual(mobileLogin.requiredCardIds.length)
    expect(result.missingCardId).toBeNull()
    expect(result.explanation).toMatch(/Fulfilled/)
  })

  test('fails at the first missing required card and reports the consequence', () => {
    const board = createPlayerBoard('p1', 'Alice')
    installCards(board, [
      'controller-authentication',
      'controller-middleware',
      'model-database'
      // missing mobile view
    ])

    const result = resolveUseCase(board, mobileLogin)

    expect(result.outcome).toEqual('failed')
    expect(result.missingCardId).toEqual('view-mobile-view')
    expect(result.failedAtLayer).toEqual('view')
    expect(result.fulfilledRequirements).toEqual(3)
    expect(result.explanation).toMatch(/Mobile View/)
    expect(result.consequence).toEqual(mobileLogin.consequence)
  })

  test('countFulfilledRequirements counts installed required cards only', () => {
    const board = createPlayerBoard('p1', 'Alice')
    installCards(board, ['controller-authentication', 'model-database'])
    expect(countFulfilledRequirements(board, mobileLogin)).toEqual(2)
  })
})
