# Restructure Ultimate Weapons: List View, Status Checks, 3 Main Upgrades & Wiki Section

## Overview
Transform the Ultimate Weapons (UWs) section in Build State into a rich, dedicated list view. Each UW will have:
1. **Acquired** and **Active** status checks.
2. **3 Main Upgrades** with wiki-referenced stats (e.g. Golden Tower: Bonus, Duration, Cooldown; Black Hole: Size, Duration, Cooldown; Spotlight: Bonus, Angle, Quantity, etc.).
3. **In-App Wiki Reference Section** featuring direct wiki links, priority guides, sync calculator tips (GT + BH + DW sync), and weapon mechanics breakdowns.

---

## Wiki Reference for the 9 Ultimate Weapons & Upgrades

| UW Name | Stat 1 | Stat 2 | Stat 3 | Wiki Default / Baseline | Wiki Page Link |
|---|---|---|---|---|---|
| **Golden Tower (GT)** | Bonus Multiplier (`x`) | Duration (`s`) | Cooldown (`s` / `m:s`) | `15.4x`, `38s`, `200s` (3m 20s) | [Golden Tower Wiki](https://the-tower-idle-tower-defense.fandom.com/wiki/Golden_Tower) |
| **Black Hole (BH)** | Size (`m`) | Duration (`s`) | Cooldown (`s` / `m:s`) | `44m`, `25s`, `200s` (3m 20s) | [Black Hole Wiki](https://the-tower-idle-tower-defense.fandom.com/wiki/Black_Hole) |
| **Death Wave (DW)** | Damage (`%`) | Wave Quantity (`waves`) | Cooldown (`s` / `m:s`) | `350%`, `2 waves`, `200s` (3m 20s) | [Death Wave Wiki](https://the-tower-idle-tower-defense.fandom.com/wiki/Death_Wave) |
| **Spotlight (SL)** | Bonus Damage (`x`) | Beam Angle (`°`) | Beam Quantity (`beams`) | `15x`, `40°`, `3 beams` | [Spotlight Wiki](https://the-tower-idle-tower-defense.fandom.com/wiki/Spotlight) |
| **Chrono Field (CF)** | Duration (`s`) | Speed Reduction (`%`) | Cooldown (`s` / `m:s`) | `30s`, `60%`, `60s` | [Chrono Field Wiki](https://the-tower-idle-tower-defense.fandom.com/wiki/Chrono_Field) |
| **Chain Lightning (CL)** | Shock Damage (`%`) | Bolt Quantity (`bolts`) | Proc Chance (`%`) | `150%`, `3 bolts`, `15%` | [Chain Lightning Wiki](https://the-tower-idle-tower-defense.fandom.com/wiki/Chain_Lightning) |
| **Poison Swamp (PS)** | Swamp Damage (`%`) | Swamp Duration (`s`) | Spawn Chance (`%`) | `250%`, `5s`, `25%` | [Poison Swamp Wiki](https://the-tower-idle-tower-defense.fandom.com/wiki/Poison_Swamp) |
| **Smart Missiles (SM)** | Missile Damage (`x`) | Missile Quantity (`missiles`) | Cooldown (`s` / `m:s`) | `45x`, `4 missiles`, `150s` (2m 30s) | [Smart Missiles Wiki](https://the-tower-idle-tower-defense.fandom.com/wiki/Smart_Missiles) |
| **Inner Land Mines (ILM)** | Mine Damage (`%`) | Mine Quantity (`mines`) | Cooldown (`s` / `m:s`) | `350%`, `5 mines`, `120s` (2m 00s) | [Inner Land Mines Wiki](https://the-tower-idle-tower-defense.fandom.com/wiki/Inner_Land_Mines) |

---

## Proposed Changes

### 1. Data Store Layer (`src/domain/store.ts`)
- Enhance `UW` interface with:
  - `unlocked`: boolean (Acquired / Owned)
  - `active`: boolean (Active / Enabled in runs)
  - `upgrades`: `{ stat1: number; stat2: number; stat3: number }`
- Provide `UW_UPGRADE_CONFIG` metadata dictionary for labels, units, defaults, descriptions, and wiki URLs.
- Update `INITIAL_UWS` seed data with all 9 weapons initialized with accurate default values and upgrades.
- Add `updateUWUpgrade` or ensure `updateUW` seamlessly handles upgrade fields and status flags.

### 2. UI Component Layer (`src/components/BuildState.tsx`)
- Redesign the UW sub-tab (`activeSubTab === 'uws'`) into a **vertical list**:
  - **Summary Banner**: Acquired UW count (e.g. `4 / 9 Acquired`), Active count, and GT/BH/DW cooldown sync status alert (showing whether GT & BH are synchronized at 3:20).
  - **Filter Tabs**: All (9) | Acquired (4) | Available to Unlock (5).
  - **List Item Card**:
    - Header: Weapon icon, Weapon Name, "Acquired" checkbox, "Active in Runs" toggle / checkbox, direct wiki link button, and status badge.
    - Upgrades Grid: 3 distinct upgrade input cards with labels, current values, step buttons / number inputs, and formatted unit tags (`x`, `s`, `m`, `°`, `%`, `count`).
    - Cooldown human-readable format (e.g. `200s (3m 20s)`).
    - Muted/compact view for unacquired weapons with one-click "Unlock Weapon" action.
  - **Dedicated Wiki Reference Section**:
    - Collapsible/expandable guide panel with quick reference links to Fandom Wiki.
    - Wiki strategic callouts:
      1. **Syncing Strategy (Holy Trinity)**: Why GT + BH + DW sync at 3:20 is critical.
      2. **UW Plus (UW+) Overview**: Explaining late-game unlocks (Golden Combo, Consume, Cover Fire, etc.).
      3. **Stone Economy**: Stone saving targets (e.g. 1,250 stones for 6th UW).
      4. Direct external links to Fandom Wiki pages for all 9 UWs with external link icons.

---

## Verification Plan

### Automated Tests
- Run `npm run test` or `npx vitest run` to ensure all existing tests pass with no regressions.
- Verify TypeScript types build cleanly with `npm run build`.

### Manual Verification
- Open the web app at `http://localhost:5173/`, navigate to **Build State** -> **UWs**.
- Test toggling **Acquired** and **Active** on/off.
- Test editing each of the 3 upgrade fields for various UWs (Golden Tower, Black Hole, Spotlight, etc.) and verify they persist in localStorage.
- Open and explore the **Wiki Reference Section**, click the wiki links, and verify the guide notes.
- Verify the list layout is responsive, fast, and aesthetically polished with the dark terminal/glassmorphism design system.
