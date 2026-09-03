import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FlowModePage from '@/flow-mode/FlowModePage'
import {
  INITIAL_CARD_TOTAL,
  UPGRADE_CARDS_PER_TURN,
  ITERATIONS_PER_MATCH
} from '@/flow-mode/engine/constants'
import { setPendingSetup } from '@/flow-mode/pendingSetup'

const VALID_INITIAL = [
  'controller-routing',
  'controller-authentication',
  'model-database',
  'model-orm',
  'view-web-view'
]

function selectInitial (match, playerId, cardIds = VALID_INITIAL) {
  match.selectionState[playerId].selected = []
  for (const id of cardIds) {
    match.toggleSelectCard(playerId, id)
  }
  match.confirmSelection(playerId)
}

describe('FlowModePage', () => {
  const stubRouter = { push: jest.fn() }

  beforeEach(() => {
    stubRouter.push.mockClear()
  })

  function mountPage () {
    return mount(FlowModePage, {
      global: { mocks: { $router: stubRouter } }
    })
  }

  test('shows FlowSetup before a match starts when there is no pending setup', () => {
    const wrapper = mountPage()
    expect(wrapper.findComponent({ name: 'FlowSetup' }).exists()).toBe(true)
  })

  test('auto-starts using pending setup and opens the first use case', () => {
    setPendingSetup({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    const wrapper = mountPage()
    expect(wrapper.findComponent({ name: 'FlowSetup' }).exists()).toBe(false)
    expect(wrapper.vm.match.phase).toEqual('useCase')
    expect(wrapper.vm.match.players.p1.displayName).toEqual('Alice')
    expect(wrapper.findComponent({ name: 'UseCaseBanner' }).exists()).toBe(true)
  })

  test('use-case continue enters select; bot finishes instantly', async () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.onUseCaseContinue()
    await nextTick()
    expect(wrapper.vm.match.phase).toEqual('select')
    expect(wrapper.vm.match.players.p2.drafted).toHaveLength(INITIAL_CARD_TOTAL)
    expect(wrapper.findComponent({ name: 'CardSelector' }).exists()).toBe(true)
  })

  test('confirming human selection advances to build with cards auto-placed', async () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.onUseCaseContinue()
    selectInitial(wrapper.vm.match, 'p1')
    wrapper.vm.bumpMatch()
    await nextTick()
    expect(wrapper.vm.match.phase).toEqual('build')
    expect(wrapper.vm.match.bothBoardsComplete()).toBe(true)
  })

  test('simulate phase auto-animates then continue finishes the iteration', async () => {
    const wrapper = mountPage()
    wrapper.vm.skipAnimation = true
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.onUseCaseContinue()
    selectInitial(wrapper.vm.match, 'p1')
    wrapper.vm.startSimulatePhase()
    await nextTick()
    expect(wrapper.vm.match.phase).toEqual('simulate')
    expect(wrapper.vm.currentSimulation).not.toBeNull()
    expect(wrapper.vm.pipelineAnimating).toBe(false)
    expect(wrapper.vm.pipelineStopIndex).toEqual(wrapper.vm.pipelineMaxHaltIndex)
    expect(wrapper.findComponent({ name: 'RequestPipeline' }).exists()).toBe(true)

    wrapper.vm.onSimulateContinue()
    await nextTick()
    expect(wrapper.vm.match.phase).toEqual('iterationSummary')
    expect(wrapper.vm.currentSimulation).toBeNull()
    expect(wrapper.findComponent({ name: 'RoundSummary' }).text()).toContain('Required cards')
  })

  test('playing all four iterations reaches match end', async () => {
    const wrapper = mountPage()
    wrapper.vm.skipAnimation = true
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot', seed: 11 })

    for (let i = 0; i < ITERATIONS_PER_MATCH; i++) {
      wrapper.vm.onUseCaseContinue()
      if (wrapper.vm.match.selectionState.mode === 'initial') {
        selectInitial(wrapper.vm.match, 'p1')
      } else {
        const owned = new Set(wrapper.vm.match.players.p1.drafted)
        const picks = [
          'controller-middleware', 'controller-authorization', 'controller-csrf-protection',
          'controller-rate-limiting', 'model-caching', 'model-data-validation',
          'model-file-storage-adapter', 'model-secrets-manager', 'view-mobile-view',
          'view-cli-view', 'view-output-validation'
        ].filter(id => !owned.has(id)).slice(0, UPGRADE_CARDS_PER_TURN)
        for (const id of picks) {
          wrapper.vm.match.toggleSelectCard('p1', id)
        }
        wrapper.vm.match.confirmSelection('p1')
      }
      wrapper.vm.startSimulatePhase()
      await nextTick()
      wrapper.vm.onSimulateContinue()
      wrapper.vm.onIterationSummaryContinue()
    }

    await nextTick()
    expect(wrapper.vm.match.phase).toEqual('matchEnd')
    expect(wrapper.vm.match.iterationHistory).toHaveLength(4)
    expect(wrapper.findComponent({ name: 'MatchEndModal' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'MatchEndModal' }).props('showing')).toBe(true)
  })

  test('after an iteration, next step is the new use case before upgrade select', async () => {
    const wrapper = mountPage()
    wrapper.vm.skipAnimation = true
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.onUseCaseContinue()
    selectInitial(wrapper.vm.match, 'p1')
    wrapper.vm.startSimulatePhase()
    await nextTick()
    wrapper.vm.onSimulateContinue()
    await nextTick()

    expect(wrapper.vm.match.phase).toEqual('iterationSummary')
    wrapper.vm.onIterationSummaryContinue()
    await nextTick()

    expect(wrapper.vm.match.phase).toEqual('useCase')
    expect(wrapper.vm.match.iterationNumber).toEqual(2)
    expect(wrapper.findComponent({ name: 'UseCaseBanner' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'UseCaseBanner' }).props('isUpgrade')).toBe(true)
    expect(wrapper.findComponent({ name: 'CardSelector' }).exists()).toBe(false)

    wrapper.vm.onUseCaseContinue()
    await nextTick()
    expect(wrapper.vm.match.phase).toEqual('select')
    expect(wrapper.vm.match.selectionState.mode).toEqual('upgrade')
    expect(wrapper.text()).toContain('Upgrade for this use case')
  })

  test('auto pipeline advances over about 15 seconds', async () => {
    jest.useFakeTimers()
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.onUseCaseContinue()
    selectInitial(wrapper.vm.match, 'p1')
    wrapper.vm.startSimulatePhase()
    await nextTick()

    expect(wrapper.vm.pipelineAnimating).toBe(true)
    expect(wrapper.vm.pipelineStopIndex).toEqual(0)

    const halt = wrapper.vm.pipelineMaxHaltIndex
    jest.advanceTimersByTime(15000)
    await nextTick()

    expect(wrapper.vm.pipelineStopIndex).toEqual(halt)
    expect(wrapper.vm.pipelineAnimating).toBe(false)
    wrapper.vm.clearPipelineTimer()
    jest.useRealTimers()
  })

  test('rematch clears the match back to setup', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.onRematch()
    expect(wrapper.vm.match).toBeNull()
    expect(wrapper.findComponent({ name: 'FlowSetup' }).exists()).toBe(true)
  })

  test('exitToHome navigates home', () => {
    const wrapper = mountPage()
    wrapper.vm.exitToHome()
    expect(stubRouter.push).toHaveBeenCalledWith('/')
  })
})
