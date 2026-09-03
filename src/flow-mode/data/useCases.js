/**
 * Catalog of 15 software-building use cases for Flow Mode. Each use case
 * names the MVC cards required to fulfill its request/response flow and the
 * security consequence of failing to do so.
 *
 * Required card ids reference {@link module:flow-mode/data/cards}.
 *
 * @module flow-mode/data/useCases
 */

/**
 * @typedef {Object} UseCase
 * @prop {string} id - Stable unique id.
 * @prop {string} title - Short display title.
 * @prop {string} description - What the student is building / simulating.
 * @prop {string} securityRisk - Short threat label (e.g. 'SQL Injection').
 * @prop {string} consequence - What happens if required cards are missing.
 * @prop {string[]} requiredCardIds - Ordered card ids that must be installed.
 * @prop {int} difficulty - 1 (easy), 2 (medium), or 3 (hard).
 */

/** @type {UseCase[]} */
const USE_CASES = [
  {
    id: 'mobile-login',
    title: 'Login from Mobile App',
    description: 'Imagine a customer opens the app on a phone and tries to sign in. Can the system recognize the right person, find the account, and return a screen suited to that device?',
    securityRisk: 'Account Takeover / Session Abuse',
    consequence: 'Weak identity checks can let an attacker impersonate a customer and take over the account.',
    requiredCardIds: [
      'controller-routing',
      'controller-authentication',
      'model-database',
      'view-mobile-view'
    ],
    difficulty: 1
  },
  {
    id: 'account-registration',
    title: 'Create New Account',
    description: 'Imagine a new visitor submits personal details to create an account. Can the system reject unsafe values, save a valid account, and confirm the result in the browser?',
    securityRisk: 'SQL Injection',
    consequence: 'Without ORM and Data Validation, registration forms become an SQL injection entry point.',
    requiredCardIds: [
      'controller-routing',
      'model-data-validation',
      'model-orm',
      'model-database',
      'view-web-view'
    ],
    difficulty: 2
  },
  {
    id: 'product-search',
    title: 'Search Product Catalog',
    description: 'Imagine a shopper searches the catalog with a keyword. Can the request reach the right logic, retrieve matching records safely, and present useful results?',
    securityRisk: 'SQL Injection',
    consequence: 'Raw search queries without an ORM let attackers inject SQL and steal or corrupt catalog data.',
    requiredCardIds: [
      'controller-routing',
      'model-orm',
      'model-database',
      'view-web-view'
    ],
    difficulty: 1
  },
  {
    id: 'profile-update',
    title: 'Update User Profile',
    description: 'Imagine a signed-in customer changes an address or display name. Can the system confirm the request is genuine, check the new details, save them, and show the update?',
    securityRisk: 'CSRF / Data Tampering',
    consequence: 'Without CSRF Protection and Authorization, attackers trick users into changing their own profile data.',
    requiredCardIds: [
      'controller-authentication',
      'controller-authorization',
      'controller-csrf-protection',
      'model-data-validation',
      'model-database',
      'view-web-view'
    ],
    difficulty: 3
  },
  {
    id: 'post-comments',
    title: 'Post a Comment',
    description: 'Imagine a community member publishes a comment that other visitors will read later. Can the system accept, save, and display it without allowing hidden code to run?',
    securityRisk: 'XSS / Cross-Site Scripting',
    consequence: 'Without Output Validation, stored comment scripts execute in other users\' browsers.',
    requiredCardIds: [
      'controller-routing',
      'model-data-validation',
      'model-database',
      'view-output-validation',
      'view-web-view'
    ],
    difficulty: 2
  },
  {
    id: 'file-upload',
    title: 'Upload a User File',
    description: 'Imagine a customer uploads a document and expects to see a confirmation. Can the system inspect the submission, store it safely, and complete the request?',
    securityRisk: 'Malware Upload',
    consequence: 'Without a File Storage Adapter and validation, malware can be uploaded and executed on the server.',
    requiredCardIds: [
      'controller-middleware',
      'model-data-validation',
      'model-file-storage-adapter',
      'view-web-view'
    ],
    difficulty: 2
  },
  {
    id: 'admin-dashboard',
    title: 'Open Admin Dashboard',
    description: 'Imagine a staff member opens a privileged dashboard. Can the system confirm who they are, check what they may access, retrieve the information, and display it?',
    securityRisk: 'Unauthorized Access',
    consequence: 'Without Authentication and Authorization, anyone can reach admin tools and steal privileged data.',
    requiredCardIds: [
      'controller-authentication',
      'controller-authorization',
      'controller-routing',
      'model-database',
      'view-web-view'
    ],
    difficulty: 2
  },
  {
    id: 'password-reset',
    title: 'Reset Forgotten Password',
    description: 'Imagine a customer who cannot sign in follows a one-time recovery link. Can the system control repeated attempts, protect the recovery value, update the account, and return confirmation?',
    securityRisk: 'Reset-Token Abuse / Account Takeover',
    consequence: 'Exposed recovery values or unlimited reset attempts can let an attacker take over an account.',
    requiredCardIds: [
      'controller-routing',
      'controller-rate-limiting',
      'model-secrets-manager',
      'model-database',
      'view-web-view'
    ],
    difficulty: 2
  },
  {
    id: 'api-rate-abuse',
    title: 'Open Public Data Dashboard',
    description: 'Imagine many visitors open a public status dashboard at once. Can the system manage the surge, direct each request, retrieve current information, and keep the page available?',
    securityRisk: 'Denial of Service (DoS)',
    consequence: 'Uncontrolled request volume can overwhelm the service and prevent legitimate visitors from receiving a response.',
    requiredCardIds: [
      'controller-rate-limiting',
      'controller-middleware',
      'controller-routing',
      'model-database',
      'view-web-view'
    ],
    difficulty: 2
  },
  {
    id: 'cached-catalog',
    title: 'Browse Cached Catalog',
    description: 'Imagine many shoppers repeatedly open the same popular catalog pages. Can the system return them quickly without performing the same slow work for every visitor?',
    securityRisk: 'Performance Abuse / Overload',
    consequence: 'Without Caching, repeated catalog hits overload the database and degrade availability.',
    requiredCardIds: [
      'controller-routing',
      'model-caching',
      'model-database',
      'view-web-view'
    ],
    difficulty: 1
  },
  {
    id: 'private-file-download',
    title: 'Download Private File',
    description: 'Imagine a customer requests a private document. Can the system confirm the person is allowed to receive it, retrieve the correct file, and deliver it without exposing anyone else’s data?',
    securityRisk: 'Unauthorized Data Theft',
    consequence: 'Without Authorization and File Storage Adapter, private files can be stolen by anyone who guesses a URL.',
    requiredCardIds: [
      'controller-authentication',
      'controller-authorization',
      'model-file-storage-adapter',
      'view-web-view'
    ],
    difficulty: 2
  },
  {
    id: 'secrets-integration',
    title: 'Show Live Delivery Quote',
    description: 'Imagine a checkout page requests a live delivery quote from an outside provider. Can the system contact that service without exposing private credentials and present the quote to the shopper?',
    securityRisk: 'Credential Leakage / Third-Party Abuse',
    consequence: 'Exposed service credentials can let attackers impersonate the application and abuse the outside provider.',
    requiredCardIds: [
      'controller-routing',
      'controller-middleware',
      'model-secrets-manager',
      'model-caching',
      'view-web-view'
    ],
    difficulty: 2
  },
  {
    id: 'cli-maintenance',
    title: 'Run CLI Maintenance Job',
    description: 'Imagine an operator starts a powerful maintenance task from a terminal. Can the system allow only approved staff, update the correct records, and return a clear result?',
    securityRisk: 'Unauthorized Maintenance Access',
    consequence: 'Without Authentication and a CLI View, untrusted operators can run destructive maintenance commands.',
    requiredCardIds: [
      'controller-authentication',
      'controller-authorization',
      'model-database',
      'view-cli-view'
    ],
    difficulty: 1
  },
  {
    id: 'checkout-payment',
    title: 'Checkout and Pay',
    description: 'Imagine a signed-in shopper submits an order and payment. Can the system reject forged or malformed requests, handle sensitive values safely, record the purchase, and show confirmation?',
    securityRisk: 'Payment Fraud / Forged Requests / Injection',
    consequence: 'Weak checkout controls can allow forged orders, unsafe input, credential exposure, or tampering with purchase records.',
    requiredCardIds: [
      'controller-authentication',
      'controller-csrf-protection',
      'model-data-validation',
      'model-secrets-manager',
      'model-orm',
      'model-database',
      'view-web-view'
    ],
    difficulty: 3
  },
  {
    id: 'secure-report-export',
    title: 'Export Secure Report',
    description: 'Imagine a staff member requests an export containing sensitive records. Can the system verify access, retrieve the right information safely, and produce an output that cannot execute hidden content?',
    securityRisk: 'Data Theft / XSS in Exports',
    consequence: 'Without Authorization, ORM, and Output Validation, reports leak or carry injected scripts.',
    requiredCardIds: [
      'controller-authentication',
      'controller-authorization',
      'model-orm',
      'model-database',
      'view-output-validation',
      'view-web-view'
    ],
    difficulty: 3
  }
]

/**
 * Finds a use case by id.
 * @param {string} id - Use case id.
 * @return {UseCase|undefined} Matching use case, if any.
 */
function useCaseById (id) {
  return USE_CASES.find(uc => uc.id === id)
}

export { USE_CASES, useCaseById }
