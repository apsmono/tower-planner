# Tower Planner — Build Spec

A single-player React + TS dashboard for planning upgrade paths in
**The Tower — Idle Tower Defense**. Local-only, no backend.

Read `DOMAIN.md` first — it holds the game math, the export format, and the
seed data. This file is what to build.

---

## 1. The problem this solves

Coins are not the constraint. The account holds ~284B against a 13B top-priced
research. The real constraints are:

1. **Lab slot-days** — 5 slots, researches take 1–9 days each.
2. **Cells** — they fuel lab *speed boosts*, so cell income compounds into
   everything else. Current burn is 28% of daily income.
3. **Knowing which upgrade actually matters** — most levers are worth a
   fraction of a percent, and a few are worth several percent.

The reference doc answers (3) by hand, once, and goes stale the moment a level
is bought. The app's job is to make that answer live and recomputed from the
player's own Battle Reports.

**Non-goal:** replacing [Tower of Tracking](https://jarekb84.github.io/TowerOfTracking),
which already does run-history analytics well. This app is a *planner* —
forward-looking decisions, not backward-looking charts. Borrow its parser
approach; do not rebuild its dashboards.

---

## 2. Stack

| Concern | Choice | Note |
|---------|--------|------|
| Build | Vite + React 19 + TS (strict) | matches existing workflow |
| Styling | Tailwind v4 | dark theme by default; the game is a dark-UI game |
| Charts | Recharts | only where a chart beats a table — see §5 |
| State | Zustand + `persist` middleware | localStorage, one store per module slice |
| Validation | Zod | parser output and JSON import both go through schemas |
| Tests | Vitest | the parser and the cell model are the only things that *must* be tested |
| Routing | TanStack Router or React Router | 5 routes, either is fine |

No backend, no auth, no Firebase. Keep the dependency list short enough that the
app still builds in a year.

---

## 3. Data model

```ts
interface Run {
  id: string;
  importedAt: string;            // ISO
  battleDate: string | null;     // from report, may be absent in old formats
  tier: number;
  tierSuffix: '+' | null;        // tournament runs export "8+"
  wave: number;
  realTimeSec: number;           // wall clock — denominator for all rates
  gameTimeSec: number;           // never use for rates
  killedBy: string;
  runType: 'farm' | 'tournament' | 'milestone';
  tournament: {                  // present only when runType === 'tournament'
    bracket: string;             // league/bracket name — manual, not in export
    rank: number | null;         // final placing — manual, not in export
  } | null;
  dissonanceMultiplier: number;  // default 1.0 — see DOMAIN §3
  excluded: boolean;             // crash runs, hand-played outliers
  notes: string;
  fields: Record<string, number>;   // all 89 parsed numeric fields
  raw: Record<string, string>;      // everything, including unrecognised keys
}

interface BuildState {
  resources: { coins: number; cells: number; gems: number; stones: number; shards: number };
  labs: LabSlot[];               // 5, each { research, level, boost, startedAt }
  labSpeedMultiplier: number;    // from Labs Speed research level
  researchCatalog: ResearchEntry[];  // editable, seeded from DOMAIN §5
  ultimateWeapons: UW[];
  modules: Module[];
  cards: CardState;
  verificationFlags: string[];   // things the reference doc marks "verify in-game"
}
```

Derived rates (never stored — always computed, so a dissonance correction or an
exclusion flips every number at once):

```
coinsPerHour = fields.coinsEarned / dissonanceMultiplier / (realTimeSec / 3600)
cellsPerHour = fields.cellsEarned / (realTimeSec / 3600)
```

---

## 4. Modules

### 4.1 Import

Paste target → live preview → commit. Requirements:

- Paste a Battle Report, see the parsed table **before** saving, with unmatched
  labels called out by name rather than silently dropped.
- Detect and show the number locale (`43,91T` vs `43.91T`). Let the user
  override it. Getting this wrong is a silent 1000× error — see DOMAIN §1.1.
- Auto-classify `runType` from tier suffix (`8+` → tournament) and let the user
  correct it.
- Prompt for `dissonanceMultiplier` on import, defaulting to 1.0, with the T7
  ×1.44 episode as inline explanation of why it is being asked.
- Flag `wave < 50` as a suspected crash and pre-tick `excluded`.
- Bulk paste: accept several reports in one blob, split on the `Battle Report`
  header line.

### 4.2 Tier Lab

The "should I climb?" screen. **Farm runs only** — tournament runs are excluded
from every per-tier rate and from wave decay (§4.6). Per tier, aggregated over
non-excluded runs:
coins/hr (dissonance-corrected), cells/hr, mean wave, run length, n.

The headline metric is **wave decay per tier vs the ~10% cell discount per
tier**. Render that crossover explicitly — a tier where decay < 10% is a climb,
a tier where decay > 10% is the ceiling. Show `n` next to every figure; most
tiers currently sit at n=1 and the UI must not imply more confidence than that.

Overlay the model break-even lines (T10 needs w2930, T11 needs w2658) on the
observed waves. Mark T8/T7/T5 as closed decisions rather than hiding them —
show *why* they are closed so the decision does not get re-litigated.

Do **not** ship an `f(T)` chart. See the warning in DOMAIN §2.

### 4.3 Upgrade Queue — the core screen

Ranked table of every candidate research. Columns, all visible, sortable:

| Research | Δ effect | Channel share | **Total impact** | Coin cost | Effective days | Boost cell cost | **Impact / slot-day** | Buyable? |
|---|---|---|---|---|---|---|---|---|

Scoring is in DOMAIN §6. Two rules for the UI:

1. **Show the arithmetic.** Impact is `channelDelta × channelShare`, and both
   inputs come from a named run. Let the user click through from the score to
   the run it was computed from. An unexplained ranking will not be trusted and
   will not be used.
2. **Badge estimates.** Unlocks and flat effects have no attribution path
   (DOMAIN §6). They take a user-set `estimatedImpact` and must be visually
   distinct from measured ones.

Also on this screen:

- **Slot scheduler** — 5 lanes, current occupancy, when each frees up, and what
  the ranking says to queue next in it. This is where slot-days become concrete.
- **Days-to-afford** for anything above the coin balance.
- **Dead-lever callout** — channels contributing under ~0.1% of their total,
  named. Chain Lightning is currently ~7e-6 of damage; the app should say so.

### 4.4 Cell Budget

Boost configuration (5 slots × boost tier) → cells/day burn, against cells/day
income. Show the ratio as the headline number, since 28% vs 34% vs 280% is the
whole decision.

**Income must be realized, not theoretical.** The reference doc's 35,760
cells/day is `1,490 cells/hr × 24h at full uptime` — a ceiling that assumes the
tower farms T9 around the clock. Real income is lower (the game is not always
running) and its composition is wider (tournament cells count, §4.6). Compute
income from actual logged runs over actual elapsed days, and plot the
theoretical ceiling as a reference line above it.

This matters because the burn ratio is the decision. At 100% uptime the current
queue is 28% of income; at 70% uptime the same queue is 40%. Still sustainable,
but that is a different sentence, and only the realized number can say which one
is true.

Hard-block 3×+ with the actual figure (100,800/day ≈ 2.8× total income), not a
generic warning. Include a cells-per-run projector: tier × wave → model cells,
with the accuracy band from DOMAIN §2 and the observed Δ from real runs plotted
against it, so model drift after a game patch becomes visible rather than
silently wrong.

### 4.5 Build State

Manual editor — UWs, modules and subs, labs, cards, resources, research catalog.
This is the source of truth the other modules read, and it exists only because
the game exports none of it (DOMAIN §1).

Two things that make it worth using rather than editing markdown:

- **Verification flags.** Items the reference doc marks unverified (GT base
  bonus ×14.6 vs ×15.4, Wall Health level, Wall unlock cost) carry a visible
  "unverified" badge that propagates a warning into any calculation depending
  on them.
- **Gap tracking.** Current level vs target level for things with a known
  target — Wall Thorns 7 → 13–15, Wall Regen 7 → 10+ — with the reason
  attached ("heat-up footgun is live below baseline").

### 4.6 Tournament History

A tournament run is **one record with two projections**, never two records.

**Classification is not automatic.** The current export carries no tournament
marker — see `DOMAIN.md` §1.4. Runs are matched against Tournament History rows
on `(date, wave)`, which also supplies league and rank; failing a match, the user
toggles at import, defaulting to farm.

**Projection A — economic contribution.** Only `coinsEarned`, `cellsEarned` and
`realTimeSec` are taken. These are real income: tournament cells fund lab boosts
exactly like farm cells do, so they belong in the Cell Budget totals (§4.4) and
in days-to-afford (§4.3).

**Projection B — tournament history.** Wave reached, bracket, rank, date. This
is the record that answers "am I climbing," tracked over brackets rather than
over tiers.

**Everything else is excluded from tier aggregates.** No tournament run
contributes to coins/hr-by-tier, cells/hr-by-tier, mean wave, or wave decay.
The economics are not comparable — a tournament run is ~1h50m ending near wave
871 where a farm run is ~7h ending near wave 5,800. One such run averaged into
T8 would drag its mean wave from 3,385 toward ~2,100 and reopen a tier decision
that is already correctly closed.

`bracket` and `rank` are **not in the export**, but they are not per-run manual
entry either. The player transcribes the Tournament History screen once — a
handful of rows per month — and matching runs inherit league and rank from it.
Model it as its own small table (`league, date, maxWave, rank`) that runs join
against, not as fields typed on each import.

The history is also worth reading on its own. This player's recent rows —
Gold rank 4, Platinum rank 26, Platinum rank 24, Gold rank 2, Platinum rank 29 —
show promotion/demotion cycling at the Gold/Platinum boundary: winning Gold,
promoting, placing near the bottom of Platinum, dropping back. That pattern is
invisible in any per-run view and is exactly what the tournament screen is for.

The screen worth building here plots wave-by-bracket over time with build
changes marked on the same axis, so a jump can be attributed to what caused it.
Tournament climbing is the stated goal; farming economics is how it gets funded.

---

## 5. Design notes

Dark theme, dense tables, few charts. This is a decision tool used a few minutes
at a time, not a dashboard to admire. A chart earns its place only where the
*shape* carries the argument:

- wave decay vs the 10% threshold line (Tier Lab) — the crossover is the point;
- cells-per-run curves by tier with break-even markers (Cell Budget);
- cell income vs burn over time, once there is enough history.

Everything else is a sortable table. Large numbers use the game's own suffix
notation (DOMAIN §1.2) so figures can be eyeballed against the game screen
without conversion.

Every derived number should be traceable to its inputs in one click. The app is
arguing for expensive, slow, irreversible decisions; an opaque recommendation is
worse than no recommendation.

---

## 6. Build order

1. **Parser + cell model, with tests.** Both are pure functions, both are the
   things everything else is wrong without. Use the fixtures in
   `jarekb84/TowerOfTracking/sampleData` — they cover the tab format, the
   legacy space-separated format, and the European-locale format.
2. **Import + Run store.** Get real history in.
3. **Tier Lab.** First screen that answers a question.
4. **Build State.** Needed before the queue can score anything.
5. **Upgrade Queue.** The payoff.
6. **Cell Budget.**
7. **JSON export/import** of the whole store — localStorage is one cleared
   cache away from gone, and this history is hand-entered.
8. **Experiments + decision log** — last, and only once the rest is in use.
   An experiment is a declared benchmark (`benchmark T10, n=3`) that tracks
   progress, computes tier-over-tier wave decay on completion, and returns a
   verdict against the ~10% rule: climb / ceiling found / inconclusive because
   variance is too high to call. The verdict is filed as a dated decision with
   its evidence and sample size attached.

   The justification is §7 of `DOMAIN.md`: the T8 decision had to be defended
   in prose against being reopened, because a naive read of the cell sheet says
   T8 ≈ T9. Storing a verdict together with the evidence that produced it is
   what stops that re-litigation. It is genuinely useful and genuinely not
   urgent — hence last.

---

## 7. Acceptance checks

- All four `sampleData` fixtures parse with zero unmatched *known* fields, and
  the European-locale fixture yields the same magnitudes as the US one.
- `cells(9, 3242)` → 6966 ±1%.
- `cells(9, 3046)` ≈ `cells(8, 3385)` — the documented break-even.
- A T7 run with `dissonanceMultiplier` 1.44 reports 29.5B/hr, not 42.45B/hr.
- BH Coin Bonus impact resolves to `+5.26% × BH coin share`, and the UI shows
  both factors.
- Clearing localStorage and re-importing a JSON export restores byte-identical
  state.

---

## 8. Decisions

Settled 2026-08-27 with the player.

**Cross-currency ranking — build both, user switches.**

- *Split mode* (default): two ranked tables, coin researches and cell
  researches, each ranked by impact per slot-day within its own currency. No
  cross-comparison, no invented precision.
- *Unified mode*: one table, cells converted to coin-equivalent. Default
  exchange rate is the player's own income ratio — at T9, ~35,760 cells/day
  against ~0.83T coins/day, so ~23M coins per cell — with a manual override.
  Label it for what it is: a production ratio, not a marginal-value ratio. It
  says what you give up to get one more cell, which is close enough to be
  useful and wrong enough to need the slider.

Use realized income (§4.4) for the default rate, not the theoretical ceiling.

**Tournament runs — split into two projections.** See §4.6.

**Experiment loop — build it, build it last.** See §6 item 8.

## 9. Uptime and elapsed time

Settled 2026-08-27: **use both.** They are not alternatives — their ratio is the
number the Cell Budget module actually wants.

```
playTimeSec   = Σ run.realTimeSec              over the window
elapsedSec    = last(run.battleDate) - first(run.battleDate)
uptime        = playTimeSec / elapsedSec
cellsPerDay   = Σ run.cellsEarned / (elapsedSec / 86400)     // realized income
```

`cellsPerDay` computed this way is realized income directly — uptime is already
baked in, so it needs no correction. Surface `uptime` anyway, because it explains
the gap between realized income and the theoretical ceiling (§4.4), and because a
falling uptime is itself a signal worth seeing.

**The failure mode is `battleDate`.** Older client exports omit it, and batch
importing a week of runs in one sitting collapses `elapsedSec` toward zero if the
import timestamp is used as a substitute — which inflates `cellsPerDay` by however
many days were collapsed. Rules:

1. Prefer `battleDate` from the export.
2. If absent, require a user-entered run date at import — do not silently
   substitute `importedAt`.
3. If a window contains any run with no reliable date, mark realized income
   **unavailable** for that window and fall back to reporting play-time totals
   only. A wrong income figure is worse than a missing one; the whole point of
   §4.4 is that the burn ratio is the decision.

## 10. Deferred

**Cell-model drift across game patches.** When a patch moves the cell curve,
history either gets re-baselined or partitioned by patch version. Deferred by the
player 2026-08-27 — patch it when it bites. What that costs later: runs carry no
`gameVersion` field today, so a retroactive partition would need dates mapped to
patch releases by hand. Adding a nullable `gameVersion: string | null` to `Run`
now is close to free and makes the eventual fix mechanical. Recommended, not
required.
