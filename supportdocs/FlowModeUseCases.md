# Flow Mode Use Cases

This document is the reference catalog for the 15 Flow Mode scenarios.

## How the scenarios teach MVC

| Layer | Student responsibility |
| --- | --- |
| Controller | Receive, direct, restrict, or authorize the request |
| Model | Validate, retrieve, store, protect, or accelerate data |
| View | Present the result through the appropriate interface |

| Rule | Detail |
| --- | --- |
| Pass / fail | Fulfilled only when every required card is present |
| Security risk | Teaching follow-up after simulation, not the scoring rule |
| Pre-selection spoilers | Descriptions avoid card names |
| Post-simulation reveal | Required cards and security lesson are shown afterward |

## Use case catalog

| # | Title | Description shown to students | Security risk | Required cards | MVC learning goal |
| --- | --- | --- | --- | --- | --- |
| 1 | Login from Mobile App | Imagine a customer opens the app on a phone and tries to sign in. Can the system recognize the right person, find the account, and return a screen suited to that device? | Account Takeover / Session Abuse | Controller: Routing, Authentication<br>Model: Database<br>View: Mobile View | Trace a device request through identity checking and account retrieval to a device-appropriate presentation. |
| 2 | Create New Account | Imagine a new visitor submits personal details to create an account. Can the system reject unsafe values, save a valid account, and confirm the result in the browser? | SQL Injection | Controller: Routing<br>Model: Data Validation, ORM, Database<br>View: Web View | Separate request direction, input/data handling, safe persistence, and browser presentation. |
| 3 | Search Product Catalog | Imagine a shopper searches the catalog with a keyword. Can the request reach the right logic, retrieve matching records safely, and present useful results? | SQL Injection | Controller: Routing<br>Model: ORM, Database<br>View: Web View | Connect request routing to safe data access and a user-facing result. |
| 4 | Update User Profile | Imagine a signed-in customer changes an address or display name. Can the system confirm the request is genuine, check the new details, save them, and show the update? | CSRF / Data Tampering | Controller: Authentication, Authorization, CSRF Protection<br>Model: Data Validation, Database<br>View: Web View | Show how request security belongs at the boundary while data correctness and persistence belong in the Model. |
| 5 | Post a Comment | Imagine a community member publishes a comment that other visitors will read later. Can the system accept, save, and display it without allowing hidden code to run? | XSS / Cross-Site Scripting | Controller: Routing<br>Model: Data Validation, Database<br>View: Output Validation, Web View | Distinguish validating stored input from safely encoding content at the presentation boundary. |
| 6 | Upload a User File | Imagine a customer uploads a document and expects to see a confirmation. Can the system inspect the submission, store it safely, and complete the request? | Malware Upload | Controller: Middleware<br>Model: Data Validation, File Storage Adapter<br>View: Web View | Connect request preprocessing with safe file handling and user feedback. |
| 7 | Open Admin Dashboard | Imagine a staff member opens a privileged dashboard. Can the system confirm who they are, check what they may access, retrieve the information, and display it? | Unauthorized Access | Controller: Authentication, Authorization, Routing<br>Model: Database<br>View: Web View | Distinguish identity from permission before protected data is retrieved and displayed. |
| 8 | Reset Forgotten Password | Imagine a customer who cannot sign in follows a one-time recovery link. Can the system control repeated attempts, protect the recovery value, update the account, and return confirmation? | Reset-Token Abuse / Account Takeover | Controller: Routing, Rate Limiting<br>Model: Secrets Manager, Database<br>View: Web View | Model a recovery flow without incorrectly assuming that the user is already authenticated. |
| 9 | Open Public Data Dashboard | Imagine many visitors open a public status dashboard at once. Can the system manage the surge, direct each request, retrieve current information, and keep the page available? | Denial of Service (DoS) | Controller: Rate Limiting, Middleware, Routing<br>Model: Database<br>View: Web View | Show that traffic control and request processing happen before data retrieval and presentation. |
| 10 | Browse Cached Catalog | Imagine many shoppers repeatedly open the same popular catalog pages. Can the system return them quickly without performing the same slow work for every visitor? | Performance Abuse / Overload | Controller: Routing<br>Model: Caching, Database<br>View: Web View | Teach that performance-oriented data access remains a Model responsibility while Controller and View responsibilities stay separate. |
| 11 | Download Private File | Imagine a customer requests a private document. Can the system confirm the person is allowed to receive it, retrieve the correct file, and deliver it without exposing anyone else's data? | Unauthorized Data Theft | Controller: Authentication, Authorization<br>Model: File Storage Adapter<br>View: Web View | Connect identity and permissions to protected resource retrieval and delivery. |
| 12 | Show Live Delivery Quote | Imagine a checkout page requests a live delivery quote from an outside provider. Can the system contact that service without exposing private credentials and present the quote to the shopper? | Credential Leakage / Third-Party Abuse | Controller: Routing, Middleware<br>Model: Secrets Manager, Caching<br>View: Web View | Represent an external integration as request coordination, protected data/configuration handling, reusable results, and presentation. |
| 13 | Run CLI Maintenance Job | Imagine an operator starts a powerful maintenance task from a terminal. Can the system allow only approved staff, update the correct records, and return a clear result? | Unauthorized Maintenance Access | Controller: Authentication, Authorization<br>Model: Database<br>View: CLI View | Demonstrate that MVC is not limited to browser interfaces; a terminal can be the View. |
| 14 | Checkout and Pay | Imagine a signed-in shopper submits an order and payment. Can the system reject forged or malformed requests, handle sensitive values safely, record the purchase, and show confirmation? | Payment Fraud / Forged Requests / Injection | Controller: Authentication, CSRF Protection<br>Model: Data Validation, Secrets Manager, ORM, Database<br>View: Web View | Combine multiple Controller and Model concerns in a complex end-to-end transaction while retaining a clear presentation boundary. |
| 15 | Export Secure Report | Imagine a staff member requests an export containing sensitive records. Can the system verify access, retrieve the right information safely, and produce an output that cannot execute hidden content? | Data Theft / XSS in Exports | Controller: Authentication, Authorization<br>Model: ORM, Database<br>View: Output Validation, Web View | Connect access control, safe data retrieval, and safe output generation across all three MVC layers. |

## Adversarial review findings

| Finding | Why it helps teach MVC |
| --- | --- |
| Starts with a user goal | Students decide architecture instead of following a card checklist |
| Requires Controller + Model + View | Every scenario practices a complete request/response path |
| Avoids card-name spoilers | Students infer responsibilities from the scenario |
| Compares required vs played cards after simulation | Missing layers become visible and discussable |
| Keeps security as a post-run lesson | Security context does not replace the card-matching rule |

| Earlier issue | Correction |
| --- | --- |
| Mobile login used Middleware instead of Routing | Now requires Routing so the incoming request path is clearer |
| Password reset assumed an already authenticated user | Now emphasizes recovery-token protection and attempt control |
| Former public API did not naturally need a View | Changed to a public dashboard with a complete MVC flow |

The catalog is intentionally simplified. Real systems may use additional components or different architectures, but these requirements are defensible teaching models for identifying MVC responsibilities.
