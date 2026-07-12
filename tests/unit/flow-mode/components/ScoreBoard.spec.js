import { mount } from '@vue/test-utils'
import ScoreBoard from '@/flow-mode/components/ScoreBoard'

describe('ScoreBoard', () => {
  const players = [
    { displayName: 'Alice', roundScore: 2, matchScore: 5, penetrations: 1 },
    { displayName: 'Bot', roundScore: 1, matchScore: 3, penetrations: 2 }
  ]

  test('renders every player row with their scores', () => {
    const wrapper = mount(ScoreBoard, { props: { players, roundNumber: 2, totalRounds: 3 } })

    expect(wrapper.text()).toContain('Round 2 / 3')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Round: 2')
    expect(wrapper.text()).toContain('Total: 5')
    expect(wrapper.text()).toContain('Breaches: 1')
    expect(wrapper.text()).toContain('Bot')
  })
})
