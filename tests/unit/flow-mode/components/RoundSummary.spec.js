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
      result: { explanation: 'Fulfilled: all 4 required cards are in your system.' }
    },
    p2: {
      fulfilled: false,
      fulfilledRequirements: 2,
      totalRequirements: 4,
      iterationScore: 0,
      result: { explanation: 'Not fulfilled: required card "ORM" (Model) is missing from your system.' }
    }
  }
  const cumulativeScores = [
    { playerId: 'p1', displayName: 'Alice', matchScore: 2 },
    { playerId: 'p2', displayName: 'Bot', matchScore: 1 }
  ]

  test('shows required-card match results before the security lesson', () => {
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
    expect(wrapper.text()).toContain('Required cards for this use case')
    expect(wrapper.text()).toContain('Authentication')
    expect(wrapper.text()).toContain('Matched: 4/4')
    expect(wrapper.text()).toContain('Not fulfilled')
    expect(wrapper.text()).toContain('Security lesson')
    expect(wrapper.text()).toContain(useCase.securityRisk)
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
  })
})
