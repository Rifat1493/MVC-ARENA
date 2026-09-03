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

  test('fulfills only when every required card is played', () => {
    const board = createPlayerBoard('p1', 'Alice')
    installCards(board, mobileLogin.requiredCardIds)

    const result = resolveUseCase(board, mobileLogin)

    expect(result.outcome).toEqual('fulfilled')
    expect(result.fulfilledRequirements).toEqual(mobileLogin.requiredCardIds.length)
    expect(result.missingCardId).toBeNull()
    expect(result.explanation).toMatch(/all 4 required cards/)
  })

  test('fails when a required card is missing from the played system', () => {
    const board = createPlayerBoard('p1', 'Alice')
    installCards(board, [
      'controller-routing',
      'controller-authentication',
      'model-database'
    ])

    const result = resolveUseCase(board, mobileLogin)

    expect(result.outcome).toEqual('failed')
    expect(result.missingCardId).toEqual('view-mobile-view')
    expect(result.failedAtLayer).toEqual('view')
    expect(result.fulfilledRequirements).toEqual(3)
    expect(result.explanation).toMatch(/required card "Mobile View"/)
    expect(result.explanation).not.toMatch(/SQL|forge sessions|injection/i)
  })

  test('product-search missing Routing is a card-match failure, not an SQL message', () => {
    const productSearch = useCaseById('product-search')
    const board = createPlayerBoard('p1', 'Alice')
    installCards(board, ['model-orm', 'model-database', 'view-web-view'])

    const result = resolveUseCase(board, productSearch)

    expect(result.outcome).toEqual('failed')
    expect(result.missingCardId).toEqual('controller-routing')
    expect(result.explanation).toEqual(
      'Not fulfilled: required card "Routing" (Controller) is missing from your system.')
    expect(result.explanation).not.toMatch(/SQL/i)
  })

  test('countFulfilledRequirements counts installed required cards only', () => {
    const board = createPlayerBoard('p1', 'Alice')
    installCards(board, ['controller-authentication', 'model-database'])
    expect(countFulfilledRequirements(board, mobileLogin)).toEqual(2)
  })
})
