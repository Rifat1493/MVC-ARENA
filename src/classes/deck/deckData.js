/**
 *
 * Contains information on what cards to use in a deck.
 *
 * I ended up with a layout that did not work well for proper documentation
 * so some descriptions of the file layout is given here in markdown for API
 * documentation. More info on what is in each deck can be found by looking in
 * the source code.
 *
 * Each deck is an object setup like so:
 * ```
 * {
 *   base  // The cards types used in the base for the deck
 *   extra // The cards to include along with the base deck
 * }
 * ```
 *
 * The card types objects are set up as objects like so:
 * ```
 * {
 *   type // The type of the card
 *   val  // The value of the card
 *   num  // The number of cards of this type to add
 * }
 * ```
 *
 * The levels for each mode are a list of 4 items that look like so:
 * ```
 * {
 *   id          // the name of the deck (can be used to index) deckData.<mode>[id] for deck data
 *   name        // The display name for the level
 *   description // A list of safety and attack cards added in the level
 * }
 * ```
 *
 * Export object looks like this:
 * ```
 * {
 *   beginner:       // a collection of beginner mode data
 *   {
 *     malware1      // The malware1 deck info i.e. { base, extra }
 *     malware2      // The malware2 deck info
 *     hack1         // The hack1 deck info
 *     hack2         // The hack2 deck info
 *     default       // The default deck
 *     levels        // List of decks, names and descriptions
 *   },
 *   standard:       // a collection of standard deck data
 *   {
 *     stdMalware    // The only malware deck info i.e. { base, extra }
 *     stdHack       // The only hacks deck info
 *     stdCombined1  // Deck info for 2 malware and 2 hack cards
 *     stdCombined2  // Deck info for a different set of 2 malware and 2 hack cards
 *     default       // The default deck
 *     levels        // List of decks, names and descriptions
 *   }
 * }
 * ```
 *
 * @module deckData
 */

// make an object to record the type value and number of a card that
// will be in a deck.
function makeType (type, val, num) {
  return { type, val, num }
}

// Begginer Decks ////////////////////////////////////////////////////////////

// Base cards to add to each beginner deck
// DEVELOPMENT: Replaced INSTRUCTION with MODEL, VIEW, CONTROLLER component cards
const beginnerBase = [
  // MODEL cards (6 types, 12 cards total)
  makeType('MODEL', 'caching', 2),
  makeType('MODEL', 'data_validation', 2),
  makeType('MODEL', 'database', 3),
  makeType('MODEL', 'file_storage_adapter', 2),
  makeType('MODEL', 'orm', 2),
  makeType('MODEL', 'secrets_manager', 1),

  // VIEW cards (4 types, 8 cards total)
  makeType('VIEW', 'cli_view', 2),
  makeType('VIEW', 'input_validation', 2),
  makeType('VIEW', 'mobile_view', 2),
  makeType('VIEW', 'web_view', 2),

  // CONTROLLER cards (6 types, 12 cards total)
  makeType('CONTROLLER', 'Middleware', 2),
  makeType('CONTROLLER', 'Routing', 2),
  makeType('CONTROLLER', 'authentication', 2),
  makeType('CONTROLLER', 'authorization', 2),
  makeType('CONTROLLER', 'csrf_protection', 2),
  makeType('CONTROLLER', 'rate_limiting', 2),

  // METHOD cards
  makeType('METHOD', 0, 12)
]

// DEVELOPMENT: Simplified to include all attacking cards
const b1Special = [
  makeType('RANSOM', 0, 3),
  makeType('CSRF', 0, 2),
  makeType('DOS', 0, 2),
  makeType('MALWARE', 0, 2),
  makeType('SQL_INJECTION', 0, 2),
  makeType('UNAUTHORIZED_ACCESS', 0, 2),
  makeType('XSS', 0, 2)
]

// Full deck objects containing lists of base and extra cards
const malware1 = {
  base: beginnerBase,
  extra: b1Special
}

// Default deck for beginner mode
const beginnerDefault = malware1

// List of level descriptions - DEVELOPMENT: Component cards (MODEL, VIEW, CONTROLLER), METHOD, and RANSOM
const beginnerLevels = [
  {
    id: 'malware1',
    name: 'Malware 1',
    description: 'MVC Components, Method, and Ransom'
  }
]

// Exports ///////////////////////////////////////////////////////////////////

export default {
  beginner: {
    malware1,
    default: beginnerDefault,
    levels: beginnerLevels
  }
}
