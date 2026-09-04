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

- [x] **12. Import Version Dropdown Defaulting**
  - Converted version selection into a dropdown populated from changelog versions (`GAME_CHANGELOG`), defaulting to the latest version or the user's previously selected version saved in store (`ImportRuns.tsx` & `store.ts`).

- [x] **13. Auto-fill Dissonance Value on Import**
  - Automatically populated dissonance multipliers during battle report parsing based on the run's tier from the user's Dissonance Databank and lab scaling (`ImportRuns.tsx`).

- [x] **14. User Dissonance Databank**
  - Created a dedicated User Dissonance Databank store slice and interactive modal (`DissonanceDatabankModal.tsx` & `store.ts`) for managing tier-by-tier dissonance multipliers.

- [x] **15. Dissonance Lab Integration**
  - Integrated Dissonance Amplifier lab research (+1.0%/lvl) into `MASTER_LAB_CATALOG` and dynamic effective multiplier calculations (`calculateEffectiveDissonance` & `dissonance.test.ts`).

- [x] **16. Welcome / Onboarding Cover Modal**
  - Built onboarding greeting modal (`WelcomeModal.tsx`) that greets first-time visitors, explains app features, persists seen state, and can be reopened from the header.

- [x] **17. [Bug] Run History Table Coin Gain Header vs Value**
  - Fixed header/data mismatch by aligning table headers to `Coins / hr` and `Cells / hr` with currency icons in `ImportRuns.tsx`.

- [x] **18. Remove "Actions" Column Header in Run History Table**
  - Cleaned up the Run History table header by removing the redundant "Actions" text header in `ImportRuns.tsx`.

- [x] **19. Invert Run History Include/Exclude Toggle Logic & Default**
  - Changed switch behavior so that "ON" (emerald) means "Included" and "OFF" (zinc) means "Excluded", defaulting imported runs to included (`ImportRuns.tsx`).

- [x] **20. Enhance Theme Toggle (Light/Dark/System) UX**
  - Enhanced `ThemeToggle.tsx` so clicking directly cycles between theme modes (Light -> Dark -> System), while hovering smoothly reveals explicit dropdown options.

- [x] **21. Move Cloud Icon to Headbar & Show Real-time Sync Status**
  - Relocated the cloud status indicator from the left sidebar to the top headbar (`Layout.tsx`), dynamically displaying real-time sync states (`Saving...` with spinner, `Synced` with green checkmark, `Offline`, or `Sync Error` with reconnect prompt).

- [x] **22. Updated Auth Scheme & Passwordless / Magic Link Support**
  - Analyzed and updated the authentication scheme in `authService.ts` and `AuthModal.tsx`:
    - Added passwordless Magic Link / OTP login (`signInWithOtp`).
    - Added password reset support (`resetPasswordForEmail`) and in-app password update (`updatePassword`).
    - Supported optional password setting when linking/upgrading anonymous accounts (`upgradeAccountWithEmail`).
    - Added 8 unit tests in `src/domain/authService.test.ts`.

- [x] **23. Remove Header Adoption Banner for Linked Accounts**
  - Updated `AuthSyncBanner.tsx` to completely hide the top adoption banner once an account is linked with a permanent email (`user?.isLoggedIn && !user.email.includes('Anonymous')`), preserving clean vertical space.


