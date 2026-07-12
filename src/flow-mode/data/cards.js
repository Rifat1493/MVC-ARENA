/**
 * The 16 Flow Mode cards: the exact same Model, View, and Controller
 * components used in Base Mode (see `src/classes/deck/cardCatalog.js` and
 * `src/classes/card/cardDescriptions.js`), reused with their real names,
 * descriptions, and artwork rather than invented Flow Mode-only cards.
 *
 * Each non-guard card `matches` its own name, which is what a data request's
 * `route`/`dataDomain`/`outputType` refers to. Each layer has exactly one
 * `guard` card: the real Base Mode component that defends against the
 * threat type Flow Mode targets at that layer (ORM/SQL Injection,
 * Output Validation/XSS, Authentication/session issues - mirroring how
 * these same cards defend attacks in Base Mode's `attackCounters`). A card
 * can only ever be placed in its own `layer`'s column.
 *
 * @module flow-mode/data/cards
 */

/**
 * @typedef {Object} FlowCard
 * @prop {string} id - Stable unique id.
 * @prop {string} name - Display name (identical to the Base Mode card's name).
 * @prop {string} layer - 'controller' | 'model' | 'view'.
 * @prop {string} kind - 'route' | 'handler' | 'template' | 'guard'.
 * @prop {string|null} matches - The route/domain/output this card serves (its own name), or null for guards.
 * @prop {string|null} blocks - The threat type this guard blocks, or null for non-guards.
 * @prop {string} description - The card's real Base Mode description (see cardDescriptions.js).
 * @prop {string} image - Path to the card's real Base Mode artwork.
 */

/** @type {FlowCard[]} */
const CARDS = [
  // --- Controller layer (same 6 cards as Base Mode's CONTROLLER catalog) ---
  {
    id: 'controller-routing', name: 'Routing', layer: 'controller', kind: 'route',
    matches: 'Routing', blocks: null,
    description: 'Routing: maps incoming URLs and requests to the code that should handle them.',
    image: 'static/cardImages/controller/Routing.png'
  },
  {
    id: 'controller-middleware', name: 'Middleware', layer: 'controller', kind: 'route',
    matches: 'Middleware', blocks: null,
    description: 'Middleware: code that runs between a request and its handler (logging, auth checks, parsing, etc.).',
    image: 'static/cardImages/controller/Middleware.png'
  },
  {
    id: 'controller-authorization', name: 'Authorization', layer: 'controller', kind: 'route',
    matches: 'Authorization', blocks: null,
    description: 'Authorization: decides WHAT an authenticated user is allowed to do (permissions). Defends against Unauthorized Access.',
    image: 'static/cardImages/controller/authorization.png'
  },
  {
    id: 'controller-csrf-protection', name: 'CSRF Protection', layer: 'controller', kind: 'route',
    matches: 'CSRF Protection', blocks: null,
    description: 'CSRF Protection: anti-forgery tokens that stop malicious sites from acting on a logged-in user\'s behalf. Defends against CSRF.',
    image: 'static/cardImages/controller/csrf_protection.png'
  },
  {
    id: 'controller-rate-limiting', name: 'Rate Limiting', layer: 'controller', kind: 'route',
    matches: 'Rate Limiting', blocks: null,
    description: 'Rate Limiting: caps how many requests a client can make in a time window to prevent abuse and overload. Defends against DoS.',
    image: 'static/cardImages/controller/rate_limiting.png'
  },
  {
    id: 'controller-authentication', name: 'Authentication', layer: 'controller', kind: 'guard',
    matches: null, blocks: 'SESSION_FORGERY',
    description: 'Authentication: verifies WHO a user is (login and identity). Defends against Unauthorized Access.',
    image: 'static/cardImages/controller/authentication.png'
  },

  // --- Model layer (same 6 cards as Base Mode's MODEL catalog) ---
  {
    id: 'model-database', name: 'Database', layer: 'model', kind: 'handler',
    matches: 'Database', blocks: null,
    description: 'Database: the persistent store where the application\'s data lives and is queried.',
    image: 'static/cardImages/model/database.png'
  },
  {
    id: 'model-caching', name: 'Caching', layer: 'model', kind: 'handler',
    matches: 'Caching', blocks: null,
    description: 'Caching: stores frequently used data in fast memory so the app responds quicker and takes load off the database.',
    image: 'static/cardImages/model/caching.png'
  },
  {
    id: 'model-data-validation', name: 'Data Validation', layer: 'model', kind: 'handler',
    matches: 'Data Validation', blocks: null,
    description: 'Data Validation: checks that data is well-formed and safe before the app stores or uses it. Defends against XSS.',
    image: 'static/cardImages/model/data_validation.png'
  },
  {
    id: 'model-file-storage-adapter', name: 'File Storage Adapter', layer: 'model', kind: 'handler',
    matches: 'File Storage Adapter', blocks: null,
    description: 'File Storage Adapter: a layer that saves and retrieves files (local disk or cloud) behind one common interface. Defends against Malware.',
    image: 'static/cardImages/model/file_storage_adapter.png'
  },
  {
    id: 'model-secrets-manager', name: 'Secrets Manager', layer: 'model', kind: 'handler',
    matches: 'Secrets Manager', blocks: null,
    description: 'Secrets Manager: securely stores and controls access to passwords, API keys and other secrets. Defends against Ransomware.',
    image: 'static/cardImages/model/secrets_manager.png'
  },
  {
    id: 'model-orm', name: 'ORM', layer: 'model', kind: 'guard',
    matches: null, blocks: 'SQL_INJECTION',
    description: 'ORM (Object-Relational Mapping): maps database tables to code objects and builds parameterized queries instead of raw SQL. Defends against SQL Injection.',
    image: 'static/cardImages/model/orm.png'
  },

  // --- View layer (same 4 cards as Base Mode's VIEW catalog) ---
  {
    id: 'view-web-view', name: 'Web View', layer: 'view', kind: 'template',
    matches: 'Web View', blocks: null,
    description: 'Web View: the browser-based user interface.',
    image: 'static/cardImages/view/web_view.png'
  },
  {
    id: 'view-mobile-view', name: 'Mobile View', layer: 'view', kind: 'template',
    matches: 'Mobile View', blocks: null,
    description: 'Mobile View: the user interface optimized for phones and tablets.',
    image: 'static/cardImages/view/mobile_view.png'
  },
  {
    id: 'view-cli-view', name: 'CLI View', layer: 'view', kind: 'template',
    matches: 'CLI View', blocks: null,
    description: 'CLI View: a command-line interface for interacting with the app through text commands.',
    image: 'static/cardImages/view/cli_view.png'
  },
  {
    id: 'view-output-validation', name: 'Output Validation', layer: 'view', kind: 'guard',
    matches: null, blocks: 'XSS',
    description: 'Output Validation: escapes and encodes data right before it is displayed, so malicious scripts embedded in it cannot run. Defends against XSS.',
    image: 'static/cardImages/view/output_validation.png'
  }
]

/**
 * Finds a card by its id.
 * @param {string} id - The card id to look up.
 * @return {FlowCard|undefined} The matching card, or undefined if not found.
 */
function cardById (id) {
  return CARDS.find(c => c.id === id)
}

/**
 * Returns all cards belonging to the given layer.
 * @param {string} layer - 'controller' | 'model' | 'view'.
 * @return {FlowCard[]} The cards in that layer.
 */
function cardsByLayer (layer) {
  return CARDS.filter(c => c.layer === layer)
}

export { CARDS, cardById, cardsByLayer }
