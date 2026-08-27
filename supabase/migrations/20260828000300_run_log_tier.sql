-- ============================================================================
-- 03 · Run log tier — append-mostly, immutable once parsed, unbounded
--
-- Two rules shape this file:
--
--   1. A sync must never rewrite history. Rows go out through an outbox and
--      come back by an updated_at cursor; deletes are tombstones, not DELETEs,
--      so a device that was offline learns about them.
--   2. A parser fix must be retroactive. `raw_text` holds the original pasted
--      Battle Report and `parser_version` records which parser produced
--      `fields`, so a re-parse is a background job instead of "find those
--      reports again in a game screen that only keeps recent history".
--
-- Both are cheap now and expensive after rows exist on a server.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- tournament_results — a separate list the player enters once.
--
-- DOMAIN.md §1.4 describes this as its own record that runs join against on
-- (date, wave). The current store instead embeds { bracket, rank } inside each
-- Run and substitutes 'Champion' where the bracket is missing, which displays
-- gems and stones that were never earned.
--
-- league is NULLABLE on purpose. That is the entire point of the table: an
-- unknown league must be representable as unknown.
-- ---------------------------------------------------------------------------
create table public.tournament_results (
  id          uuid primary key default public.uuid_generate_v7(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  league      text references public.ref_tournament_leagues(id),
  event_date  date not null,
  max_wave    integer check (max_wave >= 0),
  rank        integer check (rank between 1 and 30),
  notes       text,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index tournament_results_user_date_idx
  on public.tournament_results (user_id, event_date desc)
  where deleted_at is null;

create index tournament_results_user_updated_at_idx
  on public.tournament_results (user_id, updated_at);

comment on column public.tournament_results.league is
  'Null means the bracket is unknown. Never substitute a default league — render it as unknown and prompt.';
comment on column public.tournament_results.rank is
  'Bounded 1..30 to match the reward ladder. Outside that range there is no payout to look up.';

-- ---------------------------------------------------------------------------
-- runs
--
-- Scalars the Tier Lab aggregates on are real columns; the ~89-field parsed
-- blob and its raw string counterpart stay jsonb. Storage is a non-issue —
-- 5.3 KB per run is about 8 MB for a year at four a day, which Postgres TOASTs
-- without comment.
--
-- fields values are stored as JSON numbers, i.e. double precision. That is
-- what JS `number` already gives you, and the alternative (numeric inside
-- jsonb) buys precision the parser never had.
-- ---------------------------------------------------------------------------
create table public.runs (
  id                     uuid primary key default public.uuid_generate_v7(),
  user_id                uuid not null references auth.users(id) on delete cascade,

  run_type               text not null default 'farm'
                           check (run_type in ('farm', 'tournament', 'milestone')),
  tier                   integer not null check (tier > 0),
  tier_suffix            text check (tier_suffix in ('+')),
  wave                   integer not null check (wave >= 0),
  killed_by              text not null default '',
  game_time_sec          integer not null default 0 check (game_time_sec >= 0),
  real_time_sec          integer not null default 0 check (real_time_sec >= 0),
  dissonance_multiplier  numeric not null default 1.0 check (dissonance_multiplier > 0),
  excluded               boolean not null default false,
  notes                  text not null default '',
  game_version           text,

  -- Time. battle_date is the parsed value and older exports omit it, so
  -- entered_date exists as the explicit user-supplied fallback. importedAt is
  -- deliberately NOT a substitute for either: batch-importing a week of runs
  -- collapses the elapsed window toward zero and inflates realized income by
  -- however many days were collapsed.
  battle_date            timestamptz,
  entered_date           date,
  imported_at            timestamptz not null default now(),

  tournament_result_id   uuid references public.tournament_results(id) on delete set null,

  -- The parsed report, and the paste it came from.
  fields                 jsonb not null default '{}'::jsonb
                           check (jsonb_typeof(fields) = 'object'),
  raw                    jsonb not null default '{}'::jsonb
                           check (jsonb_typeof(raw) = 'object'),
  raw_text               text,
  parser_version         integer not null default 0,

  content_hash           text not null,
  deleted_at             timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  -- Only a tournament run may carry a tournament result. The reverse is not
  -- constrained: a tournament run whose league is still unknown is normal.
  constraint run_tournament_link check (
    tournament_result_id is null or run_type = 'tournament'
  )
);

comment on column public.runs.raw_text is
  'The original pasted Battle Report, verbatim. Without it no parser fix is retroactive. Null marks a run imported before the fix — unverifiable, not wrong.';
comment on column public.runs.parser_version is
  'Which parser produced `fields`. A background re-parse selects on this; 0 means pre-versioning.';
comment on column public.runs.content_hash is
  'Hash of the normalized raw_text. Makes a double-paste a no-op and gives the outbox an idempotency key.';
comment on column public.runs.entered_date is
  'User-supplied date for exports with no battleDate. If both are null, realized income for the window is unavailable — report it as such rather than substituting imported_at.';

-- Re-importing a run you deleted should work, so the uniqueness only covers
-- live rows.
create unique index runs_user_content_hash_key
  on public.runs (user_id, content_hash)
  where deleted_at is null;

-- The Tier Lab's two access paths.
create index runs_user_battle_date_idx
  on public.runs (user_id, battle_date desc)
  where deleted_at is null;

create index runs_user_tier_idx
  on public.runs (user_id, tier)
  where deleted_at is null and not excluded;

-- The sync cursor. No partial predicate: a pull has to see tombstones, or a
-- delete on one device never reaches the other.
create index runs_user_updated_at_idx
  on public.runs (user_id, updated_at);

create index runs_tournament_result_idx
  on public.runs (tournament_result_id)
  where tournament_result_id is not null;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create trigger runs_set_updated_at
  before update on public.runs
  for each row execute function public.set_updated_at();

create trigger tournament_results_set_updated_at
  before update on public.tournament_results
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.runs enable row level security;
alter table public.tournament_results enable row level security;

revoke all on public.runs, public.tournament_results from anon, authenticated;
grant select, insert, update, delete on public.runs, public.tournament_results to authenticated;

create policy runs_own_rows on public.runs
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy tournament_results_own_rows on public.tournament_results
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
