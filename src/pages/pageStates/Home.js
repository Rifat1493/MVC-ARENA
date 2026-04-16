import Player from '@/classes/player/Player'
import AIPlayer from '@/classes/player/AIPlayer'
import deckData from '@/classes/deck/deckData'

/**
 * Home page state for setting up the information needed to start a game.
 *
 * @prop {Object[]} players - Information for players to add to the game.
 * ```
 * {
 *   name        // The name of the player
 *   isAI        // True if the player is a Bot
 *   personality // The personality to use when creating an AIHandler
 * }
 * ```
 * @prop {Object} level - Info on the level to use when building the deck.
 */
class Home {
  constructor () {
    this.players = []
    this.message = ''
    this.level = deckData.beginner.levels[0]
  }

  /**
   * Sort the player list so that human payers are always before AI players.
   */
  sortPlayers () {
    this.players.sort((a,b) => {
      if (a.isAI && !b.isAI) {
        return 1
      } else if (!a.isAI && b.isAI) {
        return -1
      } else {
        return 0
      }
    })
  }

  /**
   * Adds a player with the given name, and other details if given.
   *
   * If the name is taken will set the message to say so and will not add
   * the player.
   *
   * @param {string} name - The name to give the player.
   * @param {bool} [isAI=false] - Whether the player is an AI player.
   * @param {string} [personality='none'] - The AI personality.
   */
  addPlayer (name, isAI = false, personality = 'none') {
    if (!this.nameInUse(name)) {
      this.players.push({name, isAI, personality})
      this.sortPlayers()
    } else {
      this.message = "A player is already using that name"
    }
  }

  /**
   * Adds a new bot to the player list.
   */
  addBot () {
    const botName = 'n00b_b0t'
    if (!this.nameInUse(botName)) {
      this.addPlayer(botName, true, 'beginner')
    } else {
      let randomName = 'b0t_' + Math.floor(Math.random() * 10000)
      this.addPlayer(randomName, true, 'beginner')
    }
  }

  /**
   * Removes the player with the given name from the player list.
   * @param {string} name - The name of the player to remove.
   */
  removePlayer (name) {
    this.players = this.players.filter(p => p.name !== name)
  }

  /**
   * Removes all the AI players from the player list.
   */
  removeBots () {
    this.players = this.players.filter(p => !p.isAI)
  }

  /**
   * Checks if the game is able to start.
   *
   * If the game is not ready then it will set the message to indicate why.
   * I.e there are not enough players, or no human players.
   *
   * @return {bool} True if the game can start.
   */
  canStart () {
    let result = true
    if (!this.hasEnoughPlayers()) {
      this.message = "You don't have the right number of players"
      result = false
    } else if (!this.hasHuman()) {
      this.message = "You must add at least 1 human player"
      result = false
    }
    return result
  }

  /**
   * Returns true if the game has enough players to start, right now it is 2
   * as we only have 2 player games.
   */
  hasEnoughPlayers () {
    return this.players.length === 2
  }

  /**
   * Returns true if number of players is at the limit.
   */
  atPlayerLimit () {
    return this.players.length >= 2
  }

  /**
   * Checks to see if a given name is already in use.
   * @param {string} name - The name to check.
   * @return {bool} True if the name is already being used.
   */
  nameInUse (name) {
    return this.players.find(p => p.name === name) !== undefined
  }

  /**
   * Check to see if the player list contains at least 1 human player.
   * @return {bool} True if there is a human player in the player list.
   */
  hasHuman () {
    return this.players.find(p => !p.isAI) !== undefined
  }

  /**
   * Check to see if the player list contains at least 1 AI player
   * @return {bool} True if there is a AI player in the player list.
   */
  hasBot () {
    return this.players.find(p => p.isAI) !== undefined
  }

  /**
   * Creates new {@link Player} objects for each player in the list.
   * @return {Player[]} A list of players for each player in the list.
   */
  createPlayers () {
    let id = 0
    return this.players.map((p) => {
      return this.createPlayer(id++, p)
    })
  }

  /**
   * Creates a new {@link Player} using the given id and playerInfo.
   * @param {int} id - The ID of the new player.
   * @param {Object} playerInfo - The player's information, See {@link Home#addPlayer}.
   * @return {Player} The new player object.
   */
  createPlayer (id, playerInfo) {
    if (playerInfo.isAI) {
      return new AIPlayer(id, playerInfo.name, 'beginner')
    } else {
      return new Player(id, playerInfo.name)
    }
  }
}

export default Home;
