# Implementation Plan: Tasks & Goals Tracking and Highlights

We will implement a Tasks and Goals system that allows the player to set, track, and visualize upgrade and resource targets.

## User Review Required

> [!NOTE]
> All data is persisted locally in `localStorage` via the existing Zustand store middleware. 
> Example targets from the player's domain reference (such as the 1,250 stones benchmark and Garlic Thorns Lv.13 goal) will be pre-seeded.

## Proposed Changes

We will introduce the data structure in the Zustand store, update the UI layout to display a Sidebar HUD, modify the Upgrade Queue to support task highlights and fast pinning, and add a goal manager inside the Build State screen.

---

### [Domain State]

#### [MODIFY] [store.ts](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/domain/store.ts)
* Add `PlannerTask` interface and actions (`addTask`, `updateTask`, `deleteTask`, `checkTaskCompletions`).
* Pre-seed initial tasks:
  * Garlic Thorns target level 13 (currently level 9)
  * Stones target 1,250 (currently 606)
  * Wall Regen target level 10 (currently level 7)
* Automatically run task completion checks inside updates for resources and research catalog levels.

---

### [Components]

#### [NEW] [TaskHUD.tsx](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/components/TaskHUD.tsx)
* Build a beautiful, sticky task summary widget for the sidebar.
* Support progress indicators, target resource completion status, and quick deletion or navigation.

#### [MODIFY] [Layout.tsx](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/components/Layout.tsx)
* Import and render `<TaskHUD />` directly in the sidebar panel above the lab allocation indicator.

#### [MODIFY] [UpgradeQueue.tsx](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/components/UpgradeQueue.tsx)
* Render contextual left-border highlights and "Active Goal" badges on queue rows corresponding to active research tasks.
* Add an interactive "Target" toggle action (using a Star or Target icon) on each row to quickly pin/unpin it as an active goal.

#### [MODIFY] [BuildState.tsx](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/components/BuildState.tsx)
* Add a `goals` sub-tab next to `flags` to allow managing tasks (adding resource goals, custom research goals, and removing existing goals).

---

## Verification Plan

### Automated Tests
* Run `npm test` or `npx vitest run` to verify that state updates do not break existing parser and cell models.

### Manual Verification
1. Open the planner in the browser at `http://localhost:5173/`.
2. Inspect the sidebar to verify the Pinned Tasks HUD renders with pre-seeded items (Garlic Thorns progress, Stones savings progress).
3. Navigate to **Upgrade Queue** and check that row items like Garlic Thorns have visual indicators.
4. Try toggling items in the Upgrade Queue as targets, and observe them updating in the sidebar HUD immediately.
5. Navigate to **Build State** -> **Goals** and add/delete a stone target or a custom research goal.
6. Verify completing a task (e.g. updating stones to 1300 in build state) correctly marks the goal as completed with a green visual check.
