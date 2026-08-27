# Tower Planner — Domain Reference

Everything in this file is game math and seed data. It is the part a coding agent
cannot invent. Treat it as the source of truth for `src/domain/`.

Companion: `SPEC.md` (what to build). Player context lives in the Claude project
docs `the-tower-reference.md` and `claude/cell-calculator-reference.md`.

---

## 1. Data availability — what the game actually exports

**Exportable (one mechanism only):** the in-game **Battle Report** screen has a
copy button that puts the full run summary on the clipboard as
tab-separated `Key<TAB>Value` lines, grouped by section headers. ~89 fields.
This is the entire official export surface. There is no save-file export, no API,
no cloud endpoint.

**Not exportable — manual entry required:**
lab levels, workshop upgrade levels, UW stats, module stats and sub-effects,
card levels, bot medals, current coin/cell/stone/gem balances, research catalog
costs. All of it is screen-only. The Build State module (SPEC §4.5) exists
because of this.

Consequence for the design: **runs are imported, build is typed.** Do not
promise the user any automatic build sync.

### 1.1 Two export formats — the fixtures are the OLD one

The game's Battle Report has been restructured since the `TowerOfTracking`
fixtures were captured. **Both must parse**, and the current one is authoritative.

| | Legacy (v1, ~2025) | **Current (v2, verified 2026-08-22)** |
|---|---|---|
| Sections | 6 | **16** |
| Labels | `Coins earned`, `Damage dealt`, `Thorn damage` | `Coins Earned`, `Damage Dealt`, `Thorns` |
| Attribution keys | globally unique (`Black Hole Damage`) | **section-scoped, ambiguous alone** (`Black Hole`) |
| Cells per hour | derived | **exported directly** |
| Tournament marker | `Tier 8+` | **none — see §1.4** |

v2 section list, in order: `Battle Report`, `Records`, `Damage`, `Damage Taken`,
`Bonus Health Gained`, `Health Regenerated`, `Damage Blocked`, `Utility`,
`Counts`, `Enemies Hit By`, `Killed With Effect Active`, `Total Enemies`,
`Coins`, `Cash`, `Currencies`, `Enemies Destroyed By`.

### 1.2 Parsing rules

1. Split on newlines. A line with **no tab** is a section header. Track the
   current section as you walk the file — it is part of the key, not decoration.
2. Data lines are `label<TAB>value`. v1 sometimes used runs of spaces instead of
   a tab; split on `/\t+| {2,}/` to cover both.
3. **Key on `section::label`, never on label alone.** This is not a style
   preference — v2 labels collide across sections, and a flat map silently
   overwrites. Real collisions in a single v2 report:

   | Label | Appears in | Values |
   |---|---|---|
   | `Black Hole` | Damage / Enemies Hit By / Killed With Effect Active / Coins / Enemies Destroyed By | 3.36s / 11.19K / 8736 / 1.37B / 135 |
   | `Orbs` | Damage / Enemies Hit By / Killed With Effect Active / Coins / Enemies Destroyed By | 128.45s / 48.74K / 50101 / 0 / 48706 |
   | `Death Wave` | Damage / Enemies Hit By / Killed With Effect Active / Coins | 6.03q / 10.30K / 10.30K / 305.70M |
   | `Golden Tower` | Killed With Effect Active / Coins / Cash | 19006 / 1.57B / $254.55M |
   | `Recovery Packages` | Health Regenerated / Utility | 68.22T / 314 |
   | `Thorns` | Damage / Enemies Hit By / Enemies Destroyed By | 31.39s / 6.61K / 4139 |

   A flat parser reading this report would record Black Hole damage as `135`.
   Nothing would error; every downstream number would just be wrong.
4. Some values carry a bracketed share: `Golden Tower<TAB>19006 [19.5%]`. Parse
   as `{value, sharePct}` — do not regex the percent away, it is the useful half.
5. Labels may contain `/` and spaces: `Coins / Kill`, `Coins / Wave`,
   `Highest Coins / Minute`. Do not split labels on punctuation.
6. Values carry `$` (cash), `x` (multiplier), or a scale suffix. Strip the
   sigil, record the kind.
7. **Locale.** The game formats with the device locale; an Indonesian or European
   device emits `43,91T` and `1.107.674`. If a token has both `.` and `,`, the
   last is the decimal separator. If it has one, followed by exactly three digits
   at end of token, it is a thousands separator. Store the detected locale — a
   mixed history that misparses is wrong by 1000x and looks plausible.
8. Durations (`2h 4m 50s`) → seconds. `Real Time` is wall clock and is the
   denominator for every rate. `Game Time` is accelerated in-game time — never
   use it for rates.
9. Keep unknown `section::label` pairs in `raw`. The v1→v2 shift is proof this
   will happen again; a parser that drops what it does not recognise loses data
   permanently.

### 1.3 Scale suffix table

All steps are 1000x. Case-sensitive (`q` = 1e15, `Q` = 1e18).

| K | M | B | T | q | Q | s | S | O | N | D | aa | ab | ac |
|---|---|---|---|---|---|---|---|---|---|---|----|----|----|
| 1e3 | 1e6 | 1e9 | 1e12 | 1e15 | 1e18 | 1e21 | 1e24 | 1e27 | 1e30 | 1e33 | 1e36 | 1e39 | 1e42 |

Continues `ad`..`aj` at 1e45..1e63. Store as JS `number`.

### 1.4 Telling a tournament run from a farm run

**The v2 Battle Report contains no tournament marker.** The v1 `Tier 8+` suffix
is gone. Verified: the 2026-08-22 tournament run exports as plain `Tier 5`,
identical in shape to a farm run. Any design that classifies from the report
alone is guessing.

**Primary method — join against Tournament History.** The in-game Tournament
History screen lists, per tournament: league, date, max wave, final rank. Match
on `(date, wave)`:

```
Battle Report:       Battle Date Aug 22, 2026 · Tier 5 · Wave 1365
Tournament History:  Gold League · 8/22/2026 · Max Wave 1365 · rank 4
```

Exact match on both fields. This is a strong join key — a farm run finishing at
precisely the tournament's max wave on the same date is possible but vanishingly
rare, and the app can surface an ambiguity prompt rather than guess when two
candidates match.

This inverts an earlier assumption: bracket and rank are **not** per-run manual
entry. The player enters Tournament History rows once (a handful per month, and
the screen is a scrollable list), and matching runs get tagged automatically with
league and rank.

**Fallback — explicit toggle at import**, defaulting to farm. Never silent.

**Heuristics may suggest, never decide.** Useful signals, all soft:

- Wave far below the tier's established farm depth (T5 tournament w1365 against
  a T5 farm benchmark of w3587).
- Short `Real Time` — tournaments run a fixed short window (2h 5m here) against
  4.7–7h farm runs.
- Tournament tier is unrelated to farm tier. This player farms T9 and the
  tournament ran at T5, which is a further reason tournament runs must never
  enter tier aggregates: they would fabricate a T5 data point.

### 1.5 Coin attribution is NOT a partition

The v2 `Coins` section is richer than v1 — `Coins / Kill`, `Other Coin Bonuses`,
`Critical Coin`, `Golden Tower`, `Golden Combo`, `Death Wave`, `Spotlight`,
`Black Hole`, `Orbs`, `Golden Bot`, `Wave Skip`, `Coins / Wave`, `Coins Fetched`,
`Bounty Coins` — but the entries **overlap and do not sum to `Coins Earned`**.

Measured on the 2026-08-22 report: `Coins Earned` = 2.24B, while `Golden Tower`
alone = 1.57B (70%), `Black Hole` = 1.37B (61%), `Other Coin Bonuses` = 2.19B
(98%), `Coins / Kill` = 1.52B (68%). The listed channels sum to several times the
total, because a coin earned from a kill during Golden Tower is counted under
both.

**Consequence for the impact model (§6).** `channelDelta × channelShare` still
holds *if* a channel's figure means "coins that passed through this multiplier" —
raising the BH multiplier 5.26% raises that 1.37B by 5.26%, i.e. +3.2% of total.
It does **not** hold if the figure means "coins earned while BH was active."
These differ, and the export does not say which.

**This must be validated empirically before the Upgrade Queue is trusted.**
BH Coin Bonus Lv.18 (×9.50 → ×10.00, 13.13B) is already the top candidate and
sits one level from its cap — buy it, run the same tier and depth, and compare
predicted against actual. Until then, label Upgrade Queue impact figures as
unvalidated. Do not ship a confident ranking on an unverified attribution
semantic.

### 1.6 New in v2, worth using

- **`Cells Per Hour` is exported directly.** No derivation, no dependence on
  `Real Time` parsing being right. Cross-check the two as a parser self-test.
- **`Killed With Effect Active`** gives buff uptime as a share of kills — GT
  19.5%, Spotlight 10.4%, BH 9.0%, Orbs 51.4%, Golden Bot 4.8%. This is a
  direct measure of what fraction of output each buff touches, and it is a
  second, independent way to sanity-check the coin-channel shares in §1.5.
- **`Health Regenerated` and `Damage Blocked`** break out Lifesteal, Tower Regen,
  **Wall Regen**, Recovery Packages, Defense %, Defense Absolute. The Wall Regen
  Lv.7 → 10+ decision has been argued entirely from theory; this section
  measures it.

## 2. Cell model (validated to −0.5% on this account)

For tier `T` at absolute wave `w`:

```ts
const s = (T: number) => Math.pow(0.9, T - 1);            // wave-axis compression
const a = (T: number) => T <= 13 ? (1 + T) / 2 : (7 + T) / 2;  // avg cells per drop
const cells = (T: number, w: number) => cum1(w / s(T)) * a(T) * s(T);
```

`f(T) = a(T) * s(T)` — the per-checkpoint multiplier:

| T5 | T6 | T7 | T8 | T9 | T10 | T11 | T12 | T13 |
|----|----|----|----|----|-----|-----|-----|-----|
| 1.968 | 2.067 | 2.126 | **2.1523** | **2.1523** | 2.131 | 2.092 | 2.040 | 1.977 |

> **Do not render `f(T)` as a "best tier" chart.** It peaks tied at T8/T9 and a
> naive read says "T8 = T9", which is wrong — f is per *checkpoint*, and T9's
> checkpoints arrive 10% earlier in wave count. Always compare at equal absolute
> wave. This misreading is the single most likely bug in this app.

### `cum1(w)` — T1 cumulative cell curve

Interpolate linearly between anchor points; extrapolate the last segment's slope
beyond 17,000.

| w | 500 | 1000 | 1500 | 2000 | 3000 | 4000 | 5000 | 6000 | 7000 | 8000 |
|---|-----|------|------|------|------|------|------|------|------|------|
| cells | 5 | 25 | 70 | 150 | 400 | 760 | 1250 | 1890 | 2700 | 3710 |

| w | 9000 | 10000 | 11000 | 12000 | 13000 | 14000 | 15000 | 16000 | 17000 |
|---|------|-------|-------|-------|-------|-------|-------|-------|-------|
| cells | 4750 | 5840 | 7000 | 8250 | 9610 | 11100 | 12740 | 14550 | 16550 |

### Ideal farming wave per tier (sheet's 100% checkpoint)

| T5 | T6 | T7 | T8 | T9 | T10 | T11 | T12 | T13 |
|----|----|----|----|----|-----|-----|-----|-----|
| 5249 | 4724 | 4252 | 3826 | **3444** | **3099** | 2789 | 2510 | 2259 |

### Model accuracy by tier (measured on this account)

| Run | model | actual | Δ |
|-----|-------|--------|---|
| T9 w3242 | 6966 | ~7003 | −0.5% |
| T8 w3385 | 5979 | ~5563 | +7.5% |
| T7 w3524 | 5104 | ~4220 | +21.0% |
| T5 w3587 | 3049 | ~2326 | +31.1% |

Error runs against low tiers, so the model is a **conservative floor** for
high-tier estimates. Show the Δ band in the UI; do not present model output as exact.

**Staleness flag:** the source sheet is from March 2025. Every screen that uses
this model should carry a "validated <date>, re-check after game updates" note,
and the app should surface observed-vs-model Δ on each imported run so drift
is visible.

---

## 3. Tier climb rule

Each tier up buys a **~10% discount on the wave needed per cell**.
Observed wave decay is only **~4% per tier**.
→ **Climb until wave decay per tier exceeds ~10%.** That crossover, not the raw
wave number, is the metric the Tier Lab screen must foreground.

Break-even depths from the current T9 @ w3242 baseline:

| Target | Wave needed to match | Depth budget |
|--------|---------------------|--------------|
| T9 vs T8 @3385 | 3046 | +196 waves of margin today |
| T10 vs T9 @3242 | 2930 | −9.6% |
| T11 vs T9 @3242 | 2658 | −18% |

### Current benchmark baseline (8/17–8/19/2026)

| Tier | Wave | Coins/hr baseline | Cells/hr | Run len | n |
|------|------|-------------------|----------|---------|---|
| T9 | 3242 | 34.5B | ~1490 | 4.7h | 1 |
| T8 | 3385 | 31.3B | ~1159 | 4.8h | 1 |
| T7 | 3524/3745/3230 | 29.5B | ~844 | ~5.0h | 3 |
| T5 | 3587 | 22.0B | ~456 | 5.1h | 1 |

**Dissonance correction — must be modelled, not ignored.** Dissonance is a
rotating per-tier coin multiplier outside player control. The T7 sample carried
**×1.44**; raw T7 coins/hr was 42.45B, baseline 29.5B. Every run record needs a
`dissonanceMultiplier` field (default 1.0) and every coin comparison must divide
it out. A tier ranking that skips this will wrongly crown whichever tier
currently holds dissonance.

**Tournament runs are excluded from every figure in this section.** A `Tier 8+`
export is a tournament run; its coins and cells still count as income, but its
rates and wave never enter a tier aggregate. See SPEC §4.6.

Excluded outlier: the 8/17 T7 run ending at wave 3 (200.16K coins, 0 cells) is a
crash/restart. The importer should flag runs with `wave < 50` as suspect and let
the user exclude them from rate aggregates.

---

## 4. Lab boost cell costs

Per-lab cost of a speed boost:

| Boost | 1 hr | 8 hrs | 24 hrs | All 5 labs / 24h |
|-------|------|-------|--------|------------------|
| 1.5× | 15 | 120 | 360 | 1,800 |
| 2× | 100 | 800 | 2,400 | **12,000** |
| 3× | 840 | 6,720 | 20,160 | 100,800 |
| 4× | 3,360 | 26,880 | 80,640 | 403,200 |
| 5× | 11,900 | 95,200 | 285,600 | 1,428,000 |
| 6× | 59,400 | 480,000 | 1,440,000 | 7,200,000 |

Mixed combos, 24h: `2/2/2/2/1.5` = 9,960 · `2/2/2/1.5/1.5` = 7,920 ·
`2/2/1.5/1.5/1.5` = 5,880 · `2/1.5/1.5/1.5/1.5` = 3,840 · `3/3/2/2/2` = 47,520.

Budget at T9: ~1,490 cells/hr × 24h ≈ **35,760 cells/day** at full uptime.
Current queue (four 2× + one 1.5×) burns **9,960/day ≈ 28% of income**.
All-five 2× = 12,000/day ≈ 34%. Sustainable.
Anything at 3× = 100,800/day ≈ 2.8× total daily income. Not affordable — the
simulator should hard-block it with that number, not a generic warning.

---

## 5. Research catalog seed (8/19/2026)

Times are **pre-boost**. Effective time = `baseTime / (labSpeed × boost)`.

| Research | Change | Coin cost | Base time |
|----------|--------|-----------|-----------|
| Garlic Thorns Lv.9 | 4.00% → 4.50% | 302.14K | 1d 8h |
| Reroll Shards Lv.3 | +2 → +3 | 12.85M | 11h 19m |
| Spotlight Coin Bonus Lv.2 | ×1.10 → ×1.20 | 19.74M | 12h 56m |
| Death Wave Health Lv.12 | 775% → 800% | 320.34M | 2d 11h |
| Improve Trade-off Perks Lv.6 | 5% → 6% | 1.15B | 1d 8h |
| Death Wave Coin Bonus Lv.14 | ×2.15 → ×2.20 | 1.40B | 1d 4h |
| Golden Tower Duration Lv.16 | +15.0s → +16.0s | 2.72B | 5d 15h |
| Waves Required Lv.12 | −11 → −12 | 2.97B | 1d 16h |
| Golden Tower Bonus Lv.18 | +2.55 → +2.70 | 4.86B | 7d 17h |
| Standard Perks Bonus Lv.14 | 13% → 14% | 10.27B | 2d 18h |
| Black Hole Coin Bonus Lv.18 | ×9.50 → ×10.00 (**cap**) | 13.13B | 4d 20h |
| Ban Perks Lv.4 | 3 → 4 | 13.83B | 5d 16h |
| Rare Drop Chance Lv.2 | +0.10% → +0.20% | 70.07B | 2d 22h |
| BH disable Ranged Enemies Lv.1 | unlock | 507.10B | 9d 8h |

In-flight (5/5 slots occupied): Labs Speed Lv.88 (2×), Auto Pick Ranking Lv.9
(1.5×), Wall Regen Lv.7 (2×), Death Wave Cells Bonus Lv.9 (2×), Wall Thorns
Lv.7 (2×).

This table is a **seed, not a constant.** It changes every time a level is
bought. Ship it as editable data in the Build State module, not as a hardcoded
`const`.

---

## 6. Effect model — how a research becomes a number

Each catalog entry declares how its effect propagates:

```ts
type EffectChannel =
  | 'coins.goldenTower' | 'coins.blackHole' | 'coins.deathWave'
  | 'coins.spotlight'   | 'coins.orbs'      | 'coins.coinUpgrade'
  | 'coins.coinBonuses' | 'coins.global'
  | 'cells.deathWave'   | 'cells.global'
  | 'damage.<source>'   | 'defense.wall'    | 'utility.waveSkip';

interface ResearchEffect {
  channel: EffectChannel;
  from: number;   // e.g. 9.50
  to: number;     // e.g. 10.00
  kind: 'multiplier' | 'percent' | 'flat' | 'unlock';
}
```

Marginal gain on a channel:

```
channelDelta = to / from - 1                       // multiplicative effects
channelShare = latestRun[channel] / latestRun.coinsEarned
totalImpact  = channelDelta * channelShare
```

**This is the design centrepiece.** The Battle Report's coin- and damage-source
attribution means impact is *measured from the player's own runs*, not guessed
from a wiki. Worked example with the current build:

- BH Coin Bonus ×9.50 → ×10.00 → `channelDelta` = +5.26%.
- Multiply by BH's observed share of `coinsEarned` in the latest T9 run.
- If BH is ~15% of coins, true impact is **+0.79% total coins**, not +5.26%.

Same machinery flags dead levers: if Chain Lightning is 23.74s of a 3.31O
`damageDealt` total, it is ~7e-6 of output — CL research is worthless and the
UI should say so in those terms.

`unlock` and `flat` effects (Ban Perks, Waves Required, Rare Drop) cannot be
derived from attribution. Give them a **manual `estimatedImpact` field the user
sets**, clearly badged as an estimate. Never fabricate a number for these.

### Scoring

The scarce resource is **lab slot-days**, not coins — 284B banked against a
13B top item, but only 5 slots and 1–9 day researches.

```
effectiveDays = baseTimeDays / (labSpeedMult * boostMult)
score         = totalImpact / effectiveDays      // impact per slot-day
boostCellCost = boostCostPerDay * effectiveDays
```

Gate, don't rank, on affordability: `coinCost <= coinBalance` → buyable now;
otherwise show `daysToAfford = (coinCost - balance) / coinsPerDay`.

Rank by `score`. Show `totalImpact`, `effectiveDays`, `coinCost`,
`boostCellCost`, and `daysToAfford` as columns so the ranking is auditable —
a single opaque score number will not be trusted.

---

## 7. Standing decisions the app must respect

| Decision | Status |
|----------|--------|
| Primary farm tier | **T9** — confirmed by run data + cell model. Pending T10 benchmarks |
| T8 | **Closed.** Loses 10% coins and 17–26% cells to T9. Do not resurface as a suggestion |
| T7 / T5 | Discontinued (dominated) |
| Push to T10+ | Benchmark it. Ceiling = first tier where wave decay exceeds ~10% |
| Chase dissonance tier | **No.** Exception: dissonance landing on T9/T10 is a window |
| Wall | Unlocked. Thorns Lv.7 → 13–15 and Regen Lv.7 → 10+ are open gaps; heat-up footgun is live |
| Stones | Save 606 toward 6th UW at 1,250 (~75% Spotlight). Skip stone pack |
| Lab boost budget | Four 2× + one 1.5× sustainable. 3× is not |
| Module effect bans | Unaffordable (46.1B core / 461B cannon+armor / 4.61T generator) |
| Reroll plan | Reroll Common/Rare-tagged subs only, lock Epics |

Open question that would invalidate the T10 recommendation: **can dissonance be
levelled or influenced?** Currently modelled as pure rotation. If it turns out to
be player-influenced, the tier ranking needs rework.

Also unverified, and worth a "needs verification" badge in Build State:
Golden Tower base bonus (logged ×14.6, an 8/17 correction says ×15.4, cap 20.75),
Wall Health level, and the Wall unlock cost (in-game says 500B, wikis say 500M).
