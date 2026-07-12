import { mount } from '@vue/test-utils'
import ForecastBanner from '@/flow-mode/components/ForecastBanner'

describe('ForecastBanner', () => {
  const forecast = {
    dataPct: 60, threatPct: 40, threatTypesPresent: ['SQL_INJECTION'],
    headline: '~60% data requests, ~40% threats, expect SQL_INJECTION'
  }

  test('renders the round number and headline', () => {
    const wrapper = mount(ForecastBanner, { props: { forecast, roundNumber: 1 } })
    expect(wrapper.text()).toContain('Round 1')
    expect(wrapper.text()).toContain(forecast.headline)
  })

  test('emits continue when the button is clicked', async () => {
    const wrapper = mount(ForecastBanner, { props: { forecast, roundNumber: 1 } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('continue')).toHaveLength(1)
  })
})
