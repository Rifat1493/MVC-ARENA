import { mount } from '@vue/test-utils'
import MatchEndModal from '@/flow-mode/components/MatchEndModal'

describe('MatchEndModal', () => {
  const players = [
    { playerId: 'p1', displayName: 'Alice' },
    { playerId: 'p2', displayName: 'Bot' }
  ]

  test('renders nothing when not showing', () => {
    const wrapper = mount(MatchEndModal, {
      props: { matchResult: { winnerId: 'p1', reason: 'score' }, players, showing: false }
    })
    expect(wrapper.find('#match-end-modal').exists()).toBe(false)
  })

  test('shows the winner\'s display name and reason', () => {
    const wrapper = mount(MatchEndModal, {
      props: { matchResult: { winnerId: 'p1', reason: 'score' }, players, showing: true }
    })
    expect(wrapper.text()).toContain('Alice wins!')
    expect(wrapper.text()).toContain('Highest score')
  })

  test('shows a draw message when there is no winner', () => {
    const wrapper = mount(MatchEndModal, {
      props: { matchResult: { winnerId: null, reason: 'draw' }, players, showing: true }
    })
    expect(wrapper.text()).toContain("It's a draw!")
  })

  test('emits rematch and exit', async () => {
    const wrapper = mount(MatchEndModal, {
      props: { matchResult: { winnerId: 'p1', reason: 'score' }, players, showing: true }
    })
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')
    expect(wrapper.emitted('rematch')).toHaveLength(1)
    expect(wrapper.emitted('exit')).toHaveLength(1)
  })
})
