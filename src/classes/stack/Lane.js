import MethodStack from '@/classes/stack/MethodStack'

/**
 * Class to represent a single lane in the PlayField.
 * Each lane has its own method stack and collection of regular stacks.
 * @prop {int} laneIndex - The index of the lane (0, 1, or 2).
 * @prop {Player} player - The player that owns this lane.
 * @prop {MethodStack} method - The lane's MethodStack.
 * @prop {Stack[]} stacks - The regular stacks in this lane.
 */
class Lane {
  /**
   * Creates a new Lane.
   * @param {Player} player - The player that owns the Lane.
   * @param {int} laneIndex - The index of the lane (0, 1, or 2).
   */
  constructor (player, laneIndex) {
    this.player = player
    this.laneIndex = laneIndex
    this.method = new MethodStack(player, laneIndex)
    this.stacks = []
  }

  /**
   * Adds a card to the top of the given stack in this lane.
   *
   * If the addition completes the stack (and it is not the MethodStack) it will
   * be moved to the back of the stacks list.
   *
   * @param {Card} card - The card to add.
   * @param {Stack} stack - The stack to add the card to.
   */
  addCardToStack (card, stack) {
    stack.cards.push(card)
    if (stack.isComplete() && stack !== this.method) {
      this.stacks = this.stacks.filter(s => s !== stack)
      this.stacks.push(stack)
    }
  }

  /**
   * Add a new stack to this lane.
   *
   * Always places new stacks in front of completed stacks. Will place
   * stacks started with `method` cards in front of stacks that are made
   * up of a single `instruction`.
   *
   * @param {Stack} stack - The stack to add.
   */
  addStack (stack) {
    const baseType = stack.getBase().type

    const completeStack = this.stacks.find(s => s.isComplete())
    const singleInstruction = this.stacks.find((s) => {
      return s.cards.length === 1 && s.getBase().type === 'INSTRUCTION'
    })

    let idx = this.stacks.length
    if (baseType === 'METHOD' && singleInstruction) {
      idx = this.stacks.indexOf(singleInstruction)
    } else if (completeStack) {
      idx = this.stacks.indexOf(completeStack)
    }

    this.stacks.splice(idx, 0, stack)
  }

  /**
   * Returns the total score of all the stacks in this lane (excluding the MethodStack).
   * @return {int} The total score of all stacks in the lane.
   */
  getScore () {
    return this.stacks.reduce((acc, stack) => {
      return acc += stack.getScore()
    }, 0)
  }

  /**
   * Cleans all `virus` cards from the stacks in this lane.
   * @return {Virus[]} All of the removed `virus` cards.
   */
  cleanViruses () {
    const infected = this.getStacksWithVirus()
    return infected.map(s => s.cards.pop())
  }

  /**
   * Returns a list of all the stacks in this lane that have `virus` cards on them.
   * @return {Stack[]} The stacks that have `virus` cards on them.
   */
  getStacksWithVirus () {
    return this.stacks.filter(s => s.getTop().type === 'VIRUS')
  }

  /**
   * Returns all stacks in this lane (including the method stack).
   * @return {Stack[]} All stacks in the lane.
   */
  getAllStacks () {
    return [this.method, ...this.stacks]
  }
}

export default Lane;
