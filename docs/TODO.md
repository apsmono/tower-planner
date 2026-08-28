# Tower Planner — TODO

- [x] **1. Review all docs again, from scratchpad**
  - Cross-check notes, plans, walkthroughs, and scratchpads in `docs/Scratchpad/` and `docs/Plan/` to ensure documentation and implementation alignment.

- [x] **2. Check all available currencies in "The Tower - Idle Tower Defense" game**
  - Audit all in-game currencies (Coins, Gems/Diamonds, Stones/Power Stones, Cells/Reroll Shards/Module Shards, Medals, Keys, Tournament Tickets, etc.) and verify icon assets, labels, and formatting.

- [x] **3. Add changelog wiki**
  - Set up a comprehensive changelog / wiki section or document tracking patch updates, version notes, and feature additions (`src/data/changelogData.ts`).

- [x] **4. Add our own wiki and database**
  - Built out a built-in wiki and centralized reference database (cross-referencing community resources, wikis, and game data) with `PerksWikiPanel.tsx` and Supabase `ref_*` tables.

- [x] **5. Add perks database**
  - Created the data model, level stats, ban/pick priority references, and lookup database for standard, trade-off, and ultimate weapon perks (`src/data/perksCatalog.ts` & `supabase/migrations/20260828000400_perks_and_wiki.sql`).

- [x] **6. Add modules database**
  - Compiled module rarity tiers, unique effects, substat rolls, shard costs, and upgrade levels (`src/data/modulesCatalog.ts` & `supabase/migrations/20260828000500_modules_tier.sql`).

- [x] **7. Add module panel**
  - Implemented dedicated module management panel and edit modal (`src/components/ModulesPanel.tsx` & `src/components/ModuleEditModal.tsx`).

- [x] **8. Modal to change details in research queue**
  - Added dedicated edit modal (`src/components/ResearchItemModal.tsx`) to edit research item details directly from within the research queue.

- [x] **9. Add import function for user account & lifetime stats**
  - Supported importing game stats from `Settings > Stats` (`src/domain/statsParser.ts` & `src/components/StatsImportModal.tsx`), parsing career totals and highest wave records across tiers.

- [x] **10. Categorize run logs by run type (Tournament, Event/Mission, Farm, Push/Milestone)**
  - Added run type tags/categories (`farm`, `tournament`, `milestone`, `event`), filters, and exclusions across `ImportRuns.tsx`, `RunDetailsModal.tsx`, and database check constraints (`20260828000600_run_type_event_and_lifetime_stats.sql`).

- [x] **11. Rule: Always use modals to edit values**
  - Enforced standard UX pattern across all views, tables, and lists in `.agents/rules/modals_ux.md`.



