import Card from '@/classes/card/Card'
import Stack from '@/classes/stack/Stack'

/**
 * Class for Component cards (Model, View, Controller).
 * Cards can be played on Method Stack (accumulate points) OR in their specific lanes.
 * @extends Card
 */
class ComponentCard extends Card {
  /**
   * Create a new Component card.
   * @param {string} type - The component type ('MODEL', 'VIEW', 'CONTROLLER').
   * @param {string} name - The specific component name (e.g., 'caching', 'web_view').
   * @param {Deck} deck - The deck the card is in.
   */
  constructor (type, name, deck) {
    const imagePath = ComponentCard.getImagePath(type, name)
    super(1, type, deck, imagePath)
    this.componentName = name
  }

  /**
   * Get the lane index for this component type.
   * Model (lane 0), View (lane 1), Controller (lane 2).
   * @return {int} The lane index where this card can be played.
   */
  getLaneIndex () {
    switch (this.type) {
      case 'MODEL': return 0
      case 'VIEW': return 1
      case 'CONTROLLER': return 2
      default: return 0
    }
  }

  /**
   * Get the image path for a component card.
   * @param {string} type - The component type.
   * @param {string} name - The component name.
   * @return {string} The path to the card image.
   */
  static getImagePath (type, name) {
    const typeFolder = type.toLowerCase()
    return `static/cardImages/${typeFolder}/${name}.png`
  }

  /**
   * Plays a component card.
   * Can be played on Method Stack (points accumulate) or start a stack in their specific lane.
   *
   * @param {Object} playInfo - Information about how the card was played.
   * @param {Stack} playInfo.stack - The stack the card was played on. Required if on Method Stack.
   * @param {PlayField} playInfo.playField - The playField the card was played on. Required if starting new stack.
   * @param {int} [playInfo.laneIndex] - The lane index (auto-determined for component cards).
   */
  play (playInfo) {
    // If played on Method/Inheritance Stack
    if (playInfo.stack) {
      if (playInfo.stack.isMethod) {
        // Play on method stack - points accumulate
        playInfo.stack.player.playField.addCardToStack(this, playInfo.stack)
      } else {
        // Cannot play component cards on regular stacks
        this.discard()
      }
    } else {
      // Start new stack in component's specific lane
      const correctLaneIndex = this.getLaneIndex()
      const newStack = new Stack(this, playInfo.playField.player)
      playInfo.playField.addStack(newStack, correctLaneIndex)
    }
  }
}

export default ComponentCard

