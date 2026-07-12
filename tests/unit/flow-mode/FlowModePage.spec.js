import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FlowModePage from '@/flow-mode/FlowModePage'
import { cardById } from '@/flow-mode/data/cards'
import { DRAFT_PICKS } from '@/flow-mode/engine/constants'
import { setPendingSetup } from '@/flow-mode/pendingSetup'

/** Drafts all 5 picks for a human player by always taking the first offer. */
function draftAll (match, playerId) {
  while (match.draftState[playerId].pickIndex < DRAFT_PICKS) {
    match.pickDraftCard(playerId, match.draftState[playerId].options[0].id)
  }
}

/** Places every drafted card for a player into its native layer. */
function buildAll (match, playerId) {
  for (const cardId of [...match.players[playerId].drafted]) {
    match.placeCard(playerId, cardId, cardById(cardId).layer)
  }
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

  test('auto-starts using the players handed off via setPendingSetup, skipping FlowSetup', () => {
    setPendingSetup({ player1Name: 'Alice', player2IsBot: false, player2Name: 'Bob' })
    const wrapper = mountPage()

    expect(wrapper.findComponent({ name: 'FlowSetup' }).exists()).toBe(false)
    expect(wrapper.vm.match).not.toBeNull()
    expect(wrapper.vm.match.players.p1.displayName).toEqual('Alice')
    expect(wrapper.vm.match.players.p2.displayName).toEqual('Bob')
    expect(wrapper.vm.match.players.p2.isBot).toBe(false)
  })

  test('auto-starts with a bot player 2 when player2IsBot is true', () => {
    setPendingSetup({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    const wrapper = mountPage()

    expect(wrapper.vm.match.players.p2.isBot).toBe(true)
  })

  test('starting a match builds the first forecast', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })

    expect(wrapper.vm.match).not.toBeNull()
    expect(wrapper.vm.match.phase).toEqual('forecast')
    expect(wrapper.vm.match.forecast).not.toBeNull()
  })

  test('forecast continue on round 1 goes to draft; the bot finishes instantly', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })

    wrapper.vm.onForecastContinue()

    expect(wrapper.vm.match.phase).toEqual('draft')
    expect(wrapper.vm.match.players.p2.drafted).toHaveLength(DRAFT_PICKS)
  })

  test('completing both players\' drafts advances to build', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.onForecastContinue()

    draftAll(wrapper.vm.match, 'p1')

    expect(wrapper.vm.match.phase).toEqual('build')
  })

  test('dropping a card in build calls placeCard through the engine', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.onForecastContinue()
    draftAll(wrapper.vm.match, 'p1')

    const cardId = wrapper.vm.match.players.p1.drafted[0]
    const layer = cardById(cardId).layer
    wrapper.vm.onDropCard('p1', { cardId, layer })

    expect(wrapper.vm.match.players.p1.layers[layer].map(s => s.cardId)).toContain(cardId)
  })

  test('unplacedCards shows a just-drafted human\'s hand until each card is placed', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.onForecastContinue()
    draftAll(wrapper.vm.match, 'p1')

    // Right after drafting, all 5 drafted cards are unplaced (this is what
    // the human drags from - previously nothing showed here at all).
    expect(wrapper.vm.unplacedCards('p1')).toHaveLength(5)

    const cardId = wrapper.vm.match.players.p1.drafted[0]
    const layer = cardById(cardId).layer
    wrapper.vm.onDropCard('p1', { cardId, layer })

    expect(wrapper.vm.unplacedCards('p1').map(c => c.id)).not.toContain(cardId)
    expect(wrapper.vm.unplacedCards('p1')).toHaveLength(4)
  })

  test('the bot has nothing left unplaced once it finishes drafting (it auto-places instantly)', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.onForecastContinue()

    expect(wrapper.vm.unplacedCards('p2')).toHaveLength(0)
  })

  test('currentRequestSummary describes a data request by its route/domain/output', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.currentRequestData = {
      request: { kind: 'data', route: 'Routing', dataDomain: 'Database', outputType: 'Web View' },
      resultP1: {}, resultP2: {}
    }

    expect(wrapper.vm.currentRequestSummary).toEqual('Data Request needs: Routing → Database → Web View')
  })

  test('currentRequestSummary names the threat type and the layer it targets', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.currentRequestData = {
      request: { kind: 'threat', threatType: 'SQL_INJECTION', targetLayer: 'model' },
      resultP1: {}, resultP2: {}
    }

    expect(wrapper.vm.currentRequestSummary).toEqual('⚠ Threat: SQL Injection attacking the Model layer')
  })

  test('currentRequestSummary is empty before any request has been resolved', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })

    expect(wrapper.vm.currentRequestSummary).toEqual('')
  })

  test('exitToHome navigates to the home route', () => {
    const wrapper = mountPage()
    wrapper.vm.exitToHome()
    expect(stubRouter.push).toHaveBeenCalledWith('/')
  })

  test('the serve button steps through a request, then moves to the next one', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.onForecastContinue()
    draftAll(wrapper.vm.match, 'p1')
    buildAll(wrapper.vm.match, 'p1')

    wrapper.vm.startServePhase()
    const firstRequestId = wrapper.vm.currentRequestData.request.id
    expect(wrapper.vm.pipelineStopIndex).toEqual(0)

    // Step through the first request one click at a time.
    while (wrapper.vm.pipelineStopIndex < wrapper.vm.pipelineMaxHaltIndex) {
      wrapper.vm.onServeButtonClick()
    }
    expect(wrapper.vm.currentRequestData.request.id).toEqual(firstRequestId)

    // One more click moves on to the next request and resets the step.
    wrapper.vm.onServeButtonClick()
    expect(wrapper.vm.pipelineStopIndex).toEqual(0)
    expect(wrapper.vm.currentRequestData.request.id).not.toEqual(firstRequestId)
  })

  test('shows both players\' card stacks below the serve button during serve', async () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.onForecastContinue()
    draftAll(wrapper.vm.match, 'p1')
    buildAll(wrapper.vm.match, 'p1')

    wrapper.vm.startServePhase()
    await nextTick()

    const boards = wrapper.findAllComponents({ name: 'LayerBoard' })
    expect(boards).toHaveLength(2)
    expect(boards[0].props('playerName')).toContain('Alice')
    expect(boards[1].props('playerName')).toContain('Bot')
    expect(boards[0].props('interactive')).toBe(false)
  })

  test('"Skip to result" jumps each new request straight to its outcome', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.skipAnimation = true
    wrapper.vm.onForecastContinue()
    draftAll(wrapper.vm.match, 'p1')
    buildAll(wrapper.vm.match, 'p1')

    wrapper.vm.startServePhase()

    expect(wrapper.vm.pipelineStopIndex).toEqual(wrapper.vm.pipelineMaxHaltIndex)
  })

  test('clicking through all 5 requests reaches roundSummary', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.skipAnimation = true
    wrapper.vm.onForecastContinue()
    draftAll(wrapper.vm.match, 'p1')
    buildAll(wrapper.vm.match, 'p1')

    wrapper.vm.startServePhase()
    // With skipAnimation on, every request starts already at its halt point,
    // so one click per request is enough to move through all 5.
    for (let i = 0; i < 5; i++) {
      wrapper.vm.onServeButtonClick()
    }

    expect(wrapper.vm.match.phase).toEqual('roundSummary')
    expect(wrapper.vm.match.roundHistory).toHaveLength(1)
    expect(wrapper.vm.currentRequestData).toBeNull()
  })

  test('round summary continue finalizes the (single-round) match', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
    wrapper.vm.onForecastContinue()
    draftAll(wrapper.vm.match, 'p1')
    buildAll(wrapper.vm.match, 'p1')
    wrapper.vm.match.startServe()
    while (wrapper.vm.match.serveState.currentIndex < wrapper.vm.match.currentRoundQueue.length) {
      wrapper.vm.match.resolveNextRequest()
    }
    expect(wrapper.vm.match.phase).toEqual('roundSummary')

    wrapper.vm.onRoundSummaryContinue()

    expect(wrapper.vm.match.phase).toEqual('matchEnd')
    expect(wrapper.vm.match.matchResult).not.toBeNull()
  })

  test('rematch resets back to the setup screen', () => {
    const wrapper = mountPage()
    wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })

    wrapper.vm.onRematch()

    expect(wrapper.vm.match).toBeNull()
    expect(wrapper.vm.pipelineStopIndex).toEqual(0)
  })

  describe('activeDraftPlayerId / hidden opponent picks', () => {
    test('p1 is active first when both players are human', () => {
      const wrapper = mountPage()
      wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: false, player2Name: 'Bea' })
      wrapper.vm.onForecastContinue()

      expect(wrapper.vm.activeDraftPlayerId).toEqual('p1')
    })

    test('p2 becomes active once p1 finishes drafting', () => {
      const wrapper = mountPage()
      wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: false, player2Name: 'Bea' })
      wrapper.vm.onForecastContinue()

      draftAll(wrapper.vm.match, 'p1')

      expect(wrapper.vm.activeDraftPlayerId).toEqual('p2')
    })

    test('a bot player 2 is never active - p1 is the sole active drafter', () => {
      const wrapper = mountPage()
      wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: true, player2Name: 'Bot' })
      wrapper.vm.onForecastContinue()

      expect(wrapper.vm.activeDraftPlayerId).toEqual('p1')
    })

    test('hiddenDraftMessage distinguishes a bot from a still-drafting human', () => {
      const wrapper = mountPage()
      wrapper.vm.onStart({ player1Name: 'Alice', player2IsBot: false, player2Name: 'Bea' })
      wrapper.vm.onForecastContinue()

      expect(wrapper.vm.hiddenDraftMessage('p2')).toMatch(/waiting/i)

      draftAll(wrapper.vm.match, 'p1')
      expect(wrapper.vm.hiddenDraftMessage('p1')).toMatch(/complete/i)
    })
  })
})
