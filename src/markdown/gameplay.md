# Gameplay

MVC-ARENA has two modes. **Base Mode** is the turn-based lane-building duel.
**Flow Mode** is a use-case iteration challenge. Both use the same MVC component
cards.



## Base Mode

### Overview

MVC-ARENA Base Mode is a two-player game. You can play against another person or
against the computer. The goal is to build a complete and secure **MVC
architecture** before your opponent does.

- After starting, two players are added: **two human players**, or **one human
player and a computer opponent**.
- Each player builds in three lanes: **Model**, **View**, and **Controller**.
- The score limit is **25**. To win, you also need a minimum number of components.



### Quick Guide

When the game starts, each player has **five cards**. At the end of every turn you
draw one new card. On your turn you can:

- **Play** a card (drag it onto the board; a playable card glows green),
- **Discard** a single card, or
- **Redraw** your whole hand.

**Building your program**

- Drag a **component** card into its lane (Model, View, or Controller), or onto the
**inheritance stack** at the top of the lane to add points.
- An inheritance stack can hold up to **6 cards** and a maximum of **9 points**.
- Each component is worth **1 point**.
- **Defensive** cards (Interface, Git, Error Handling, Logger) **double** the points
of the stack you play them on.
- **Polymorphism** is a wildcard: drop it into a lane and choose which component it
becomes.

**Attacks and hazards**

- **Attack** cards reduce a player's points. If the target has the matching
defending component, the attack is **blocked** (an "encounter" animation plays) and
the defending card is used up instead.
- **Destructive events** (Bug and Disaster) take effect immediately when drawn. If
you have no protecting card, you lose **half of your points** and your next turn is
restricted. A **Logger** protects against Bugs, and **Git** protects against
Disasters.



### How to win

To win, a player must collect the required components **and** reach the score limit:

| **Requirement** | **Needed** |
| --------------- | ---------- |
| Model components | 3 |
| View components | 2 |
| Controller components | 4 |
| Defensive cards | 2 |
| Score | 25 |
|||

The **requirement tracker** on screen shows your progress. Each group fills as you
collect cards, and your status changes from **Pending** to **Done** when all the
card requirements are met.



## Flow Mode

Flow Mode is a competitive system-building challenge (Player 1 vs Player 2 or Bot).
You improve an MVC architecture across **4 iterations**, each driven by a software
**use case** that also teaches a security risk (SQL injection, XSS, session theft,
CSRF, unauthorized access, and more).

### Match flow

1. **Reveal use case** — Read the scenario only (security risk and required cards stay hidden).
2. **Select cards** (only after reading the use case)
   - Iteration 1: choose exactly **2 Controller**, **2 Model**, and **1 View**.
   - Iterations 2–4: read the **new use case first**, then add exactly **2 new cards**.
3. **Review** — Selected cards are placed automatically into their Controller /
   Model / View layers.
4. **Simulate** — Watch an automatic ~15 second request/response animation. The use
   case is **fulfilled** only if every **required card** is present in your system;
   otherwise it stops at the first missing card. Afterward you see the required-card
   match result, plus a short security lesson about why those cards matter.
5. Repeat for four different use cases, then compare scores.

### Scoring

- **+1** for each fulfilled use case.
- If tied, the player who covered more **required cards** across the match wins.
- If still tied, the match is a draw.

The same 16 MVC component cards from Base Mode are used here (Routing, ORM,
Authentication, Mobile View, Output Validation, and the rest). Guards such as
ORM, Authentication, and Output Validation are often required to stop the use
case’s threat.
