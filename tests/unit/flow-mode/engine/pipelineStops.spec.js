import { computeStops, computeHaltIndex } from '@/flow-mode/engine/pipelineStops'

describe('computeStops', () => {
  test('returns the same 6-stop round trip regardless of request kind', () => {
    const dataStops = computeStops({ kind: 'data' }, {})
    const threatStops = computeStops({ kind: 'threat', targetLayer: 'model' }, { outcome: 'blocked' })

    const expectedLabels = ['Request', 'Controller', 'Model', 'Controller', 'View', 'Response']
    const expectedLayers = [null, 'controller', 'model', 'controller', 'view', null]

    expect(dataStops.map(s => s.label)).toEqual(expectedLabels)
    expect(dataStops.map(s => s.layer)).toEqual(expectedLayers)
    expect(threatStops.map(s => s.label)).toEqual(expectedLabels)
    expect(threatStops.map(s => s.layer)).toEqual(expectedLayers)
  })
})

describe('computeHaltIndex', () => {
  test('halts at the last stop when a data request is served', () => {
    const request = { kind: 'data' }
    const result = { outcome: 'served' }
    const stops = computeStops(request, result)
    expect(computeHaltIndex(stops, request, result)).toEqual(5)
  })

  test('halts at the controller stop when a data request fails there', () => {
    const request = { kind: 'data' }
    const result = { outcome: 'failed', failedAtLayer: 'controller' }
    const stops = computeStops(request, result)
    expect(computeHaltIndex(stops, request, result)).toEqual(1)
  })

  test('halts at the model stop when a data request fails there', () => {
    const request = { kind: 'data' }
    const result = { outcome: 'failed', failedAtLayer: 'model' }
    const stops = computeStops(request, result)
    expect(computeHaltIndex(stops, request, result)).toEqual(2)
  })

  test('halts at the view stop when a data request fails there', () => {
    const request = { kind: 'data' }
    const result = { outcome: 'failed', failedAtLayer: 'view' }
    const stops = computeStops(request, result)
    expect(computeHaltIndex(stops, request, result)).toEqual(4)
  })

  test('a threat targeting the controller halts at the (first) controller stop, whether blocked or penetrated', () => {
    const stops = computeStops({}, {})
    const blockedRequest = { kind: 'threat', targetLayer: 'controller' }
    const penetratedRequest = { kind: 'threat', targetLayer: 'controller' }
    expect(computeHaltIndex(stops, blockedRequest, { outcome: 'blocked' })).toEqual(1)
    expect(computeHaltIndex(stops, penetratedRequest, { outcome: 'penetrated' })).toEqual(1)
  })

  test('a threat targeting the model halts at the model stop', () => {
    const stops = computeStops({}, {})
    const request = { kind: 'threat', targetLayer: 'model' }
    expect(computeHaltIndex(stops, request, { outcome: 'blocked' })).toEqual(2)
  })

  test('a threat targeting the view halts at the view stop, not the final Response stop', () => {
    const stops = computeStops({}, {})
    const request = { kind: 'threat', targetLayer: 'view' }
    expect(computeHaltIndex(stops, request, { outcome: 'penetrated' })).toEqual(4)
    expect(computeHaltIndex(stops, request, { outcome: 'penetrated' })).not.toEqual(stops.length - 1)
  })
})
