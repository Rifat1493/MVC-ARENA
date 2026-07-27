import { mount } from '@vue/test-utils'
import CardSelector from '@/flow-mode/components/CardSelector'
import { useCaseById } from '@/flow-mode/data/useCases'

describe('CardSelector', () => {
  const useCase = useCaseById('mobile-login')

  test('shows catalog layers without revealing required cards', () => {
    const wrapper = mount(CardSelector, {
      props: {
        playerName: 'Alice',
        mode: 'initial',
        selectedIds: [],
        ownedIds: [],
        useCase
      }
    })
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Controller')
    expect(wrapper.text()).toContain(useCase.title)
    expect(wrapper.text()).not.toContain('Needed now')
    expect(wrapper.text()).not.toContain('Required')
    expect(wrapper.find('button.card-selector-confirm').attributes('disabled')).toBeDefined()
  })

  test('enables confirm for a valid initial selection and emits events', async () => {
    const selected = [
      'controller-routing',
      'controller-authentication',
      'model-database',
      'model-orm',
      'view-mobile-view'
    ]
    const wrapper = mount(CardSelector, {
      props: {
        playerName: 'Alice',
        mode: 'initial',
        selectedIds: selected,
        ownedIds: [],
        useCase
      }
    })
    expect(wrapper.find('button.card-selector-confirm').attributes('disabled')).toBeUndefined()
    await wrapper.find('button.card-selector-confirm').trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)

    const option = wrapper.findAll('button.card-selector-option')[0]
    await option.trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  test('marks owned cards disabled during upgrade', () => {
    const wrapper = mount(CardSelector, {
      props: {
        playerName: 'Alice',
        mode: 'upgrade',
        selectedIds: [],
        ownedIds: ['controller-routing'],
        useCase
      }
    })
    expect(wrapper.text()).toContain('Owned')
  })
})
