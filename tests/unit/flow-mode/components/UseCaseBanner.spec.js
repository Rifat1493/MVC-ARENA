import { mount } from '@vue/test-utils'
import UseCaseBanner from '@/flow-mode/components/UseCaseBanner'
import { useCaseById } from '@/flow-mode/data/useCases'

describe('UseCaseBanner', () => {
  const useCase = useCaseById('mobile-login')

  test('renders scenario only — no security risk or required cards yet', () => {
    const wrapper = mount(UseCaseBanner, {
      props: { useCase, iterationNumber: 2, totalIterations: 4 }
    })
    expect(wrapper.text()).toContain('Iteration 2 / 4')
    expect(wrapper.text()).toContain(useCase.title)
    expect(wrapper.text()).toContain(useCase.description)
    expect(wrapper.text()).not.toContain(useCase.securityRisk)
    expect(wrapper.text()).not.toContain('Required cards')
    expect(wrapper.text()).not.toContain('Authentication')
  })

  test('upgrade iterations prompt reading the new use case before upgrading', () => {
    const wrapper = mount(UseCaseBanner, {
      props: {
        useCase,
        iterationNumber: 2,
        isUpgrade: true,
        continueLabel: 'Continue to Upgrade'
      }
    })
    expect(wrapper.text()).toContain('New use case')
    expect(wrapper.text()).toMatch(/upgrade your system/i)
    expect(wrapper.find('button').text()).toEqual('Continue to Upgrade')
  })

  test('emits continue', async () => {
    const wrapper = mount(UseCaseBanner, {
      props: { useCase, iterationNumber: 1 }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('continue')).toHaveLength(1)
  })
})
