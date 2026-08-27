# Tower Planner — Walkthroughs Index

This directory contains the historical progression of feature walkthroughs, verifications, and architectural implementation notes for **Tower Planner**.

## Chronological Walkthrough List

### [Walkthrough — Project Setup & Initialization](./01-project-setup-and-initialization.md)

We successfully initialized the workspace using the `create-vite` CLI template for React + TypeScript, installed all project dependencies, configured Tailwind CSS v4, and verified the Vitest unit testing framework.

---

### [Walkthrough - Tower Planner Core Release](./02-tower-planner-core-release.md)

We have successfully developed the core components and mathematical engines for **Tower Planner** based on the approved implementation plan. All features build cleanly, pass unit tests, and have been verified in the browser.

---

### [Walkthrough - Tournament Income Metrics Update](./03-tournament-income-metrics-update.md)

Updated the tournament history income metrics to display actual tournament rewards (Gems, Stones, and Keys) instead of run-specific metrics (Coins, Cells, and play duration).

---

### [Walkthrough: Sorting and Filtering Logged Runs](./04-sorting-and-filtering-logged-runs.md)

We added comprehensive sorting and filtering capabilities to the Logged Runs table list on the main import tab, and set the default sort order to **Newest Date**. We also resolved strict TypeScript compiler errors related to unused variables and tournament rank parameters.

---

### [Walkthrough - Sidebar Click Delay Fix](./05-sidebar-click-delay-fix.md)

We fixed the click delay and responsiveness of the navigation buttons in the sidebar.

---

### [Walkthrough: Tasks & Goals Tracking and Highlights](./06-tasks-and-goals-tracking-and-highlights.md)

We have successfully implemented the **Tasks & Goals Tracking and Highlights** system. Here is a summary of the accomplishments, testing procedures, and visual evidence.

---

### [Walkthrough — Scrollable Upgrade Queue Layout](./07-scrollable-upgrade-queue-layout.md)

We have resolved the layout and scrollability issue in the Upgrade Queue. The entire layout now fits the screen viewport height properly on desktop, keeping the sidebar fixed, while the rankings table has its own scroll window with sticky column headers.

---

### [Walkthrough - Lab Boost Tiers & Hourly Cell Calculations](./08-lab-boost-tiers-and-hourly-cell-calculations.md)

I have completed the changes to support speed boost tiers up to 8.0x matching the wiki and added hourly calculations for cell gain, cell burn, and net flow comparison in the UI.

---

### [Ultimate Weapons (UWs) List, Status Checks, 3 Upgrades & Wiki Section](./09-ultimate-weapons-list-and-upgrades.md)

We have restructured the **Ultimate Weapons (UWs)** section in **Build State** to meet all requirements:

---

### [Walkthrough: Add to Planner Button Cleanup & Functionality Fix](./10-add-to-planner-button-cleanup.md)

Cleaned up the button text to **"Add to planner"** and fixed the catalog insertion/removal functionality in [ResearchQueue.tsx](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/components/ResearchQueue.tsx) and [store.ts](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/domain/store.ts).

---

### [Walkthrough: Tournament Cards Shadow Glows & Red Sci-Fi Key Icon](./11-three-column-layout-and-tournament-styling.md)

We have updated the Tournament overview cards, glowing shadows, and currency icons according to the game's authentic visual style:

---

