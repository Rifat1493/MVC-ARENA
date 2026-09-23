/**
 * Helpers for validating component-card lane placement in Base Mode.
 */

const COMPONENT_TYPES = ['MODEL', 'VIEW', 'CONTROLLER']
const WRONG_LANE_MESSAGE = 'Play the card in the designated lane'

/**
 * @param {string} type - A card type.
 * @return {bool} True if the type is MODEL, VIEW, or CONTROLLER.
 */
function isComponentType (type) {
  return COMPONENT_TYPES.includes(type)
}

/**
 * Message when a component is dropped in the wrong lane or Inheritance stack.
 * @return {string}
 */
function wrongLaneMessage () {
  return WRONG_LANE_MESSAGE
}

/**
 * Message when a component is dropped on the wrong Inheritance (method) stack.
 * @return {string}
 */
function wrongInheritanceMessage () {
  return WRONG_LANE_MESSAGE
}

export {
  COMPONENT_TYPES,
  WRONG_LANE_MESSAGE,
  isComponentType,
  wrongLaneMessage,
  wrongInheritanceMessage
}
