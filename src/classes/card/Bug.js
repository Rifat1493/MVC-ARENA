import Card from '@/classes/card/Card'

/**
 * Class for the Bug hazard card.
 * @extends Card
 */
class Bug extends Card {
  /**
   * Creates a new Bug card.
   * @param {Deck} deck - The deck the card is in.
   */
  constructor (deck) {
    super(0, 'BUG', deck, Card.imgPath('bug'))
  }
}

export default Bug
