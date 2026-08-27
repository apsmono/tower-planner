# Plan: 3-Column Collapsible Layout Architecture

Divide the Tower Planner application interface into a 3-column responsive layout with independent expand/collapse capabilities, directional chevron indicators, and persistent state.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Top Navigation / Header (Breadcrumb, Theme Toggle, Account / Cloud Sync)                │
├───────────────────────┬────────────────────────────────────────┬───────────────────────┤
│ Left Column           │ Middle Column                          │ Right Column          │
│ (Sidebar Navigation)  │ (Active Tab Workspace)                 │ (Goals & Widgets)     │
│                       │                                        │                       │
│ • App Brand & Cloud   │ • AuthSyncBanner                       │ • Pinned Goals        │
│ • Resource Counters   │ • Import & Runs / Tier Lab /           │   (Active & Finished) │
│ • Primary Tab Nav     │   Research Queue / Cell Budget /       │ • Active Lab Status   │
│ • In-game Check Alert │   Build State / Tournament             │ • Quick Notes /       │
│ • [◀ Collapse Arrow]  │                                        │   Scratchpad          │
│   (or [▶] when slim)  │                                        │ • [Collapse Arrow ▶]  │
│                       │                                        │   (or [◀] when slim)  │
│ Width: 256px ↔ 64px   │ Width: flex-1 (Dynamic Expand)         │ Width: 300px ↔ 52px   │
└───────────────────────┴────────────────────────────────────────┴───────────────────────┘
```

---

## Proposed Changes

### Layout & Navigation Components

#### [NEW] `src/components/RightSidebar.tsx`
Create a dedicated component for the 3rd (right) column:
- **Expanded Mode (`w-72` to `w-80`)**:
  - Header with title "Planner Hub" / "Goals & Status" + collapse button with `ChevronRight` (`>`) indicator.
  - **Pinned Goals Widget** (`TaskHUD`): Active and completed goals, progress bars, quick delete and direct links.
  - **Active Lab Status Widget**: Live overview of the 5 lab slots, assigned research, and speed multipliers.
  - **Session Scratchpad / Notes Widget**: LocalStorage-persisted quick notes box for planning notes, build goals, or wave targets.
  - **Extensible Widget Slot**: Prepared container for upcoming features (e.g. Tournament countdown, UW Cooldown sync, Event Missions).
- **Collapsed Mode (`w-13` ~ 52px)**:
  - Vertical rail with expand button using `ChevronLeft` (`<`) indicator.
  - Mini icon indicators: Goal badge with active task count count, Lab status dot indicator, Notes toggle.
  - Clicking any icon or the arrow immediately expands the panel.

---

#### [MODIFY] `src/components/Layout.tsx`
- Refactor the main layout container into a 3-column flex structure.
- Add `isLeftCollapsed` and `isRightCollapsed` state (persisted in `localStorage`).
- **Left Column**:
  - When expanded: Show full brand, live resource counter cards (Coins, Cells, Stones, Gems), tab navigation labels, lab progress dots, and collapse button with `ChevronLeft` (`<`).
  - When collapsed: Render a compact 64px rail with logo icon, icon-only navigation with tooltips, and expand button with `ChevronRight` (`>`).
  - Relocate `TaskHUD` from the left sidebar to the new `RightSidebar` for a cleaner, focused left navigation.
- **Middle Column**:
  - `flex-1 overflow-y-auto` container ensuring smooth scrolling and responsive expansion when either or both sidebars are collapsed.
- Keyboard shortcuts: Optional quick hotkeys (e.g. `Ctrl/Cmd + [` for left, `Ctrl/Cmd + ]` for right) or intuitive click triggers.

---

#### [MODIFY] `src/components/TaskHUD.tsx`
- Enhance styling and spacing for the dedicated right-hand column container.
- Add clear action indicators, scrollable container with custom scrollbar, and improved goal badges.

---

#### [MODIFY] `src/index.css`
- Add light & dark mode styles for:
  - Collapsed rail states and hover effects.
  - Expand/collapse arrow buttons with smooth hover animations.
  - Right sidebar widget cards, headers, and scrollbars.

---

## Verification Plan

### Automated / Build Verification
- Run `npm run build` or `npx tsc --noEmit` to verify type checking and build integrity.

### Manual / Browser Verification
1. **Left Column Toggle**:
   - Verify clicking the left arrow collapses the left sidebar to a compact icon rail with `ChevronRight` indicator.
   - Verify tooltips and navigation remain fully functional when collapsed.
   - Verify clicking the arrow again smoothly expands the sidebar with `ChevronLeft` indicator.
2. **Right Column Toggle**:
   - Verify clicking the right arrow collapses the right panel with `ChevronLeft` indicator on the slim rail.
   - Verify active goals count badge displays on the collapsed rail.
   - Verify clicking the expand arrow restores full goals & widgets view with `ChevronRight` indicator.
3. **Middle Column Responsiveness**:
   - Verify all active tabs (Import & Runs, Tier Lab, Research Queue, Cell Budget, Build State, Tournament) expand seamlessly to occupy available width.
4. **Theme Compatibility**:
   - Test both Dark and Light modes to confirm all chevron buttons, borders, and widget backgrounds look crisp and accessible.
