/**
 * Regenerates supabase/seed.sql from the reference constants that still live
 * in the bundle. Run it after a game patch changes any of them:
 *
 *   npx esbuild scripts/generate-seed.ts --bundle --format=esm --platform=node \
 *     --packages=external --outfile=node_modules/.cache/generate-seed.mjs \
 *     && node node_modules/.cache/generate-seed.mjs > supabase/seed.sql
 *
 * The seed is idempotent: every statement is an upsert, so re-running it after
 * a patch corrects rows in place rather than failing on the primary key.
 */
import { MASTER_LAB_CATALOG } from '../src/data/labCatalog';
import { UW_CONFIGS } from '../src/domain/store';
import { cum1, IDEAL_FARMING_WAVES, BOOST_COSTS } from '../src/domain/cellModel';
import { getTournamentRewards } from '../src/domain/tournamentModel';

const lit = (v: string | null | undefined): string =>
  v === null || v === undefined ? 'null' : `'${v.replace(/'/g, "''")}'`;
const num = (v: number | null | undefined): string =>
  v === null || v === undefined || Number.isNaN(v) ? 'null' : String(v);

const out: string[] = [];
const say = (s = '') => out.push(s);

say('-- ============================================================================');
say('-- Reference data seed — GENERATED FILE, DO NOT EDIT BY HAND.');
say('-- Source: scripts/generate-seed.ts. Regenerate after a game patch.');
say('-- Every statement is an upsert, so re-running corrects rows in place.');
say('-- ============================================================================');
say();

// --- effect channels ---------------------------------------------------------
// The EffectChannel union in src/domain/store.ts, as rows.
const CHANNELS: [string, string][] = [
  ['coins.goldenTower', 'Golden Tower'],
  ['coins.blackHole', 'Black Hole'],
  ['coins.deathWave', 'Death Wave'],
  ['coins.spotlight', 'Spotlight'],
  ['coins.orbs', 'Orbs'],
  ['coins.coinUpgrade', 'Coin Upgrade'],
  ['coins.coinBonuses', 'Coin Bonuses'],
  ['coins.global', 'Global coin multiplier'],
  ['cells.deathWave', 'Death Wave cells'],
  ['cells.global', 'Global cell multiplier'],
  ['damage.projectiles', 'Projectiles'],
  ['damage.smartMissile', 'Smart Missiles'],
  ['damage.chainLightning', 'Chain Lightning'],
  ['damage.deathWave', 'Death Wave damage'],
  ['defense.wall', 'Wall'],
  ['defense.health', 'Health'],
  ['utility.waveSkip', 'Wave skip'],
  ['utility.shards', 'Shards'],
  ['utility.perks', 'Perks'],
  ['utility.ranged', 'Ranged enemies'],
  ['utility.labSpeed', 'Lab speed'],
];
say('-- ref_effect_channels ---------------------------------------------------------');
CHANNELS.forEach(([id, label], i) => {
  say(
    `insert into public.ref_effect_channels (id, domain, label, sort_order) values (${lit(id)}, ${lit(
      id.split('.')[0],
    )}, ${lit(label)}, ${i}) on conflict (id) do update set domain = excluded.domain, label = excluded.label, sort_order = excluded.sort_order;`,
  );
});
say();

// --- module tiers ------------------------------------------------------------
say('-- ref_module_tiers ------------------------------------------------------------');
['Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Ancestral'].forEach((t, i) => {
  say(
    `insert into public.ref_module_tiers (id, sort_order) values (${lit(t)}, ${i}) on conflict (id) do update set sort_order = excluded.sort_order;`,
  );
});
say();

// --- labs --------------------------------------------------------------------
say(`-- ref_labs (${MASTER_LAB_CATALOG.length} rows) ------------------------------------------------`);
MASTER_LAB_CATALOG.forEach((lab, i) => {
  say(
    `insert into public.ref_labs (id, name, category, max_level, description, wiki_url, default_channel, default_effect_kind, default_reason, sort_order) values (` +
      [
        lit(lab.id),
        lit(lab.name),
        lit(lab.category),
        num(lab.maxLevel),
        lit(lab.description),
        lit(lab.wikiUrl),
        lit(lab.defaultChannel),
        lit(lab.defaultEffectKind),
        lit(lab.defaultReason),
        String(i),
      ].join(', ') +
      `) on conflict (id) do update set name = excluded.name, category = excluded.category, max_level = excluded.max_level, description = excluded.description, wiki_url = excluded.wiki_url, default_channel = excluded.default_channel, default_effect_kind = excluded.default_effect_kind, default_reason = excluded.default_reason, sort_order = excluded.sort_order;`,
  );
});
say();

// --- ultimate weapons --------------------------------------------------------
say('-- ref_uw_configs / ref_uw_stats -------------------------------------------------');
Object.values(UW_CONFIGS).forEach((uw, i) => {
  say(
    `insert into public.ref_uw_configs (id, name, short_name, description, wiki_url, theme_color, sort_order) values (` +
      [lit(uw.id), lit(uw.name), lit(uw.shortName), lit(uw.description), lit(uw.wikiUrl), lit(uw.themeColor), String(i)].join(', ') +
      `) on conflict (id) do update set name = excluded.name, short_name = excluded.short_name, description = excluded.description, wiki_url = excluded.wiki_url, theme_color = excluded.theme_color, sort_order = excluded.sort_order;`,
  );
  ([uw.stat1, uw.stat2, uw.stat3] as const).forEach((s, si) => {
    say(
      `insert into public.ref_uw_stats (uw_id, stat_index, label, unit, default_val, step, min_val, max_val, levels) values (` +
        [
          lit(uw.id),
          String(si + 1),
          lit(s.label),
          lit(s.unit),
          num(s.defaultVal),
          num(s.step),
          num(s.min),
          num(s.max),
          s.levels ? `${lit(JSON.stringify(s.levels))}::jsonb` : 'null',
        ].join(', ') +
        `) on conflict (uw_id, stat_index) do update set label = excluded.label, unit = excluded.unit, default_val = excluded.default_val, step = excluded.step, min_val = excluded.min_val, max_val = excluded.max_val, levels = excluded.levels;`,
    );
  });
});
say();

// --- tournament ladder -------------------------------------------------------
// Derived by probing getTournamentRewards() across ranks 1..30 and coalescing
// runs of identical payouts into bands. This keeps the SQL and the TypeScript
// provably in agreement instead of transcribed by hand.
const LEAGUES = ['copper', 'silver', 'gold', 'platinum', 'champion', 'legend', 'mythic'];
say('-- ref_tournament_leagues / ref_tournament_rewards --------------------------------');
LEAGUES.forEach((league, i) => {
  const label = league.charAt(0).toUpperCase() + league.slice(1);
  say(
    `insert into public.ref_tournament_leagues (id, label, sort_order) values (${lit(league)}, ${lit(label)}, ${i}) on conflict (id) do update set label = excluded.label, sort_order = excluded.sort_order;`,
  );
});
say();
let bandCount = 0;
LEAGUES.forEach((league) => {
  let start = 1;
  let prev = getTournamentRewards(league, 1);
  for (let r = 2; r <= 31; r++) {
    const cur = r <= 30 ? getTournamentRewards(league, r) : { gems: -1, stones: -1, keys: -1 };
    if (cur.gems !== prev.gems || cur.stones !== prev.stones || cur.keys !== prev.keys) {
      say(
        `insert into public.ref_tournament_rewards (league, rank_min, rank_max, gems, stones, keys) values (${lit(league)}, ${start}, ${r - 1}, ${prev.gems}, ${prev.stones}, ${prev.keys}) on conflict (league, rank_min) do update set rank_max = excluded.rank_max, gems = excluded.gems, stones = excluded.stones, keys = excluded.keys;`,
      );
      bandCount++;
      start = r;
      prev = cur;
    }
  }
  say();
});

// --- cell model --------------------------------------------------------------
// CUM1_ANCHORS is module-private, so the breakpoints are probed through the
// exported cum1(). It is piecewise linear between exactly these waves.
const ANCHOR_WAVES = [0, 500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000];
say('-- ref_cell_anchors ---------------------------------------------------------------');
let last = -1;
for (const w of ANCHOR_WAVES) {
  const c = cum1(w);
  if (c < last) throw new Error(`cum1 not monotonic at wave ${w}`);
  last = c;
  say(
    `insert into public.ref_cell_anchors (wave, cum_cells) values (${w}, ${num(c)}) on conflict (wave) do update set cum_cells = excluded.cum_cells;`,
  );
}
say();

say('-- ref_ideal_farming_waves --------------------------------------------------------');
Object.entries(IDEAL_FARMING_WAVES).forEach(([tier, wave]) => {
  say(
    `insert into public.ref_ideal_farming_waves (tier, wave) values (${tier}, ${wave}) on conflict (tier) do update set wave = excluded.wave;`,
  );
});
say();

say('-- ref_boost_costs ----------------------------------------------------------------');
Object.entries(BOOST_COSTS).forEach(([boost, cost]) => {
  say(
    `insert into public.ref_boost_costs (boost, cell_cost) values (${Number(boost).toFixed(1)}, ${cost}) on conflict (boost) do update set cell_cost = excluded.cell_cost;`,
  );
});
say();

say('-- ref_data_version ---------------------------------------------------------------');
say(
  `insert into public.ref_data_version (id, data_version, note) values (true, 1, ${lit(
    `seeded from bundle constants: ${MASTER_LAB_CATALOG.length} labs, ${Object.keys(UW_CONFIGS).length} UWs, ${bandCount} reward bands`,
  )}) on conflict (id) do update set data_version = public.ref_data_version.data_version + 1, note = excluded.note;`,
);
say();

process.stdout.write(out.join('\n') + '\n');
