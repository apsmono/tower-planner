# Implementation Plan - Tower Planner

We are building a React + TypeScript local-only dashboard for **The Tower — Idle Tower Defense** upgrade path planning. The application logic is divided into modular components and local state stores using Zustand.

## Proposed Changes

We will build the application in stages following the build order defined in `SPEC.md`.

---

### Phase 1: Pure Domain Model, Parser & Cell Calculator

We will implement the pure logic of the parser and cell calculator, and add extensive unit tests.

#### [NEW] [parser.ts](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/domain/parser.ts)
Implement Battle Report parsing logic:
- Multi-locale float parser (detecting decimal and thousands separator).
- Duration parser (`2d 1h 49m 3s` -> seconds).
- Suffix multipliers parser (`K` = 1e3, `M` = 1e6, ..., `aj` = 1e63).
- Alias key normalizer (lowercase and alphanumeric only lookup).
- Section header divider.
- Bulk report splitter (on `Battle Report` headers).

#### [NEW] [cellModel.ts](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/domain/cellModel.ts)
Implement cell drop curves:
- `cells(T, w)` formula based on wave compression `s(T)` and drop rate `a(T)`.
- `cum1(w)` cumulative T1 cell curve with linear interpolation and extrapolation.

#### [MODIFY] [parser.test.ts](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/domain/parser.test.ts)
Add test cases checking:
- Parsing all fixtures from `jarekb84/TowerOfTracking`.
- Verifying scale suffix parsing.
- Cell model accuracy tests (e.g. `cells(9, 3242) -> 6966 +-1%`, break-evens).
- Multi-locale float numbers parsing.

---

### Phase 2: Core State Stores & Local Storage Persistence

#### [NEW] [store.ts](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/domain/store.ts)
We will implement Zustand state management with `persist` middleware for local storage.
- **Run Store**: Saves list of imported runs. Handles run additions, exclusions, notes, bulk uploads, and custom tournament fields.
- **Build Store**: Tracks user's game state: coins, cells, gems, stones, shards, module tiers, current research levels, UW levels, and custom in-flight lab slots.

---

### Phase 3: Dashboard Page Layout & Views

We will establish a responsive grid and tab layout, with beautiful dark glassmorphism styling matching the game's theme.

#### [MODIFY] [index.css](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/index.css)
Initialize root variables, custom scrollbars, dark/vibrant gradient colors, glassmorphism card classes, and Tailwind components.

#### [NEW] [Layout.tsx](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/components/Layout.tsx)
Main dashboard container with sidebar navigation tabs:
- **Import Runs**
- **Tier Lab**
- **Upgrade Queue**
- **Cell Budget**
- **Build State**
- **Tournament History**

---

### Phase 4: Tab Component Implementation

We will implement each screen component:
- **Import runs component** (`ImportRuns.tsx`): Textarea paste box, interactive preview tables, locales detection overrides, and bulk import wizard.
- **Tier Lab component** (`TierLab.tsx`): Mean wave, run length, coins/cells rates, and the critical wave decay vs 10% crossover visualizer.
- **Upgrade Queue component** (`UpgradeQueue.tsx`): Candidate ranking list, Unified/Split currency modes, days-to-afford, and slot-scheduler cards.
- **Cell Budget component** (`CellBudget.tsx`): Boost scheduler, cells burn ratio gauge, realized income vs ceiling uptime checker.
- **Build State component** (`BuildState.tsx`): Easy forms to update cards, modules, UWs, and catalog seed levels with verification badges.
- **Tournament History component** (`TournamentHistory.tsx`): Bracket / placings analytics, wave history chart, and income projections.

---

## Verification Plan

### Automated Tests
- Run `npx vitest run` to verify that all parser and cell model calculations match game values.

### Manual Verification
- Launch local development server (`npm run dev`) and test clipboard paste interaction.
- Check state persistence when refreshing the page.
