# Tower Planner — Implementation Plans Index

This directory contains the historical progression of technical design proposals, feature architectures, and implementation plans formulated and approved during the development of **Tower Planner**.

---

## Chronological Implementation Plans

### 1. [01 — Project Setup & Test Framework Configuration](./01-project-setup-and-test-setup.md)
* **Scope**: Workspace initialization using React + TypeScript, Vite template, Tailwind CSS v4 setup, state management (Zustand), schema validation (Zod), charts (Recharts), and unit test verification harness (Vitest).
* **Key Artifacts**: Dependencies, test structure, and build configuration.

---

### 2. [02 — Tower Planner Core Architecture & Release Plan](./02-tower-planner-core-architecture.md)
* **Scope**: End-to-end planning of domain models, clipboard battle report parser, cell calculation and lab speed booster engine, ROI / score upgrade ranking engine, and UI component hierarchy (Import, Build State, Lab Boosts, Upgrade Queue, Dashboard).
* **Key Artifacts**: Zustand domain stores, math formulas, local storage persistence, responsive UI layout.

---

### 3. [03 — Tasks & Goals Tracking and Visual Highlights](./03-tasks-and-goals-tracking-system.md)
* **Scope**: Planning the active goals and target tracking system. Allows players to set resource targets, pin active research goals, and see real-time progress calculations against hourly income rates.
* **Key Artifacts**: Task types (`research`, `resource`, `experiment`), Zustand action slices, table highlight styling.
* **Companion Document**: [03b — Tasks & Highlights Design Proposal](./03b-tasks-tracking-design-proposal.md) (Deep dive on forward-looking planning vs. passive archiving).

---

### 4. [04 — Lab Speed Boost Tiers & Hourly Cell Calculations](./04-lab-boost-tiers-and-hourly-cell-calculations.md)
* **Scope**: Upgrading lab speed multiplier tiers to include all official wiki speed options up to 8.0x (1.0x, 1.5x, 2.0x, 3.0x, 4.0x, 5.0x, 6.0x, 7.0x, 8.0x) and implementing real-time hourly cell burn / gain / net comparative calculations.
* **Key Artifacts**: Official speed table constants, Cell Budget UI component, hourly flow comparison indicators.

---

### 5. [05 — Ultimate Weapons (UWs) List, Status Checks & Wiki Section](./05-ultimate-weapons-list-and-upgrades.md)
* **Scope**: Restructuring Ultimate Weapons in Build State into a rich list view with Acquired and Active checkboxes, 3 main upgrades with wiki-verified costs and levels, Power Stone milestone unlocks, and a collapsible in-game wiki quick-reference panel.
* **Key Artifacts**: UW data catalog, stone milestone progression, level stepper controls.

---

### 6. [06 — Research Queue Rename, Lab Catalog Audit & Database Strategy](./06-research-queue-rename-and-lab-catalog-audit.md)
* **Scope**: Renaming "Upgrade Queue" to "Research Queue" across navigation, stores, components, and routes; auditing all in-game labs against the full wiki catalog (100+ lab research items); fixing Power Stone milestone highlight logic; and polishing the "Add to planner" catalog flow.
* **Key Artifacts**: Lab database modal catalog, lab category filters, milestone styling corrections.

---

### 7. [07 — Three-Column Collapsible Layout Architecture](./07-three-column-collapsible-layout-architecture.md)
* **Scope**: Restructuring the application viewport into a 3-column responsive layout (Left Sidebar navigation, Center Workspace, Right Companion Panel) with independent expand/collapse states, directional chevron indicators, localStorage layout persistence, and glowing Tournament overview status cards.
* **Key Artifacts**: Layout state store, collapsible section containers, glow styling, dark/light theme integration.

---
