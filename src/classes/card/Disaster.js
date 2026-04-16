import Card from '@/classes/card/Card'

/**
 * Class for the Disaster hazard card.
 * @extends Card
 */
class Disaster extends Card {
  /**
   * Creates a new Disaster card.
   * @param {Deck} deck - The deck the card is in.
   */
  constructor (deck) {
    super(0, 'DISASTER', deck, Card.imgPath('disaster'))
  }
}

export default Disaster
