import Card from '@/classes/card/Card'
import EffectFactory from '@/classes/statusEffect/EffectFactory'

/**
 * Class for any card that only adds a negative StatusEffect to a target player.
 *
 * i.e. RANSOM, SQL_INJECTION, etc.
 * @extends Card
 */
class NegativeEffectCard extends Card {
  /**
   * Creates a new NegativeEffectCard for a given card type.
   * @param {string} type - The type of effect.
   * @param {Deck} deck - The deck the card is in.
   */
  constructor (type, deck) {
    super(0, type, deck, 'static/cardImages/attack/' + type.toLowerCase() + '.png')
  }

  /**
   * Plays a negative effect card.
   *
   * If the player is affected by the effect or is protected from it
   * the card will be discarded. If the player has a `scan` active the card
   * the `scan` effect will be removed and the negative effect card discarded.
   *
   * @param {Object} playInfo - Information about how the card was played.
   * @param {Player} playInfo.target - The target of the effect.
   * @param {Player} playInfo.player - The player that played the card.
   * @param {bool} playInfo.replaced - True if the card was replaced by a mimic,
   * otherwise `undefined`.
   * @param {Player} playInfo.attacker - The player that played the card. **Only**
   * used if the card is a replacement created by a mimicked card.
   */
  play (playInfo) {
    const defenseMatch = playInfo.target.getDefenseCardForAttack(this.type)
    if (defenseMatch) {
      const defenseCard = defenseMatch.card
      const defenseStack = defenseMatch.stack
      playInfo.blockedBy = {
        attackImage: this.image,
        defenseImage: defenseCard.image,
        message: `${this._displayName(defenseCard)} encountered ${this._displayName(this)}`
      }
      if (defenseStack) {
        defenseStack.cards = defenseStack.cards.filter(c => c !== defenseCard)
        defenseCard.discard()
      }
      this.discard()
      return
    }

    if (!playInfo.target.hurtBy(this.type)
        && !playInfo.target.protectedFrom(this.type)) {
      if (playInfo.target.helpedBy('SCAN')) {
        this._blockedByScan(playInfo)
        this.discard()
      } else {
        const extraTurns = playInfo.replaced ? 1 : 0
        const fact = new EffectFactory(playInfo.target)
        const attacker = playInfo.replaced ? playInfo.attacker : playInfo.player
        const effect = fact.newNegativeFromCard(this, extraTurns, attacker)
        playInfo.target.effects.addNegative(effect)
      }
    } else {
      this.discard()
    }
  }

  /**
   * Builds a display name for a card or component card.
   * @param {Card} card - The card to describe.
   * @return {string} The display name.
   * @private
   */
  _displayName (card) {
    if (card.componentName) {
      return this._titleize(card.componentName)
    }
    if (card.type === 'SQL_INJECTION') { return 'SQL Injection' }
    if (card.type === 'UNAUTHORIZED_ACCESS') { return 'Unauthorized Access' }
    if (card.type === 'XSS' || card.type === 'CSRF' || card.type === 'DOS') {
      return card.type
    }
    if (card.type === 'GIT') { return 'Git' }
    return this._titleize(card.type)
  }

  /**
   * Turns a constant-style name into Title Case.
   * @param {string} value - The value to titleize.
   * @return {string} Title-cased string.
   * @private
   */
  _titleize (value) {
    return value
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
}

export default NegativeEffectCard;
