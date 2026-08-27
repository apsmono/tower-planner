# Tower Planner

A single-player React + TypeScript + Vite dashboard for planning upgrade paths in **The Tower — Idle Tower Defense**. It runs entirely locally in your browser and uses `localStorage` for persistence.

## Features

1. **Smart Import**: Paste clipboard summaries directly. Automatically parses values using locale detection (e.g. `43,91T` vs `43.91T`), formats durations, auto-classifies tournaments, and highlights unrecognized fields.
2. **Tier Lab**: Aggregates waves and coin/cell rates by tier. Computes observed decay versus the ~10% cell discount crossover rule to issue climb recommendations.
3. **Upgrade Queue**: Scores candidate research based on their delta impact and channel share from your runs. Supports Split and Unified currency views.
4. **Cell Budget**: Visualizes daily cell burn ratios, projects cells per run, and displays hard-blocks for unaffordable 3x+ speed boosts.
5. **Build State**: Form panels to customize resource balances, modules, active lab slots, and verify-in-game checklists.
6. **Tournament History**: Projections of tournament waves over brackets and total tournament economic yields.
7. **Cloud Data Sync & Auth**: Interactive banner and modal suggesting login/registration to backup and review runs, lab queues, and build states across desktop and mobile devices.

## Directory Structure

```text
├── docs/                # Domain math, build specifications, plans, walkthroughs, and scratchpads
│   ├── Plan/            # Historical implementation plans and architectural proposals
│   ├── Walkthrough/     # Feature release walkthroughs and visual verifications
│   └── Scratchpad/      # Step-by-step verification and diagnostic logs
├── src/
│   ├── components/      # UI Dashboard pages and navigation Frame
│   │   ├── Layout.tsx
│   │   ├── AuthSyncBanner.tsx
│   │   ├── AuthModal.tsx
│   │   ├── ImportRuns.tsx
│   │   ├── TierLab.tsx
│   │   ├── UpgradeQueue.tsx
│   │   ├── CellBudget.tsx
│   │   ├── BuildState.tsx
│   │   ├── TaskHUD.tsx
│   │   └── TournamentHistory.tsx
│   ├── domain/          # Parser engine, cell math, and Zustand state store
│   │   ├── parser.ts
│   │   ├── cellModel.ts
│   │   ├── store.ts
│   │   └── parser.test.ts
│   ├── App.tsx          # Main component router
│   ├── index.css        # Styling system (Tailwind CSS v4 + custom tokens)
│   └── main.tsx
```

## Setup & Running

Install dependencies:
```bash
npm install
```

Launch the local development server:
```bash
npm run dev
```

Run unit tests:
```bash
npx vitest run
```
