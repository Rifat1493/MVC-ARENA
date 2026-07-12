import { mount } from '@vue/test-utils'
import CardChip from '@/flow-mode/components/CardChip'
import { cardById } from '@/flow-mode/data/cards'

describe('CardChip', () => {
  const card = cardById('model-orm')

  test('applies the card\'s layer as a border class (name/layer are already in the artwork)', () => {
    const wrapper = mount(CardChip, { props: { card } })
    expect(wrapper.find('.card-chip').classes()).toContain('layer-model')
    expect(wrapper.find('.card-chip-image').attributes('alt')).toEqual(card.name)
  })

  test('uses the card description as the title tooltip', () => {
    const wrapper = mount(CardChip, { props: { card } })
    expect(wrapper.find('.card-chip').attributes('title')).toEqual(card.description)
  })

  test('renders the card\'s image', () => {
    const wrapper = mount(CardChip, { props: { card } })
    expect(wrapper.find('.card-chip-image').attributes('src')).toEqual(card.image)
  })

  test('shows a guard badge only for guard cards', () => {
    const guardWrapper = mount(CardChip, { props: { card: cardById('model-orm') } })
    expect(guardWrapper.find('.card-chip-guard-badge').exists()).toBe(true)

    const routeWrapper = mount(CardChip, { props: { card: cardById('controller-routing') } })
    expect(routeWrapper.find('.card-chip-guard-badge').exists()).toBe(false)
  })

  test('applies the disabled class and is not draggable when disabled', () => {
    const wrapper = mount(CardChip, { props: { card, disabled: true, draggable: true } })
    expect(wrapper.find('.card-chip').classes()).toContain('disabled')
    expect(wrapper.find('.card-chip').attributes('draggable')).toEqual('false')
  })

  test('is draggable when draggable is true and not disabled', () => {
    const wrapper = mount(CardChip, { props: { card, draggable: true } })
    expect(wrapper.find('.card-chip').attributes('draggable')).toEqual('true')
  })

  test('sets the card id on dragstart', () => {
    const wrapper = mount(CardChip, { props: { card, draggable: true } })
    const setData = jest.fn()
    wrapper.find('.card-chip').trigger('dragstart', {
      dataTransfer: { setData, dropEffect: '', effectAllowed: '' }
    })
    expect(setData).toHaveBeenCalledWith('cardId', card.id)
  })
})
