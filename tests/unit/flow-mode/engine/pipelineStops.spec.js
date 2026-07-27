import { computeStops, computeHaltIndex } from '@/flow-mode/engine/pipelineStops'
import { useCaseById } from '@/flow-mode/data/useCases'

describe('pipelineStops', () => {
  const useCase = useCaseById('mobile-login')

  test('builds Request → Controller → Model → View → Response', () => {
    const stops = computeStops(useCase)
    expect(stops.map(s => s.label)).toEqual([
      'Request', 'Controller', 'Model', 'View', 'Response'
    ])
    expect(stops.map(s => s.layer)).toEqual([
      null, 'controller', 'model', 'view', null
    ])
  })

  test('fulfilled result halts at Response', () => {
    const stops = computeStops(useCase)
    const halt = computeHaltIndex(stops, useCase, {
      outcome: 'fulfilled', missingCardId: null, failedAtLayer: null
    })
    expect(stops[halt].label).toEqual('Response')
  })

  test('failed result halts at the missing card\'s MVC layer', () => {
    const stops = computeStops(useCase)
    const halt = computeHaltIndex(stops, useCase, {
      outcome: 'failed',
      missingCardId: 'model-database',
      failedAtLayer: 'model'
    })
    expect(stops[halt].label).toEqual('Model')
  })
})
