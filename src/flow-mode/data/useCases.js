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
    description: 'A user signs in from a phone. The system must verify identity, run request middleware, look up the account, and render the mobile login UI.',
    securityRisk: 'Session Theft / Session Forgery',
    consequence: 'Without Authentication and a safe mobile path, attackers forge sessions and steal accounts.',
    requiredCardIds: [
      'controller-authentication',
      'controller-middleware',
      'model-database',
      'view-mobile-view'
    ],
    difficulty: 1
  },
  {
    id: 'account-registration',
    title: 'Create New Account',
    description: 'A visitor registers with a web form. Input must be validated and stored safely with parameterized queries.',
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
    description: 'Users search products. Queries must hit the database safely and return results in the web UI.',
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
    description: 'An authenticated user changes profile details. The write must be authorized and protected from forged requests.',
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
    description: 'Users publish comments that are stored and later displayed. Output must be escaped before rendering.',
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
    description: 'A user uploads a document. The app must store files through a controlled adapter after validating input.',
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
    description: 'An administrator opens a privileged dashboard. Identity and permissions must both be enforced.',
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
    description: 'A user resets a password via email token. Secrets and identity checks must protect the reset flow.',
    securityRisk: 'Credential / Data Theft',
    consequence: 'Without Secrets Manager and Authentication, reset tokens leak and attackers take over accounts.',
    requiredCardIds: [
      'controller-authentication',
      'controller-routing',
      'model-secrets-manager',
      'model-database',
      'view-web-view'
    ],
    difficulty: 2
  },
  {
    id: 'api-rate-abuse',
    title: 'Public API Endpoint',
    description: 'Clients call a public API. Rate limiting and middleware must keep abusive traffic from overwhelming the service.',
    securityRisk: 'Denial of Service (DoS)',
    consequence: 'Without Rate Limiting, attackers flood the API and deny service to legitimate users.',
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
    description: 'Shoppers browse a frequently viewed catalog. Caching reduces database load while routing serves the page.',
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
    description: 'An authenticated user downloads a private file. Access control and the storage adapter must both be present.',
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
    title: 'Call External Payment API',
    description: 'The app calls a third-party API using stored credentials. Secrets must never be hard-coded.',
    securityRisk: 'Secrets / Credential Leakage',
    consequence: 'Without Secrets Manager, API keys leak and attackers abuse external integrations.',
    requiredCardIds: [
      'controller-middleware',
      'controller-authentication',
      'model-secrets-manager',
      'model-database',
      'view-web-view'
    ],
    difficulty: 2
  },
  {
    id: 'cli-maintenance',
    title: 'Run CLI Maintenance Job',
    description: 'Operators run a command-line maintenance job that reads and updates stored data.',
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
    description: 'A shopper completes checkout. The flow needs auth, CSRF protection, secrets for payment, and a safe web UI.',
    securityRisk: 'Payment Fraud / CSRF / Data Theft',
    consequence: 'Missing checkout defenses let attackers forge payments or steal payment credentials.',
    requiredCardIds: [
      'controller-authentication',
      'controller-csrf-protection',
      'controller-rate-limiting',
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
    description: 'An authorized user exports a sensitive report. Data must be queried safely and escaped in the output.',
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
