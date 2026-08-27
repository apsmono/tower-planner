# Handoff — connecting Tower Planner to Supabase

**To:** agy · **From:** Amalia (via Claude) · **Written:** 2026-08-28
**Parent decision record:** *Tower Planner Data Architecture* artifact, and
`claude/tower-planner-app.md` in the Claude project.
**Schema reference:** `supabase/README.md` — read it before writing any query.

The database exists and the project is linked. No client code touches it yet.
This document is the whole job, in the order it has to happen.

---

## Ground rules

These are not preferences. Breaking any one of them loses data that has no
upstream to restore from.

1. **The app must keep working with no network.** Today it runs next to the
   game, on a phone, offline. Local storage stays the read path for the
   session; the network syncs behind it. A version that shows a spinner before
   it can display last night's runs is a downgrade regardless of how good the
   schema is.

2. **Never let an empty cloud state overwrite a populated local one.** The
   build state — lab levels, UW stats, module sub-effects, balances — is hours
   of hand typing and the game has no export for any of it. First sign-in
   *adopts* local into cloud. It never replaces local with cloud.

3. **Do not run the phases out of order.** Each one closes a failure mode the
   next one would otherwise make permanent.

4. **Never commit a secret key.** `sb_secret_…` / `service_role` never appears
   in `src/`, in `.env.local`, or in a commit. It is for the seed script and
   the dashboard only.

5. **When something contradicts this doc, stop and ask.** Do not improvise a
   migration.

---

## Where things stand

**Done:**

- `supabase/migrations/` — four migrations, applied. 11 `ref_*` tables, 8
  user-state tables, `runs` + `tournament_results`, RLS on everything.
- `supabase/seed.sql` — generated reference data, 250 upserts, idempotent.
- `supabase/tests/schema_checks.sql` — 48 assertions, all green against
  Postgres 16.
- `scripts/generate-seed.ts` — regenerates the seed from the bundle constants.
- Project linked (`supabase/.temp/project-ref` exists).

**Verify before you start** — I could not confirm the push from here:

```bash
npx supabase migration list --linked     # all four should show as applied remote
```

If they are not applied: `npx supabase db push --include-seed`.

Then confirm the seed actually landed:

```sql
select count(*) from ref_labs;                -- 71
select count(*) from ref_tournament_rewards;  -- 70
select data_version from ref_data_version;    -- >= 1
```

**Not done:** anything in `src/`. `@supabase/supabase-js` is not installed.

---

## Phase 0 — harden, with no network involved

**Ships alone. Reversible. No schema decisions. Do this first.**

Amalia's call, and the reasoning is worth understanding rather than just
obeying: the run count is currently **0**. There is no history to lose today,
which makes this the cheapest it will ever be. Every run imported before these
land is one that later gets re-imported or written off.

### 0.1 — Section-scoped parser keys

`src/domain/parser.ts:245-247`

```ts
const parts = trimmed.split(/\t+| {2,}/);
if (parts.length < 2) {
  // Section header, skip or keep as raw if needed, but not data key-value
  continue;
}
```

That `continue` discards the exact information the keys need. DOMAIN.md §1.2
rule 3: v2 Battle Report labels collide across sections, so keys must be
`section::label`. A flat map silently overwrites — the documented consequence
is Black Hole damage recording as a destroyed-by count. Nothing errors; the
Upgrade Queue's coin-share denominator is just wrong, and that denominator is
the entire ranking model.

**Do:**

- Track the current section header instead of skipping it. Sections are
  `Battle Report`, `Combat`, `Utility`, `Enemies Destroyed`, `Bots`, `Guardian`.
- Key `raw` and `fields` as `section::label` / `section::normKey`.
- Keep the six promoted scalars (`battleDate`, `gameTime`, `realTime`, `tier`,
  `wave`, `killedBy`) resolving as they do now — they are unambiguous.
- Provide a lookup helper so call sites do not hand-build `"Combat::blackHoleDamage"`
  strings. Every existing `fields[...]` read site has to move to it.

**Acceptance:** a fixture containing the colliding label in two sections parses
to two distinct entries with the right values. Add it to `parser.test.ts`
alongside the existing EU-locale and bulk-split cases.

### 0.2 — Keep the original paste

`src/components/ImportRuns.tsx:190` builds each `Run` from the parsed preview,
then clears `pasteText`. `raw` is *not* the report — it is the same flattened
map with string values, already missing the collided keys.

Without this, fixing 0.1 recovers nothing. Every run imported before the fix
stays wrong forever, and re-importing means finding those reports again in a
game screen that only holds recent history.

**Do:**

- Add `rawText: string` and `parserVersion: number` to `Run` in
  `src/domain/store.ts:5`.
- Carry the exact per-run block through `parseBulkBattleReports` — the split on
  `/(?=Battle Report)/i` already has it; return it rather than dropping it.
- Bump the persist `version` to `3` (`store.ts:694`) and add a `migrate` step
  that stamps existing runs `parserVersion: 0, rawText: ''`. Empty means
  *unverifiable*, not wrong. Do not fabricate one.

**Cost:** ~2 KB per run. It converts every future parser bug from permanent
data loss into a background re-parse. This is the highest-value change in the
document.

### 0.3 — Stop claiming data is backed up

`src/components/AuthModal.tsx:69` waits 600 ms on a `setTimeout`, fabricates
`id: user-${Date.now()}`, and shows *"Successfully signed in! Your runs and
build state are now synced online."* The password is never sent anywhere
because there is nowhere to send it. `syncCloudData()` (`store.ts:530`) stamps
`lastSyncedAt` and does nothing else. `AuthSyncBanner.tsx:36` renders
*"Online Cloud Sync Active — N runs backed up."*

That claim is false and it is attached to data DOMAIN.md describes as
unrecoverable.

**Do:** either wire it (Phase 2) or relabel the surface as a preview until
then. Since Phase 2 is several sessions out, relabel now. Do not delete the
component — Phase 2 replaces its internals.

### 0.4 — Zod schemas at the boundary

`zod@^4.4.3` is in `package.json` and `grep` finds no import of it in `src/`.
SPEC.md §2 assigns it to parser output and JSON import.

**Do:** write `ParsedRunSchema`, `RunSchema`, `BuildStateSchema`,
`PlannerTaskSchema`. Today they guard the JSON import path. From Phase 1 they
are the validation layer for everything crossing the network, in both
directions, and the natural place to define the client/server contract once.

Derive them from the same shapes the database enforces — `supabase/README.md`
lists every constraint. Where the DB has a check constraint, the Zod schema
should have the matching refinement, so a bad value fails in the client with a
readable message instead of as a Postgres error.

### 0.5 — Data-shape prerequisites the schema hard-requires

Not optional, and not deferrable past Phase 3.

- **Run ids are not UUIDs.** `ImportRuns.tsx:190` generates
  `${Date.now()}-${idx}-${Math.random()...}`. `runs.id` is `uuid`. Switch to
  `crypto.randomUUID()` and migrate existing ids in the same persist bump as
  0.2. Note `planner_tasks.experiment_completed_run_ids` is `uuid[]` and
  references them — remap both sides together or the link breaks silently.
- **Nothing generates `content_hash`.** `runs.content_hash` is `not null` and
  carries a unique index on `(user_id, content_hash) where deleted_at is null`.
  Hash the *normalized* `rawText` (trim, collapse whitespace runs, normalize
  line endings) with SHA-256 via `crypto.subtle.digest`. It makes a
  double-paste a no-op and doubles as the outbox idempotency key in Phase 3.
- **`'Champion'` is stamped into the data at import.**
  `ImportRuns.tsx:176` writes `{ bracket: 'Champion', rank: null }` onto every
  tournament run. This is worse than a display default — it is persisted. The
  relational model is `tournament_results` with a **nullable** `league` and a
  nullable FK from `runs`. Import must leave the league unknown when it is
  unknown. Any existing tournament run carrying an unverified `'Champion'`
  should be migrated to `null` and flagged for Amalia to fill in.

**Phase 0 exit criteria:** every acceptance check in SPEC.md §7 green,
`npm run test` green, `npm run build` clean, and `parser.test.ts` covering the
section-collision case. No `@supabase/*` dependency yet.

---

## Phase 1 — schema and reference data

**Server exists. Client still reads localStorage.**

### 1.1 — Client and configuration

```bash
npm i @supabase/supabase-js
```

`.env.local` (gitignored — the `.gitignore` entry is already there):

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Use the **publishable key** (`sb_publishable_…`), not the legacy `anon` JWT.
Both work today; the legacy JWT keys are scheduled for deprecation by the end
of 2026. The rename does not affect the schema — a publishable key still maps
to the Postgres `anon` role until a session exists, which is what the RLS
policies are written against.

Commit a `.env.example` with the keys present and the values blank.

Create `src/lib/supabase.ts` exporting a single client. One instance for the
app — multiple `createClient` calls each open their own auth listener and they
will fight over the session in Phase 2.

Generate types and commit them:

```bash
npx supabase gen types typescript --linked > src/lib/database.types.ts
```

Regenerate on every schema change. Do not hand-edit that file.

### 1.2 — Reference read path, behind a flag

Pull the 11 `ref_*` tables. Cache them in localStorage under a key **separate**
from `tower-planner-store` — reference data must not share a write path with
user data, which is half the reason for this whole migration.

- Poll `ref_data_version.data_version`. Re-pull only when it moves.
- The bundled `const` arrays in `src/data/labCatalog.ts` and
  `src/domain/cellModel.ts` stay as the offline fallback. Do not delete them.
- Feature-flag the whole path so it can be switched off without a revert.

Read order for a consumer: cache → network (if version moved) → bundled array.
Never network-first; see ground rule 1.

**This step alone closes DOMAIN.md §10** — cell-model drift across game patches
stops being a redeploy. `ref_cell_anchors`, `ref_boost_costs` and
`ref_ideal_farming_waves` are rows now.

### 1.3 — Two model corrections that come free with the ref tables

- **Tournament rewards.** Replace the if/else chain in
  `src/domain/tournamentModel.ts` with a lookup against
  `ref_tournament_rewards`, or call the `tournament_rewards(league, rank)`
  function. It returns **zero rows** for an unknown league instead of guessing.
  Render that as unknown. Never substitute a default league.
- **Lab ids.** Three of the five slots in `INITIAL_BUILD` (`store.ts:441-445`)
  point at ids that do not exist in `MASTER_LAB_CATALOG`:

  | `INITIAL_BUILD` | actual catalog id |
  | --- | --- |
  | `labs_speed` | `lab_speed` |
  | `auto_pick` | `auto_pick_ranking` |
  | `dw_cells` | `dw_cell` |

  `LabDatabase.getLabById()` already returns `undefined` for all three today.
  `lab_slots.research_id` is a FK to `ref_labs(id)` and will reject them. Fix
  the ids in `store.ts`, and migrate any persisted slot pointing at the old
  spelling. **Do not drop the constraint.**

**Phase 1 exit criteria:** reference data renders from the network with the
flag on, from the bundle with it off, and from cache with the network cut.
Bumping `data_version` in the dashboard triggers a re-pull on next load.

---

## Phase 2 — real auth, and the adoption path

**The step with an irreversible failure mode. Read ground rule 2 again.**

Amalia's decision: **anonymous session first, upgrade later.**

### 2.1 — Anonymous session on first load

Enable anonymous sign-ins in the Supabase dashboard (Auth → Providers), then
`supabase.auth.signInAnonymously()` when there is no session.

This gives a real `user_id` from day one without an email, which is what makes
adoption a straightforward upsert rather than a merge across two identities.
An anonymous session issues a JWT with role `authenticated` and
`is_anonymous: true` — the RLS policies are all `to authenticated`, so they
already cover it. No policy changes needed.

Later, `supabase.auth.updateUser({ email })` converts the same user to a real
account. **The `user_id` is preserved**, so nothing has to be re-parented. Use
magic link or OAuth for the upgrade; no password handling.

Caveat to plan for: an anonymous session lives in that browser's storage only.
Clearing site data orphans the rows. Surface an honest prompt to attach an
email once there is real data — but do not nag, and never block the app on it.

### 2.2 — The bootstrap trigger already ran

`handle_new_user()` fires on `auth.users` insert and seeds: `profiles`,
the singleton `build_states` row, exactly 5 `lab_slots`, and 9
`ultimate_weapons` rows with defaults from `ref_uw_stats`. Every insert is
`on conflict do nothing`.

So the cloud is **not** empty when you first look at it. It holds defaults.
Do not read "rows exist" as "this account has data."

### 2.3 — Adoption

This is the part that eats data if you get it backwards.

- Local state is the source of truth on first sign-in. Push it up as an
  **upsert** over the seeded defaults.
- Decide "has this account been populated?" from an explicit marker you write
  after a successful adoption — not from row counts, for the reason in 2.2.
- Adoption is idempotent and re-runnable. If it fails halfway, running it again
  must converge, not duplicate.
- Order: `profiles` → `build_states` → `lab_slots` →
  `research_catalog_entries` → `ultimate_weapons` → `modules` →
  `module_sub_effects` → `planner_tasks` → `tournament_results` → `runs`.
  FKs and the composite `module_sub_effects` key require it.
- Take a JSON export of the full local state before the first adoption run and
  keep it. The existing export path already produces one.

**Phase 2 exit criteria:** sign in on a second browser, confirm the same data
appears; sign in on a browser with local data and confirm the local data
survives and reaches the server; confirm no path exists that clears local
because the server looked empty. Test the third case deliberately.

---

## Phase 3 — the sync engine

**Three lanes, three policies, one boundary.** Do not build one generic sync
for all of it — the three tiers differ in owner, edit rate and what a conflict
even means.

### Lane A — reference (inward only)

Already built in Phase 1. Pull when `data_version` moves. Never write.

### Lane B — user state (round-trip, last-write-wins)

`build_states`, `lab_slots`, `research_catalog_entries`, `ultimate_weapons`,
`modules`, `module_sub_effects`, `planner_tasks`.

- Stays on localStorage locally. It is small and edited constantly.
- Push debounced ~2s after the last edit.
- Pull on window focus. Newer `updated_at` wins.
- `updated_at` is maintained **server-side** by a trigger. Do not send it, and
  do not trust a client clock for ordering.
- Last-write-wins is acceptable here *only* because it is one person on two
  devices. Say so in a comment so it is not later assumed safe for anything
  else.

### Lane C — run log (outbox out, cursor in)

`runs`, `tournament_results`.

- **Move runs to IndexedDB.** This is the point of the whole exercise: at 300
  runs, every keystroke in a Build State field currently re-serializes ~1.6 MB
  on the main thread, because one `persist()` writes one string. The 5 MB quota
  (≈991 runs, ≈8 months at 4/day) is the second wall, not the first.
- Keep the small tiers on localStorage. Do not move everything.
- **Outbox table.** Writes append to it; a drain pushes them. Dedupe on
  `content_hash` — the partial unique index makes a re-push a no-op.
- **Pull by `updated_at` cursor.** The `runs_user_updated_at_idx` index
  deliberately has no partial predicate so tombstones come through. A pull that
  filters out `deleted_at is not null` will silently resurrect deleted runs on
  the other device.
- **Deletes are soft.** Set `deleted_at`. Never `DELETE`. Re-importing after a
  soft delete works by design — the unique index is `where deleted_at is null`.
- A sync must never rewrite history. Runs are immutable once parsed; the only
  legitimate mutations are `deleted_at`, `excluded`, `notes`,
  `dissonance_multiplier`, `tournament_result_id`, and a re-parse bumping
  `fields`/`parser_version`.

### Retroactive re-parse

Once 0.2 has shipped and rows carry `raw_text`, a parser fix becomes:
select where `parser_version < current`, re-parse from `raw_text`, update
`fields`/`raw`/`parser_version`. Build this as a visible background job with a
progress indicator, not a silent one. Rows with an empty `raw_text` are
skipped and stay flagged unverifiable.

---

## Phase 4 — conflict surface and observability

Only once two devices are actually in use.

- A real sync state that distinguishes **synced / pending / failed**. The
  current banner has one state and it is a lie.
- The ambiguity prompt DOMAIN.md §1.4 asks for when two tournament rows match
  one run on `(date, wave)`. `tournament_results` deliberately has no
  uniqueness on `(user_id, event_date)`, so two candidates is a representable
  state that needs a human answer.

---

## Things not to do

- **Do not add a GIN index on `runs.fields`** unless a query actually searches
  inside the blob. Every Tier Lab aggregate uses the promoted scalar columns.
- **Do not add an FK from `research_catalog_entries.lab_id` to `ref_labs`.**
  The app lets Amalia add entries the wiki catalog does not carry, and the
  prices are hers, not the game's. This is deliberate.
- **Do not make `tournament_results.league` non-null**, or default it. An
  unknown bracket must stay representable as unknown — that is the entire
  reason the table exists.
- **Do not use `bigint`** for costs or balances. The seed catalog already has a
  507.10B entry and parsed fields carry suffixes to 1e63; `bigint` overflows at
  9.2e18. `numeric` throughout; `double precision` semantics inside the jsonb
  blob, which is what JS `number` gives you anyway.
- **Do not edit `supabase/seed.sql` by hand.** It is generated. Change the
  source constants and re-run `scripts/generate-seed.ts` — the command is in
  `supabase/README.md`.
- **Do not write reference data from the browser.** `ref_*` tables have a
  public read policy and no write policy at all, by design.
- **Do not skip a phase** because the next one looks more interesting.

---

## Open questions for Amalia

Ask before deciding these yourself:

1. **Anonymous session lifetime.** Clearing site data orphans an anonymous
   account's rows. How hard should the app push for an email, and at what point
   — first run imported, tenth, never unless asked?
2. **Existing tournament runs stamped `'Champion'`.** Migrate them all to
   `league = null` and let her re-enter, or try to infer from wave and date?
   Recommendation: null them. An inferred league is the same bug with extra
   steps.
3. **Re-parse policy.** When a parser fix lands, re-parse automatically on next
   load, or prompt first? Recommendation: prompt, and show what changed — the
   Upgrade Queue rankings will move, and she should see why.
