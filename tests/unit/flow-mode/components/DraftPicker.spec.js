import { mount } from '@vue/test-utils'
import DraftPicker from '@/flow-mode/components/DraftPicker'
import { cardById } from '@/flow-mode/data/cards'

describe('DraftPicker', () => {
  const options = [cardById('controller-routing'), cardById('model-database'), cardById('view-web-view')]

  test('shows the pick counter and player name', () => {
    const wrapper = mount(DraftPicker, {
      props: { playerName: 'Alice', options, pickNumber: 2, picksRemaining: 4, alreadyDrafted: [] }
    })
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Pick 2 of 5')
  })

  test('renders all 3 offered options', () => {
    const wrapper = mount(DraftPicker, {
      props: { playerName: 'Alice', options, pickNumber: 1, picksRemaining: 5, alreadyDrafted: [] }
    })
    expect(wrapper.findAll('.draft-picker-option')).toHaveLength(3)
  })

  test('emits pick with the chosen card id', async () => {
    const wrapper = mount(DraftPicker, {
      props: { playerName: 'Alice', options, pickNumber: 1, picksRemaining: 5, alreadyDrafted: [] }
    })
    await wrapper.findAll('.draft-picker-option')[0].trigger('click')
    expect(wrapper.emitted('pick')).toEqual([[options[0].id]])
  })

  test('shows already-drafted cards when present', () => {
    const wrapper = mount(DraftPicker, {
      props: { playerName: 'Alice', options, pickNumber: 2, picksRemaining: 4, alreadyDrafted: [cardById('controller-authentication')] }
    })
    expect(wrapper.text()).toContain('Collected:')
    expect(wrapper.find('.draft-picker-collected .card-chip-image').attributes('alt')).toEqual('Authentication')
  })
})
