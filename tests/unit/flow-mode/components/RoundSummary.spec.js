import { mount } from '@vue/test-utils'
import RoundSummary from '@/flow-mode/components/RoundSummary'

describe('RoundSummary', () => {
  const roundResult = {
    p1: { served: 2, blocked: 1, penetrated: 0, roundScore: 3 },
    p2: { served: 1, blocked: 0, penetrated: 1, roundScore: 1 }
  }
  const cumulativeScores = [
    { playerId: 'p1', displayName: 'Alice', matchScore: 3 },
    { playerId: 'p2', displayName: 'Bot', matchScore: 1 }
  ]

  test('renders both players\' round results by display name', () => {
    const wrapper = mount(RoundSummary, {
      props: { roundNumber: 1, roundResult, cumulativeScores, nextLabel: 'Continue to Hotfix' }
    })

    expect(wrapper.text()).toContain('Round 1 Complete')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Served: 2')
    expect(wrapper.text()).toContain('Breached: 0')
    expect(wrapper.text()).toContain('+3 pts')
    expect(wrapper.text()).toContain('Bot')
    expect(wrapper.text()).toContain('3 total')
  })

  test('uses the given nextLabel on the continue button', () => {
    const wrapper = mount(RoundSummary, {
      props: { roundNumber: 1, roundResult, cumulativeScores, nextLabel: 'Continue to Hotfix' }
    })
    expect(wrapper.find('button').text()).toEqual('Continue to Hotfix')
  })

  test('emits continue when the button is clicked', async () => {
    const wrapper = mount(RoundSummary, {
      props: { roundNumber: 1, roundResult, cumulativeScores, nextLabel: 'Next' }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('continue')).toHaveLength(1)
  })
})
