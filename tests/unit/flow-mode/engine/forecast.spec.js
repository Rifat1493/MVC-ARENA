import { buildForecast } from '@/flow-mode/engine/forecast'

function dataReq (id) { return { id, kind: 'data' } }
function threatReq (id, threatType) { return { id, kind: 'threat', threatType } }

describe('buildForecast', () => {
  test('computes correct percentages for a 3 data / 2 threat queue', () => {
    const queue = [dataReq('d1'), dataReq('d2'), dataReq('d3'), threatReq('t1', 'XSS'), threatReq('t2', 'XSS')]
    const forecast = buildForecast(queue)

    expect(forecast.dataPct).toEqual(60)
    expect(forecast.threatPct).toEqual(40)
  })

  test('lists distinct threat types present', () => {
    const queue = [dataReq('d1'), threatReq('t1', 'XSS'), threatReq('t2', 'SQL_INJECTION')]
    const forecast = buildForecast(queue)
    expect(forecast.threatTypesPresent.sort()).toEqual(['SQL_INJECTION', 'XSS'])
  })

  test('deduplicates repeated threat types', () => {
    const queue = [threatReq('t1', 'XSS'), threatReq('t2', 'XSS')]
    const forecast = buildForecast(queue)
    expect(forecast.threatTypesPresent).toEqual(['XSS'])
  })

  test('headline mentions the threat types when present', () => {
    const queue = [dataReq('d1'), threatReq('t1', 'SESSION_FORGERY')]
    const forecast = buildForecast(queue)
    expect(forecast.headline).toMatch(/SESSION_FORGERY/)
  })

  test('headline has no threat mention when there are no threats', () => {
    const queue = [dataReq('d1'), dataReq('d2')]
    const forecast = buildForecast(queue)
    expect(forecast.threatTypesPresent).toEqual([])
    expect(forecast.headline).not.toMatch(/expect/)
  })
})
