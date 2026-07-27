import { mount } from '@vue/test-utils'
import ScoreBoard from '@/flow-mode/components/ScoreBoard'

describe('ScoreBoard', () => {
  const players = [
    { displayName: 'Alice', roundScore: 1, matchScore: 2, requirementsFulfilled: 9 },
    { displayName: 'Bot', roundScore: 0, matchScore: 1, requirementsFulfilled: 6 }
  ]

  test('renders iteration progress and requirement totals', () => {
    const wrapper = mount(ScoreBoard, {
      props: { players, iterationNumber: 2, totalIterations: 4 }
    })
    expect(wrapper.text()).toContain('Iteration 2 / 4')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Fulfilled: 2')
    expect(wrapper.text()).toContain('Reqs: 9')
    expect(wrapper.text()).toContain('Bot')
  })
})
