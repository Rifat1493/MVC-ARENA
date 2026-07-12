import { mount } from '@vue/test-utils'
import FlowSetup from '@/flow-mode/components/FlowSetup'

describe('FlowSetup', () => {
  test('shows an error and does not emit when player 1 has no name', async () => {
    const wrapper = mount(FlowSetup)
    await wrapper.find('#p2-name').setValue('Bob')
    await wrapper.find('button.btn-success').trigger('click')

    expect(wrapper.emitted('start')).toBeUndefined()
    expect(wrapper.text()).toContain('Player 1')
  })

  test('shows an error when player 2 is human but has no name', async () => {
    const wrapper = mount(FlowSetup)
    await wrapper.find('#p1-name').setValue('Alice')
    await wrapper.find('button.btn-success').trigger('click')

    expect(wrapper.emitted('start')).toBeUndefined()
  })

  test('emits start with both human names when valid', async () => {
    const wrapper = mount(FlowSetup)
    await wrapper.find('#p1-name').setValue('Alice')
    await wrapper.find('#p2-name').setValue('Bob')
    await wrapper.find('button.btn-success').trigger('click')

    expect(wrapper.emitted('start')).toEqual([[{ player1Name: 'Alice', player2IsBot: false, player2Name: 'Bob' }]])
  })

  test('toggling to Bot hides the player 2 name input and does not require it', async () => {
    const wrapper = mount(FlowSetup)
    await wrapper.find('#p1-name').setValue('Alice')
    await wrapper.findAll('.flow-setup-toggle .btn')[1].trigger('click') // "Bot" button

    expect(wrapper.find('#p2-name').exists()).toBe(false)

    await wrapper.find('button.btn-success').trigger('click')

    expect(wrapper.emitted('start')).toEqual([[{ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' }]])
  })
})
