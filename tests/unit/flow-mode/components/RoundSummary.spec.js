import { mount } from '@vue/test-utils'
import RoundSummary from '@/flow-mode/components/RoundSummary'
import { useCaseById } from '@/flow-mode/data/useCases'

describe('RoundSummary', () => {
  const useCase = useCaseById('mobile-login')
  const iterationResult = {
    p1: {
      fulfilled: true,
      fulfilledRequirements: 4,
      totalRequirements: 4,
      iterationScore: 1,
      result: { explanation: 'Fulfilled securely.' }
    },
    p2: {
      fulfilled: false,
      fulfilledRequirements: 2,
      totalRequirements: 4,
      iterationScore: 0,
      result: { explanation: 'Missing ORM.' }
    }
  }
  const cumulativeScores = [
    { playerId: 'p1', displayName: 'Alice', matchScore: 2 },
    { playerId: 'p2', displayName: 'Bot', matchScore: 1 }
  ]

  test('reveals security risk and required cards after simulation', () => {
    const wrapper = mount(RoundSummary, {
      props: {
        iterationNumber: 1,
        useCaseTitle: useCase.title,
        useCase,
        iterationResult,
        cumulativeScores,
        nextLabel: 'Next Use Case'
      }
    })
    expect(wrapper.text()).toContain('Iteration 1 Complete')
    expect(wrapper.text()).toContain(useCase.title)
    expect(wrapper.text()).toContain(useCase.securityRisk)
    expect(wrapper.text()).toContain('Authentication')
    expect(wrapper.text()).toContain('Mobile View')
    expect(wrapper.text()).toContain('Fulfilled')
    expect(wrapper.text()).toContain('Failed')
  })

  test('emits continue', async () => {
    const wrapper = mount(RoundSummary, {
      props: {
        iterationNumber: 1,
        useCase,
        iterationResult,
        cumulativeScores,
        nextLabel: 'See Result'
      }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('continue')).toHaveLength(1)
    expect(wrapper.find('button').text()).toEqual('See Result')
  })
})
