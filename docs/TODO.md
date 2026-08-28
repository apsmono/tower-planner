# Tower Planner — TODO

- [ ] **1. Review all docs again, from scratchpad**
  - Cross-check notes, plans, walkthroughs, and scratchpads in `docs/Scratchpad/` and `docs/Plan/` to ensure documentation and implementation alignment.

- [ ] **2. Check all available currencies in "The Tower - Idle Tower Defense" game**
  - Audit all in-game currencies (Coins, Gems/Diamonds, Stones/Power Stones, Cells/Reroll Shards/Module Shards, Medals, Keys, Tournament Tickets, etc.) and verify icon assets, labels, and formatting.

- [ ] **3. Add changelog wiki**
  - Set up a comprehensive changelog / wiki section or document tracking patch updates, version notes, and feature additions.

- [ ] **4. Add our own wiki and database**
  - Build out a built-in wiki and centralized reference database (cross-referencing other community resources, wikis, and game data to compare and validate numbers).

- [ ] **5. Add perks database**
  - Create the data model, level stats, ban/pick priority references, and lookup database for standard, trade-off, and ultimate weapon perks.

- [ ] **6. Add modules database**
  - Compile module rarity tiers, unique effects, substat rolls, shard costs, and upgrade levels.

- [ ] **7. Add module panel**
  - Implement a dedicated module management and planning panel (loadouts, substat reroll targets, shard requirements, and stats breakdown).

- [ ] **8. Modal to change details in research queue**
  - Add a modal to edit research item details (e.g. level, priority, configurations) directly from within the research queue.

- [ ] **9. Add import function for user account & lifetime stats**
  - Support importing game stats from `Settings > Stats` (via copy-paste text or screenshot/OCR).
  - Parse and track user total/lifetime stats and highest wave records for each tier (T1–T23 / max tier).

- [ ] **10. Categorize run logs by run type (Tournament, Event/Mission, Farm, Push/Milestone)**
  - Add run type tags/categories:
    - **Tournament Run**: Dedicated tournament attempts and league rankings.
    - **Event / Mission Run**: Dedicated runs for daily or event mission completion (treat as outliers/noise so they don't skew farm or tournament analytics).
    - **Farm Run**: Standard coin/cell economy and income farming runs.
    - **Push / Milestone Run**: Pushing for maximum wave records, tier unlocks, and milestone rewards.
  - Provide filter and toggle controls to include/exclude specific run categories from charts, hourly rates, and average progression stats.


