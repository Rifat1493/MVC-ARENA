import { mount } from '@vue/test-utils'
import LayerBoard from '@/flow-mode/components/LayerBoard'
import { cardById } from '@/flow-mode/data/cards'

function emptyLayers () {
  return { controller: [], model: [], view: [] }
}

function dropEvent (cardId) {
  return { dataTransfer: { getData: () => cardId } }
}

describe('LayerBoard', () => {
  test('renders placed cards in their column', () => {
    const layers = emptyLayers()
    layers.controller.push({ card: cardById('controller-routing'), disabled: false })

    const wrapper = mount(LayerBoard, { props: { playerName: 'Alice', layers } })

    expect(wrapper.find('.card-chip-image').attributes('alt')).toEqual('Routing')
  })

  test('emits drop-card when a card is dropped in its own layer', async () => {
    const wrapper = mount(LayerBoard, { props: { playerName: 'Alice', layers: emptyLayers() } })

    await wrapper.find('.layer-column-controller').trigger('drop', dropEvent('controller-routing'))

    expect(wrapper.emitted('drop-card')).toEqual([[{ cardId: 'controller-routing', layer: 'controller' }]])
  })

  test('rejects a drop in the wrong layer: no emit, shows a message', async () => {
    const wrapper = mount(LayerBoard, { props: { playerName: 'Alice', layers: emptyLayers() } })

    await wrapper.find('.layer-column-model').trigger('drop', dropEvent('controller-routing'))

    expect(wrapper.emitted('drop-card')).toBeUndefined()
    expect(wrapper.find('.layer-board-reject').text()).toMatch(/controller/)
  })

  test('does not emit or reject when not interactive', async () => {
    const wrapper = mount(LayerBoard, {
      props: { playerName: 'Alice', layers: emptyLayers(), interactive: false }
    })

    await wrapper.find('.layer-column-controller').trigger('drop', dropEvent('controller-routing'))

    expect(wrapper.emitted('drop-card')).toBeUndefined()
    expect(wrapper.find('.layer-board-reject').exists()).toBe(false)
  })

  test('passes the disabled flag through to CardChip', () => {
    const layers = emptyLayers()
    layers.model.push({ card: cardById('model-database'), disabled: true })

    const wrapper = mount(LayerBoard, { props: { playerName: 'Alice', layers } })

    expect(wrapper.find('.card-chip').classes()).toContain('disabled')
  })
})
