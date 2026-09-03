import { mount } from '@vue/test-utils'
import { bus } from '@/components/shared/Bus'
import EffectNotifications from '@/components/shared/EffectNotifications'

jest.mock('vuex', () => ({
  mapGetters: () => ({ game: () => null })
}))

describe('EffectNotifications', () => {
  test('attackBlocked places cards on each player side (defender left, attacker right)', () => {
    const wrapper = mount(EffectNotifications)

    bus.emit('attack-blocked', {
      attackImage: 'attack.png',
      defenseImage: 'defense.png',
      message: 'Orm encountered SQL Injection',
      attackerPlayerId: 1,
      defenderPlayerId: 0
    })

    expect(wrapper.vm.collisionLeft).toBe('defense.png')
    expect(wrapper.vm.collisionRight).toBe('attack.png')
    expect(wrapper.vm.showingCollision).toBe(true)

    wrapper.unmount()
  })

  test('attackBlocked swaps sides when defender is on the right', () => {
    const wrapper = mount(EffectNotifications)

    bus.emit('attack-blocked', {
      attackImage: 'attack.png',
      defenseImage: 'defense.png',
      message: 'Orm encountered SQL Injection',
      attackerPlayerId: 0,
      defenderPlayerId: 1
    })

    expect(wrapper.vm.collisionLeft).toBe('attack.png')
    expect(wrapper.vm.collisionRight).toBe('defense.png')

    wrapper.unmount()
  })
})
