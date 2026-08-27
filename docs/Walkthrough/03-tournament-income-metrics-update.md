# Walkthrough - Tournament Income Metrics Update

Updated the tournament history income metrics to display actual tournament rewards (Gems, Stones, and Keys) instead of run-specific metrics (Coins, Cells, and play duration).

## Changes Made

### domain

#### [NEW] [tournamentModel.ts](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/domain/tournamentModel.ts)
- Created the tournament rewards calculator module, mapping placing rank (1-30) and brackets (Copper, Silver, Gold, Platinum, Champion, Legend, Mythic) to their exact Gems, Stones, and Keys rewards based on the game's fandom wiki.

### components

#### [MODIFY] [ImportRuns.tsx](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/components/ImportRuns.tsx)
- Added `Legend` and `Mythic` options to the bracket selection dropdown when importing/previewing battle reports.

#### [MODIFY] [TournamentHistory.tsx](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/components/TournamentHistory.tsx)
- Replaced Coins, Cells, and Play Time with dynamic calculations for Gems, Stones, and Keys using the newly created `getTournamentRewards` lookup.
- Updated the header overview stats cards to display total tournament income across all imported runs:
  - **Total Tourney Gems** (amber / `Gem` icon)
  - **Total Tourney Stones** (emerald / `Zap` icon)
  - **Total Tourney Keys** (purple / `Key` icon)
- Updated the log table columns to show **Gems**, **Stones**, and **Keys** for each individual run.

## Verification Results

### Automated Checks
- Verified the build and code syntax using `npm run lint && npx tsc --noEmit`. No compiler errors or new warnings were found.
