import Card from '@/classes/card/Card'

/**
 * Class for the Logger defensive card.
 * @extends Card
 */
class Logger extends Card {
  /**
   * Creates a new Logger card.
   * @param {Deck} deck - The deck the card is in.
   */
  constructor (deck) {
    super(2, 'LOGGER', deck, 'static/cardImages/defensive/logger.png')
  }

  /**
   * Plays the logger card on a target stack.
   *
   * If the stack is complete or a method stack, the card is discarded.
   *
   * @param {Object} playInfo - Information about how the card was played.
   * @param {Stack} playInfo.stack - The stack the card was played on.
   */
  play ({ stack }) {
    if (!stack.isMethod && !stack.isComplete()) {
      stack.player.playField.addCardToStack(this, stack)
    } else {
      this.discard()
    }
  }
}

export default Logger
