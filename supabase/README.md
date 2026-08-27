# Supabase schema

Phase 1 of the migration in *Tower Planner Data Architecture*: the server
exists, the client still reads localStorage. Nothing in `src/` is wired to any
of this yet.

## Layout

| Path | What |
| --- | --- |
| `migrations/20260828000000_extensions_and_helpers.sql` | `btree_gist`, `uuid_generate_v7()`, the `updated_at` trigger function |
| `migrations/20260828000100_reference_tier.sql` | 11 `ref_*` tables, public read / no write policy, `tournament_rewards()` |
| `migrations/20260828000200_user_state_tier.sql` | `profiles`, `build_states`, `lab_slots`, `research_catalog_entries`, `ultimate_weapons`, `modules`, `module_sub_effects`, `planner_tasks`, new-user bootstrap |
| `migrations/20260828000300_run_log_tier.sql` | `tournament_results`, `runs` |
| `seed.sql` | **Generated.** Reference data, upserts only. Regenerate with `scripts/generate-seed.ts` |
| `tests/schema_checks.sql` | 48 assertions — constraints, RLS, the bootstrap trigger |
| `tests/_local_harness.sql` | Stub of the `auth` schema and Supabase roles, for running the checks against a plain Postgres |

## Applying it

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push                      # runs migrations/ in filename order
npx supabase db push --include-seed       # or apply seed.sql separately
```

`seed.sql` is every-statement-upsert, so re-running it after a game patch
corrects rows in place instead of failing on a primary key. It bumps
`ref_data_version.data_version`, which is the value the client will poll to
know it should re-pull.

Reference tables have a public read policy and **no write policy at all**.
Writing them needs the service_role key, which never leaves your machine —
the seed runs from the CLI or the dashboard SQL editor, never from the browser.

## Regenerating the seed

```bash
npx esbuild scripts/generate-seed.ts --bundle --format=esm --platform=node \
  --packages=external --outfile=node_modules/.cache/generate-seed.mjs \
  && node node_modules/.cache/generate-seed.mjs > supabase/seed.sql
```

It reads the same `const` arrays the bundle does, so the SQL cannot drift from
the TypeScript. The tournament ladder is derived by probing
`getTournamentRewards()` across ranks 1–30 and coalescing identical payouts
into bands, rather than transcribed by hand.

Current output: 71 labs, 9 Ultimate Weapons (27 stats), 7 leagues / 70 reward
bands, 21 effect channels, 20 cell anchors, 9 boost tiers, 9 ideal farming
waves, 6 module tiers.

## Running the checks

Needs any Postgres 15+. Against a local one:

```bash
createdb tower_planner_test
psql -d tower_planner_test -f supabase/tests/_local_harness.sql
for f in supabase/migrations/*.sql; do psql -v ON_ERROR_STOP=1 -1 -d tower_planner_test -f "$f"; done
psql -v ON_ERROR_STOP=1 -1 -d tower_planner_test -f supabase/seed.sql
psql -d tower_planner_test -f supabase/tests/schema_checks.sql | grep -E '^(ok|FAIL|---)'
```

`_local_harness.sql` only exists because a bare Postgres has no `auth` schema.
Do not run it against the hosted project.

## Known blockers before data moves

These are schema-visible and deliberate. None of them stop `db push`; all of
them stop a clean import of the current localStorage state.

**Three lab-slot ids in `INITIAL_BUILD` do not exist in the master catalog.**
`lab_slots.research_id` is a foreign key to `ref_labs(id)`, and the seeded
build state points three of its five slots at `labs_speed`, `auto_pick` and
`dw_cells`. The catalog carries `lab_speed`, `auto_pick_ranking` and `dw_cell`.
This is already broken today — `LabDatabase.getLabById()` returns `undefined`
for all three, so those slots render without their metadata. Fix the ids in
`src/domain/store.ts`; do not drop the constraint.

**`runs.content_hash` is `not null` and there is nothing producing it yet.**
The import path has to hash the normalized paste before any row can be
written. It doubles as the outbox idempotency key.

**`runs.raw_text` is nullable, and it should not stay that way for long.**
Null means "imported before the original paste was retained" — unverifiable,
not wrong. Every run written after the parser fix should carry it, and
`parser_version` should stop being `0`.

**Phase 0 still comes first.** Section-scoped parser keys, `raw_text` /
`parser_version` on `Run`, Zod schemas, and the mock cloud-sync copy either
wired or retitled. Rows imported before the parser fix stay wrong once they are
on a server read by more than one device.

## Deliberately not constrained

- `research_catalog_entries.lab_id` has no FK to `ref_labs`. The app lets the
  player add entries the wiki catalog does not carry, and prices are the
  player's, not the game's.
- `tournament_results.league` is nullable. An unknown bracket must be
  representable as unknown — that is the whole reason this table exists rather
  than `{ bracket, rank }` embedded in each run.
- A `tournament` run with no `tournament_result_id` is legal. The reverse is
  not: a `farm` run may not link one.
- No GIN index on `runs.fields`. Every aggregate the Tier Lab runs uses the
  promoted scalar columns. Add one when a query actually needs to search inside
  the blob.
