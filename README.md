# MVC-ARENA

MVC-ARENA is a web-based educational card game that teaches core ideas of the
**Model–View–Controller (MVC)** software design pattern through play. It is
inspired by [Program Wars](https://github.com/johnanvik/program-wars), but its
learning goals are focused on MVC responsibilities, separation of concerns, and
related software practices—not on general programming syntax or request-call
flow.

Players build an MVC architecture across three lanes (**Model**, **View**,
**Controller**), place components in the correct layer, use special cards that
map to real practices (inheritance, polymorphism, logging, version control),
and respond to attacks and hazards that represent security and reliability
risks.

## What the game teaches

1. **Separation of concerns** — Introduce widely used components in an MVC
   architecture and the task each one performs in its layer.
2. **Dual nature of cards** — Demonstrate that these cards both help build the
   program and counter security risks.
3. **OOP practices in play** — Illustrate the working principles of inheritance
   and polymorphism through special cards.
4. **Risks and good practices** — Highlight how security risks and disasters
   affect development, and how good programming practices such as logging and version control
   help recover or reduce impact.

## What the game is not designed to teach

1. **MVC request / call flow** — the order of Controller → Model → View in a
   web request cycle is not a learning goal of this game.
2. **How to implement MVC in code** — players do not write programs; they learn
   concepts through card placement and game rules.
3. **Full software engineering or cybersecurity curricula** — attacks and
   defenses are simplified for gameplay and concept recognition, not a complete
   security course.

## How to play (Base Mode)

1. Enter your name on the home screen.
2. Optionally enter a playtest code if you are in a study; if the code is
   accepted, you will be asked for a self-generated study ID.
3. Click **Play** to start a match against a bot.
4. Build in the Model, View, and Controller lanes. Component cards must go in
   the designated lane (or that lane’s Inheritance stack).
5. Use defensive cards, Polymorphism, and defenses against attacks / hazards.
6. Meet the component requirements and score target shown in the requirement
   tracker to win.

In-game help is available from the side menu. A short gameplay video can appear
in the intro modal.

## Run locally

```bash
npm install
npm run dev
```

Optional environment variables (see `.env.example`):

| Variable | Purpose |
| -------- | ------- |
| `VITE_SUPABASE_URL` | Supabase project URL for playtest telemetry |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public key used by the browser to call the logging RPC |

Telemetry is optional. Without these variables the game still runs; events are
simply not sent. Analysis notebooks under `analysis/` use a **secret** key and
must never be exposed in the frontend.

```bash
npm test          # unit tests
npm run build     # production build
npm run lint      # ESLint
```

## Project layout (high level)

| Path | Role |
| ---- | ---- |
| `src/` | Vue 3 game client (Vite) |
| `src/analytics/` | Optional Supabase playtest logging |
| `supabase/` | SQL schema / migrations for `base_game_events` |
| `analysis/` | Offline analysis notebooks (not shipped in the game) |
| `supportdocs/` | Study materials and questionnaires |
| `src/markdown/` | In-game help content |

## Study and playtesting

Recruited participants can enter a playtest code on the home screen. When
active, sessions are tagged for analysis and a study ID can be stored so
pre/post questionnaires can be linked anonymously. Details of the schema and
migrations live under `supabase/`.

## Credits and history

MVC-ARENA builds on the Program Wars educational game lineage
([SibylLab / johnanvik](https://github.com/johnanvik/program-wars)).
Gameplay and learning aims have been adapted specifically for teaching MVC
concepts as described above.
