# Update Lab Boost Tiers & Add Hourly Cell Calculations

This plan details updates to support all lab speed boost tiers up to 8x as defined in the wiki, and to calculate and display hourly cell burn, hourly cell gain, and their net comparison in the UI.

## User Review Required

> [!IMPORTANT]
> The wiki defines two new tiers of lab speed boosts: **7.0x** (costing 6,000,000 cells/day or 250,000 cells/hour) and **8.0x** (costing 24,000,000 cells/day or 1,000,000 cells/hour). We will add support for these tiers across all components.

## Proposed Changes

### Domain Logic

#### [MODIFY] [cellModel.ts](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/domain/cellModel.ts)
- Add and export a unified `BOOST_COSTS` object containing all boost multipliers (1.0x to 8.0x) and their corresponding daily cell costs.

### UI Components

#### [MODIFY] [CellBudget.tsx](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/components/CellBudget.tsx)
- Import `BOOST_COSTS` from `../domain/cellModel` and delete the local duplicate map.
- Add `7.0` and `8.0` options to the boost dropdown scheduler.
- In the **Daily Cell Income** panel, add the hourly cells gain display: `({formatCompact(effectiveIncome / 24)}/hr)`.
- In the **Daily Cell Burn** panel, add the hourly cells burn display: `({formatCompact(dailyBurn / 24)}/hr)`.
- In the **Burn vs Income Ratio** panel, display the comparison:
  - Net flow: `+X/hr` or `-X/hr`
  - Gain vs Burn comparison: `X vs Y cells/hr`

#### [MODIFY] [BuildState.tsx](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/components/BuildState.tsx)
- Add `6.0x`, `7.0x`, and `8.0x` speed boost options to the dropdown selection for lab slots.

#### [MODIFY] [UpgradeQueue.tsx](file:///Users/mbp-m1-pro/Developer/projects/tower-planner/src/components/UpgradeQueue.tsx)
- Import `BOOST_COSTS` from `../domain/cellModel`.
- Replace the hardcoded daily cost ternary logic with a clean lookup using `BOOST_COSTS[labBoostSelect]`.
- Add `6.0x`, `7.0x`, and `8.0x` options to the dropdown selection for target lab boosts.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify there are no compilation or syntax errors across the modified components.

### Manual Verification
- Navigate to the **Build State** tab -> **LABS** subtab, verify that `6.0x`, `7.0x`, and `8.0x` boosts can be selected.
- Navigate to the **Cell Budget** tab, verify that the scheduler has options up to `8.0x` and displays correct daily costs (e.g. `24,000,000` cells/day for `8.0x`).
- Verify that **Hourly Cell Income**, **Hourly Cell Burn**, and the **Net Flow / Comparison** are correctly rendered with clean formatting.
- Navigate to the **Upgrade Queue** tab, verify that `6.0x`, `7.0x`, and `8.0x` can be selected and calculate queue costs correctly.
