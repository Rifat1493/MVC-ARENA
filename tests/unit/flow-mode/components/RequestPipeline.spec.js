import { mount } from '@vue/test-utils'
import RequestPipeline from '@/flow-mode/components/RequestPipeline'
import { useCaseById } from '@/flow-mode/data/useCases'

const useCase = useCaseById('mobile-login')
const fulfilled = {
  outcome: 'fulfilled',
  fulfilledRequirements: 4,
  totalRequirements: 4,
  missingCardId: null,
  failedAtLayer: null,
  explanation: 'Fulfilled: all 4 required cards are in your system.'
}
const failed = {
  outcome: 'failed',
  fulfilledRequirements: 2,
  totalRequirements: 4,
  missingCardId: 'model-database',
  failedAtLayer: 'model',
  explanation: 'Not fulfilled: required card "Database" (Model) is missing from your system.'
}

describe('RequestPipeline', () => {
  test('shows the MVC request/response flow', () => {
    const wrapper = mount(RequestPipeline, {
      props: { useCase, result: fulfilled, stopIndex: 0 }
    })
    expect(wrapper.vm.stops.map(s => s.label)).toEqual([
      'Request', 'Controller', 'Model', 'View', 'Response'
    ])
  })

  test('fulfilled request shows explanation at the final stop', async () => {
    const wrapper = mount(RequestPipeline, {
      props: { useCase, result: fulfilled, stopIndex: 0 }
    })
    expect(wrapper.find('.pipeline-explanation').exists()).toBe(false)
    await wrapper.setProps({ stopIndex: wrapper.vm.haltIndex })
    expect(wrapper.find('.pipeline-explanation').text()).toMatch(/all 4 required cards/)
  })

  test('failed request halts at the failed MVC layer and marks failure', () => {
    const wrapper = mount(RequestPipeline, {
      props: { useCase, result: failed, stopIndex: 10 }
    })
    expect(wrapper.vm.stops[wrapper.vm.haltIndex].label).toEqual('Model')
    expect(wrapper.find('.pipeline-stop.failed').exists()).toBe(true)
    expect(wrapper.find('.pipeline-explanation').text()).toMatch(/required card "Database"/)
  })
})
