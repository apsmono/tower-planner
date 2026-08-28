# Deploy plan — Tower Planner

**Written:** 2026-08-28 · **Target:** Cloudflare Pages · **Access:** public URL, RLS is the boundary
**Gate:** the four defects in Part A land before the first deploy.

---

## Repo status at time of writing

Commit `5782c47`, branch `main`, clean tree, in sync with `origin/main`.

| Check | Result |
| --- | --- |
| `npm ci` | clean, 131 packages |
| `tsc -b && vite build` | clean — `dist/` 1,014 kB JS (275 kB gzip), 108 kB CSS |
| `vitest run` | 16 passed / 3 files (parser, schemas, tournamentModel) |
| `oxlint` | 0 errors, 4 warnings (setState-in-effect, `AuthModal.tsx:47` and similar) |
| Secret-key scan of `src/`, `index.html`, `package.json` | clean — no `sb_secret`, no `service_role` |
| `.env.local` tracked? | no — ignored by `.gitignore:34`. Only `.env.example` is committed |

Verified on Linux in a scratch copy, not against the repo's own `node_modules` —
that tree holds darwin-arm64 native bindings, so running the suite through the
device shell fails on a missing `@rolldown/binding-wasm32-wasi`. That is an
environment artifact, not a repo problem. **Do not run `npm i` inside
`~/Developer/projects/tower-planner` from a Linux shell** — it will replace the
macOS bindings and break local dev.

Phases 0–3 of `HANDOFF-supabase.md` are substantially implemented:
section-scoped parser keys with a `getField` resolver, `rawText` /
`parserVersion` / `contentHash` on `Run` behind a persist v3 migration,
`crypto.randomUUID()` ids with task-reference remapping, anonymous auth,
adoption with a backup and an explicit per-user marker, IndexedDB run storage,
and a three-lane sync engine. The reference cache correctly lives under its own
`tower-planner-ref-cache` key.

---

## Part A — four defects, all before deploy

Three of them are one bug wearing three hats: the relational tournament model
exists in the database and is not connected to anything. Bracket and rank are
hand-entered, the game has no export for them, and today they live only in
localStorage.

### A1 — `tournament_results` is never written

`adoptionService.ts:173` has the comment `// 9. runs (and tournament_results if
applicable)` and no code under it. Nothing anywhere inserts a
`tournament_results` row, and nothing ever sets `runs.tournament_result_id`.

The client still carries the old embedded shape — `Run.tournament =
{ bracket, rank }` — which is the model the schema deliberately replaced.

**Do:** write `tournament_results` on adoption and on sync push. Map
`Run.tournament.bracket` → `tournament_results.league` (null when unknown),
`Run.tournament.rank` → `rank`, and the run's date → `event_date`. Set
`runs.tournament_result_id` to the new row. Remember the schema constraint: a
`farm` run may not carry a `tournament_result_id`.

### A2 — the sync pull hard-codes `tournament: null`

`syncEngine.ts:282`, inside the row-to-`Run` mapping:

```ts
runType: r.run_type as 'farm' | 'tournament' | 'milestone',
tournament: null,
```

Every run that comes back from the server has its bracket and rank erased. Then
the merge at the bottom of that function does
`liveRemoteRuns.forEach((r) => mergedMap.set(r.id, r))` — remote overwrites
local wholesale. So the first pull that touches a tournament run destroys
hand-entered data that has no upstream to restore it from.

This is the exact failure mode ground rule 2 was written against, arriving
through the run lane instead of the adoption lane.

**Do:** join `tournament_results` on pull (`select('*, tournament_results(*)')`)
and reconstruct `tournament` from it. Until A1 lands there is nothing to join,
so A1 and A2 ship together.

### A3 — `TournamentHistory` re-invents `'Champion'`

`TournamentHistory.tsx:29`, `:167`, `:175`:

```ts
getTournamentRewards(r.tournament?.bracket || 'Champion', ...)
{run.tournament?.bracket || 'Champion'}
```

The persist v3 migration (`store.ts:756`) correctly nulls the bogus `'Champion'`
stamp, and `ImportRuns.tsx:201` now correctly writes `bracket: null`. Then this
component substitutes it straight back at render, and computes Champion-league
gems and stones from it.

Net effect on screen is unchanged from before any of the fixes.

**Do:** render unknown as unknown. Show a "set league" affordance rather than a
value. Where rewards cannot be computed, show nothing — `tournament_rewards()`
in the database already returns zero rows for a null league, and the client
should behave the same way.

### A4 — the Zod schemas are dead code

`schemas.ts` defines `RunSchema`, `BuildStateSchema`, `PlannerTaskSchema`, and
`schemas.test.ts` exercises them. Nothing else in `src/` imports the file.

Meanwhile the pull at `syncEngine.ts:275-276` does:

```ts
fields: (r.fields as Record<string, number>) || {},
raw:    (r.raw as Record<string, string>) || {},
```

An unchecked cast on a jsonb blob crossing the network — precisely the boundary
the schemas were written for.

**Do:** validate on the way in (sync pull, JSON import) and on the way out
(outbox push, adoption). Parse failures should be surfaced and skipped, not
thrown away silently, and not allowed to poison the merge.

### Exit criteria for Part A

- Import a tournament run with a known league and rank; confirm a
  `tournament_results` row and a populated `runs.tournament_result_id`.
- Import one with no league; confirm `league is null` and the UI shows unknown,
  not Champion, and shows no reward figures.
- Sync to a second browser profile; confirm bracket and rank survive the pull.
- `npm run test`, `npm run build`, `npm run lint` all clean.

---

## Part B — deploy to Cloudflare Pages

Chosen over Vercel and Netlify for the free-tier ceiling and because it needs no
`base` change: the app deploys at a root path and has no client-side router
(`react-router-dom` is in `package.json` but nothing imports it — worth removing
in a later cleanup).

### B1 — Supabase dashboard, before the first deploy

1. **Auth → Providers → Anonymous sign-ins: on.** The whole adoption path
   depends on it.
2. **Auth → URL Configuration.** Set Site URL to the Pages URL and add it to
   the redirect allowlist, alongside `http://localhost:5173` so local dev keeps
   working. Email confirmation and any future magic link break without this.
3. **Confirm the migrations and seed are applied:**
   ```sql
   select count(*) from ref_labs;                -- 71
   select count(*) from ref_tournament_rewards;  -- 70
   select data_version from ref_data_version;    -- >= 1
   ```
4. **Re-run `supabase/tests/schema_checks.sql` logic against the live project?**
   No. It inserts into `auth.users` directly. Leave it for local Postgres only.

### B2 — Pages project

Connect the GitHub repo `apsmono/tower-planner`, production branch `main`.

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(repo root)* |

Environment variables — **Settings → Environment variables**, set for both
Production and Preview:

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Pin Node with a committed `.nvmrc` (`22`), which the build image honours; a
`NODE_VERSION` environment variable does the same job if you prefer it in the
dashboard.

Nothing else is needed. No `_redirects` file — there is no client-side router,
so there are no deep links to rewrite. Add one only if routing is introduced.

### B3 — What is and is not secret

The publishable key ships inside the JavaScript bundle. That is by design and
it is safe **because** RLS is on every table with `user_id = auth.uid()`
policies, verified by 48 assertions. The key grants the ability to open a
session, nothing more.

What must never reach the bundle or the dashboard's build variables:
`sb_secret_…`, the legacy `service_role` JWT, and the database password. The
seed and any reference-data correction run from your machine or the Supabase
SQL editor.

Consequence of the access decision: anyone with the URL can load the app and
create an anonymous account in your project. They see only their own rows. The
cost is free-tier quota if the URL is ever found, not exposure. If that changes,
Cloudflare Access in front of the site keeps anon-first intact — it is the one
option that does not require reworking the adoption flow.

### B4 — Post-deploy smoke test

In order, on the deployed URL:

1. Load in a private window. Reference data renders. Check the network tab for
   a `ref_data_version` request.
2. Confirm an anonymous session exists and a `profiles` row appeared, with 5
   `lab_slots` and 9 `ultimate_weapons`.
3. Import one farm run. Confirm the `runs` row, and that `raw_text` is populated
   and `parser_version` is not 0.
4. Paste the same report again. Confirm it is a no-op — the partial unique index
   on `content_hash` should absorb it.
5. Import a tournament run with a league and rank. Confirm the
   `tournament_results` row and the FK.
6. Open on your phone, sign in to the same account, confirm the runs arrive with
   bracket and rank intact.
7. **Airplane mode.** Confirm the app still opens and shows last night's runs.
   This is the property the whole migration was constrained to preserve; if it
   regressed, that outranks anything else on this page.
8. Delete a run on one device, sync both, confirm it disappears on the other and
   does not come back.

### B5 — Rollback

Cloudflare Pages keeps every deployment; rolling back is selecting a previous
one in the dashboard. There is no database rollback to pair with it — the schema
is additive so far, and a client rollback is safe against it.

The real rollback for data is the pre-adoption backup
`adoptionService.ts` writes to `tower_planner_pre_adoption_backup` in
localStorage. Before the first sign-in on the deployed site, also take a manual
JSON export through the existing export path and put it somewhere that is not a
browser.

---

## Known limitations, not blockers

**The sync cursor can skip rows under two conditions at once.**
`syncEngine.ts:250` uses `.gt('updated_at', lastCursor)` with no `.limit()`.
PostgREST caps a response at 1000 rows by default. `updated_at` is set by a
transaction-time trigger, so a batch push gives every row in that batch an
identical timestamp. If a truncation boundary ever lands inside a group of rows
sharing one timestamp, the rows after the cut are skipped permanently. Both
conditions need to be true at once, so it is far away at four runs a day — but
the fix is cheap: order and tie-break on `(updated_at, id)`, page explicitly,
and advance the cursor only past a completed page.

**Bundle is one 1,014 kB chunk** (275 kB gzip). Fine over a good connection,
less fine on the phone next to the game. `recharts` is the likely bulk; a
dynamic import of the chart-heavy tabs would cut first paint substantially.

**`.env.local` carries stray `NEXT_PUBLIC_SUPABASE_*` duplicates.** Harmless —
Vite ignores them — but they suggest a copied snippet and will confuse the next
person. Delete them; `.env.example` is already correct.

**Four `oxlint` warnings**, all setState-inside-effect in `AuthModal.tsx` and
friends. Not correctness bugs; worth a pass when that component is next open.

**`react-router-dom` is an unused dependency.** Remove it, or add the
`_redirects` file if routing is actually coming.
