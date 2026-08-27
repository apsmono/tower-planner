# Scratchpad

## Progress
- [x] Read scratchpad
- [x] List browser pages to identify the active page ID
- [x] Capture screenshot of the active page (http://localhost:5173/)
- [x] Get DOM of the active page to analyze details
- [x] Report findings to the user

## Findings
The active page is the "Tower Planner" application (v1.0.0 (Local)) running on http://localhost:5173/.
Key elements visible:
1. **Sidebar (Left)**:
   - Title: "Tower Planner" with version "v1.0.0 (Local)".
   - Stats: Coins (284.00B), Cells (5.00K), Stones (2100), Runs Logged (4).
   - Navigation: Import & Runs, Tier Lab, Research Queue (Active), Cell Budget, Build State, Tournament.
   - Pinned Goals: Garlic Thorns to Lv.13, Wall Regen to Lv.10, Improve Trade-off Perks to Lv.7.
   - Completed Goals: Save 1,250 Stones for 6th UW, Save 2,000 Stones.
   - Warning: "In-Game Check Required" (some build metrics unverified).
   - Lab Allocations: 5/5.
2. **Main Content (Research Queue)**:
   - Header: "Research Queue" with a button to "Hide Wiki Master Catalog".
   - "THE TOWER — FULL MASTER LAB ENCYCLOPEDIA" section: Contains search input, category filters (All Labs, Main & Speed, etc.), and cards for various labs (some missing titles in DOM but showing "Wiki" and "Add to planner" or "In Planner" status).
   - "Reference Run" (Latest Farm Run) and "Target Lab Boost" (2.0x boost) selectors.
   - Toggle buttons for "Split (Score / Day)" and "Unified (Score / Coin)".
   - "Research Rankings" section: Search input (prefilled with "Lab Speed"), category filters, and a table showing "Lab Speed" (Lv.1 -> Lv.2) as the only item.
3. **Missing Features**:
   - There is no banner suggesting login/register to save data online (related to the user's ultimate goal).
