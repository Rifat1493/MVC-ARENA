import { mount } from '@vue/test-utils'
import RequestPipeline from '@/flow-mode/components/RequestPipeline'

const servedRequest = { id: 'r1', kind: 'data', route: 'Routing', dataDomain: 'Database', outputType: 'Web View' }
const servedResult = {
  requestId: 'r1', outcome: 'served', failedAtLayer: null, failureCode: null,
  matchedCards: { controller: 'x', model: 'y', view: 'z' }, explanation: '200 OK'
}
const failedAtModelResult = {
  requestId: 'r1', outcome: 'failed', failedAtLayer: 'model', failureCode: 'NO_HANDLER',
  matchedCards: { controller: 'x', model: null, view: null }, explanation: '500 - no handler for users'
}
const threatRequest = { id: 't1', kind: 'threat', threatType: 'XSS', targetLayer: 'view' }
const blockedThreatResult = { requestId: 't1', outcome: 'blocked', guardCardId: 'view-output-validation', damagedCardId: null, explanation: 'XSS blocked at view' }

describe('RequestPipeline', () => {
  test('shows a 6-stop pipeline for a data request', () => {
    const wrapper = mount(RequestPipeline, { props: { request: servedRequest, result: servedResult, stopIndex: 0 } })
    expect(wrapper.vm.stops.map(s => s.label)).toEqual(
      ['Request', 'Controller', 'Model', 'Controller', 'View', 'Response'])
  })

  test('shows the same 6-stop pipeline for a threat request as a data request', () => {
    const wrapper = mount(RequestPipeline, { props: { request: threatRequest, result: blockedThreatResult, stopIndex: 0 } })
    expect(wrapper.vm.stops.map(s => s.label)).toEqual(
      ['Request', 'Controller', 'Model', 'Controller', 'View', 'Response'])
  })

  test('a threat halts at its target layer\'s stop, not the final Response stop', () => {
    const wrapper = mount(RequestPipeline, { props: { request: threatRequest, result: blockedThreatResult, stopIndex: 5 } })
    // threatRequest targets 'view', the 5th stop (index 4) - not Response (index 5).
    expect(wrapper.vm.haltIndex).toEqual(4)
    expect(wrapper.vm.displayIndex).toEqual(4)
    expect(wrapper.find('.pipeline-explanation').text()).toEqual('XSS blocked at view')
  })

  test('at stopIndex 0, no explanation is shown yet', () => {
    const wrapper = mount(RequestPipeline, { props: { request: servedRequest, result: servedResult, stopIndex: 0 } })
    expect(wrapper.find('.pipeline-explanation').exists()).toBe(false)
  })

  test('a served request halts at the last stop (Response) and shows the explanation once reached', () => {
    const wrapper = mount(RequestPipeline, { props: { request: servedRequest, result: servedResult, stopIndex: 5 } })
    expect(wrapper.vm.haltIndex).toEqual(5)
    expect(wrapper.vm.displayIndex).toEqual(5)
    expect(wrapper.find('.pipeline-explanation').text()).toEqual('200 OK')
  })

  test('a request that fails at model halts there, even if stopIndex advances further', () => {
    const wrapper = mount(RequestPipeline, { props: { request: servedRequest, result: failedAtModelResult, stopIndex: 5 } })
    // stops: [Request, Controller(out)=1, Model=2, Controller(return)=3, View=4, Response=5]
    expect(wrapper.vm.haltIndex).toEqual(2)
    expect(wrapper.vm.displayIndex).toEqual(2)
    expect(wrapper.find('.pipeline-stop.failed').exists()).toBe(true)
    expect(wrapper.find('.pipeline-explanation').text()).toMatch(/500/)
  })

  test('marks stops before displayIndex as passed', () => {
    const wrapper = mount(RequestPipeline, { props: { request: servedRequest, result: servedResult, stopIndex: 3 } })
    const stops = wrapper.findAll('.pipeline-stop')
    expect(stops[0].classes()).toContain('passed')
    expect(stops[1].classes()).toContain('passed')
    expect(stops[2].classes()).toContain('passed')
    expect(stops[3].classes()).toContain('active')
    expect(stops[4].classes()).not.toContain('passed')
  })

  test('is reactive to stopIndex changing (driven by the parent)', async () => {
    const wrapper = mount(RequestPipeline, { props: { request: servedRequest, result: servedResult, stopIndex: 0 } })
    expect(wrapper.find('.pipeline-explanation').exists()).toBe(false)

    await wrapper.setProps({ stopIndex: 5 })

    expect(wrapper.find('.pipeline-explanation').exists()).toBe(true)
  })
})
