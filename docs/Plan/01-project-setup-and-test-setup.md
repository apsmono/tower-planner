# Implementation Plan — Project Initialization & Test Setup

This plan covers initializing the Tower Planner project in the current workspace directory, preserving the existing `docs/` folder, installing required libraries (Tailwind v4, Zustand, Zod, Recharts, Vitest), and setting up unit tests for the parser and cell model.

## User Review Required

> [!IMPORTANT]
> The directory `/Users/mbp-m1-pro/Developer/projects/tower-planner` currently contains the `docs/` folder. During initialization, we will temporarily back up `docs/` to `.docs_backup/` within the workspace, run `create-vite` with `--overwrite`, and then restore the `docs/` folder. This ensures no documentation is lost.

## Proposed Changes

### Project Initialization & Cleanup

* **Temporary Backup**: Move [docs](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/docs) to `.docs_backup`.
* **Vite App Creation**: Initialize the React-TS template in the workspace root:
  `npx -y create-vite@latest ./ --template react-ts --no-interactive --overwrite`
* **Restore Docs**: Restore `.docs_backup` to [docs](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/docs).
* **Clear Default Assets**: Clean up standard boilerplate files (like CSS, SVG, etc.) to start with a clean slate.

### Dependencies Installation

We will install the following packages:
* **Tailwind CSS v4**: `@tailwindcss/vite` and `tailwindcss`.
* **State Management**: `zustand` (with `persist` middleware for localStorage).
* **Validation**: `zod` for parsing and schema enforcement.
* **Charts**: `recharts` for specific visualization needs.
* **Icons**: `lucide-react` for UI icons.
* **Testing**: `vitest` for writing unit tests.

### Configuration Files

#### [NEW] [vite.config.ts](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/vite.config.ts)
* Configure Vite to support Tailwind v4 plugin.
* Configure `test` environment for Vitest.

#### [MODIFY] [src/index.css](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/index.css)
* Set up Tailwind v4 imports (`@import "tailwindcss";`) and default dark mode styles.

#### [NEW] [src/domain/parser.test.ts](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/domain/parser.test.ts)
* Create a skeleton test file to verify Vitest works.

---

## Verification Plan

### Automated Tests
- Run `npx vitest run` to verify that the test runner executes and passes.

### Manual Verification
- Start the dev server with `npm run dev` to verify the page loads and has a functional hot-reload.
