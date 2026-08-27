-- ============================================================================
-- 01 · Reference tier — data owned by the game, identical for every player
--
-- Today these live as `const` arrays in the JS bundle, which means a balance
-- patch that moves one number is a code change and a redeploy. Moving them
-- here makes a patch an UPDATE, and `ref_data_version` is the single row the
-- client polls to know it should re-pull.
--
-- Policy for every table in this file: public read, no write policy at all.
-- Writes happen with the service_role key (which bypasses RLS) from a seed
-- script or the dashboard — never from the browser.
-- ============================================================================

set search_path = public, extensions;

-- ---------------------------------------------------------------------------
-- The poll target.
-- Singleton enforced by a boolean primary key that can only ever be true.
-- ---------------------------------------------------------------------------
create table public.ref_data_version (
  id            boolean primary key default true check (id),
  data_version  integer not null default 1,
  game_version  text,
  note          text,
  updated_at    timestamptz not null default now()
);

comment on table public.ref_data_version is
  'One row. Bump data_version after changing any ref_* table; the client re-pulls reference data only when this number moves.';

-- ---------------------------------------------------------------------------
-- Effect channels — the attribution axes the Upgrade Queue ranks against.
--
-- This is the `EffectChannel` union type in src/domain/store.ts, promoted to
-- rows so a research entry's channel can be validated by a foreign key instead
-- of by TypeScript that the database never sees.
-- ---------------------------------------------------------------------------
create table public.ref_effect_channels (
  id          text primary key,
  domain      text not null check (domain in ('coins', 'cells', 'damage', 'defense', 'utility')),
  label       text not null,
  sort_order  integer not null default 0
);

comment on table public.ref_effect_channels is
  'Mirrors the EffectChannel union in src/domain/store.ts. Adding a channel is a row, not a redeploy.';

-- ---------------------------------------------------------------------------
-- Lab catalog — the wiki-derived master list of researches.
--
-- Metadata only: name, category, ceiling, default channel. A player's current
-- level and price for a lab is user state and lives in
-- research_catalog_entries, not here.
-- ---------------------------------------------------------------------------
create table public.ref_labs (
  id                   text primary key,
  name                 text not null,
  category             text not null
                         check (category in ('main', 'attack', 'defense', 'utility',
                                             'perks', 'ultimate_weapons', 'modules')),
  max_level            integer not null check (max_level > 0),
  description          text not null default '',
  wiki_url             text,
  default_channel      text references public.ref_effect_channels(id),
  default_effect_kind  text check (default_effect_kind in ('multiplier', 'percent', 'flat', 'unlock')),
  default_reason       text,
  sort_order           integer not null default 0,
  updated_at           timestamptz not null default now()
);

create index ref_labs_category_idx on public.ref_labs (category, sort_order);

comment on table public.ref_labs is
  'MASTER_LAB_CATALOG from src/data/labCatalog.ts. Game metadata only — no per-player level or price.';

-- ---------------------------------------------------------------------------
-- Ultimate Weapon configs, with the three upgrade stats normalized out.
--
-- The bundle carries stat1/stat2/stat3 as three parallel object literals per
-- UW. Three rows keyed by stat_index says the same thing without three sets of
-- near-identical columns, and lets a patch add a fourth stat to one weapon.
--
-- `step` is signed on purpose: cooldown stats ramp downward (step -10), which
-- getStatLevels() already relies on.
-- ---------------------------------------------------------------------------
create table public.ref_uw_configs (
  id           text primary key,
  name         text not null,
  short_name   text not null,
  description  text not null default '',
  wiki_url     text,
  theme_color  text,
  sort_order   integer not null default 0,
  updated_at   timestamptz not null default now()
);

create table public.ref_uw_stats (
  uw_id        text not null references public.ref_uw_configs(id) on delete cascade,
  stat_index   smallint not null check (stat_index between 1 and 3),
  label        text not null,
  unit         text not null default '',
  default_val  double precision not null,
  step         double precision,
  min_val      double precision,
  max_val      double precision,
  levels       jsonb check (levels is null or jsonb_typeof(levels) = 'array'),
  primary key (uw_id, stat_index)
);

comment on column public.ref_uw_stats.step is
  'Signed. Negative for stats that improve downward (cooldowns), matching getStatLevels().';
comment on column public.ref_uw_stats.levels is
  'Explicit UWStatLevel[] for stats that are not a linear ramp. Null means derive from min/max/step.';

-- ---------------------------------------------------------------------------
-- Tournament leagues and the reward ladder.
--
-- Today this is a 200-line if/else chain in tournamentModel.ts. As rows it
-- becomes a lookup — and, more usefully, the overlap of two rank bands becomes
-- something the database refuses rather than something the first matching
-- branch silently wins.
-- ---------------------------------------------------------------------------
create table public.ref_tournament_leagues (
  id          text primary key,
  label       text not null,
  sort_order  integer not null
);

create table public.ref_tournament_rewards (
  league    text not null references public.ref_tournament_leagues(id) on delete cascade,
  rank_min  integer not null check (rank_min >= 1),
  rank_max  integer not null,
  gems      integer not null default 0 check (gems >= 0),
  stones    integer not null default 0 check (stones >= 0),
  keys      integer not null default 0 check (keys >= 0),
  primary key (league, rank_min),
  constraint ref_tournament_rewards_band_ordered check (rank_max >= rank_min),
  -- Two bands in one league may not cover the same rank. Without this, an edit
  -- that overlaps 13-15 and 15-22 pays out whichever row the planner reads
  -- first, and nothing anywhere errors.
  constraint ref_tournament_rewards_no_overlap
    exclude using gist (league with =, int4range(rank_min, rank_max, '[]') with &&)
);

comment on table public.ref_tournament_rewards is
  'Reward ladder, one row per (league, rank band). Replaces the if/else chain in src/domain/tournamentModel.ts.';

-- Lookup that returns zero rows for an unknown league instead of guessing.
-- The current TypeScript substitutes 'Champion' when the bracket is missing,
-- which displays gems and stones the player never earned.
create or replace function public.tournament_rewards(p_league text, p_rank integer)
returns table (gems integer, stones integer, keys integer)
language sql
stable
security invoker
set search_path = ''
as $$
  select r.gems, r.stones, r.keys
  from public.ref_tournament_rewards r
  where p_league is not null
    and p_rank is not null
    and r.league = p_league
    and p_rank between r.rank_min and r.rank_max;
$$;

comment on function public.tournament_rewards(text, integer) is
  'Returns no rows when the league or rank is unknown. Callers must render that as "unknown", never as a default league.';

-- ---------------------------------------------------------------------------
-- Cell model constants.
--
-- cum1 anchors, the per-tier ideal farming wave, and the lab boost cost table.
-- DOMAIN.md §10 flags cell-model drift across game patches as the thing most
-- likely to invalidate stored history; these three tables are what make
-- re-baselining an UPDATE.
-- ---------------------------------------------------------------------------
create table public.ref_cell_anchors (
  wave        integer primary key check (wave >= 0),
  cum_cells   double precision not null check (cum_cells >= 0)
);

comment on table public.ref_cell_anchors is
  'CUM1_ANCHORS from src/domain/cellModel.ts. cum1() interpolates between rows and extrapolates past the last one.';

create table public.ref_ideal_farming_waves (
  tier  integer primary key check (tier > 0),
  wave  integer not null check (wave > 0)
);

create table public.ref_boost_costs (
  boost      numeric(4,1) primary key check (boost >= 1.0),
  cell_cost  numeric not null check (cell_cost >= 0)
);

comment on table public.ref_boost_costs is
  'Lab boost tiers and their cell price. lab_slots.boost is a foreign key here, so an invalid boost is unrepresentable.';

-- ---------------------------------------------------------------------------
-- Module tiers — shared by modules and their sub-effects.
-- ---------------------------------------------------------------------------
create table public.ref_module_tiers (
  id          text primary key,
  sort_order  integer not null unique
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create trigger ref_data_version_set_updated_at
  before update on public.ref_data_version
  for each row execute function public.set_updated_at();

create trigger ref_labs_set_updated_at
  before update on public.ref_labs
  for each row execute function public.set_updated_at();

create trigger ref_uw_configs_set_updated_at
  before update on public.ref_uw_configs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: readable by everyone, writable by no one holding an anon or user key.
--
-- RLS with zero policies for INSERT/UPDATE/DELETE already denies those. The
-- explicit REVOKE is belt and braces against Supabase's default grants, and
-- states the intent where someone reading the schema will see it.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'ref_data_version', 'ref_effect_channels', 'ref_labs',
    'ref_uw_configs', 'ref_uw_stats',
    'ref_tournament_leagues', 'ref_tournament_rewards',
    'ref_cell_anchors', 'ref_ideal_farming_waves', 'ref_boost_costs',
    'ref_module_tiers'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      t || '_public_read', t
    );
  end loop;
end;
$$;
